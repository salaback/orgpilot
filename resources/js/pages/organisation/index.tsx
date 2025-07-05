import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { OrgNode } from '@/types';
import { OrgNodeCard } from '@/pages/organisation/org-node-card';
import { OrgListView } from '@/pages/organisation/org-list-view';
import { AddDirectReportSheet } from '@/pages/organisation/add-direct-report-sheet';
import { Button } from '@/components/ui/button';
import { ChevronUp, Users } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import axios from 'axios';
import { getCookie, setCookie } from '@/lib/cookies';

interface IndexProps {
  orgStructure: {
    id: number;
    name: string;
    description: string;
    is_primary: boolean;
  };
  rootNode: OrgNode;
  directReports: OrgNode[];
  // New props for direct node navigation
  focusedNode?: OrgNode | null;
  currentReports?: OrgNode[];
  initialFocus?: boolean;
}

export default function Index({ orgStructure, rootNode, directReports, focusedNode: initialFocusedNode, currentReports: initialCurrentReports }: IndexProps) {
  const [isAddingDirectReport, setIsAddingDirectReport] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [focusedNode, setFocusedNode] = useState<OrgNode | null>(initialFocusedNode || null);
  const [nodeHierarchy, setNodeHierarchy] = useState<OrgNode[]>([]);
  const [currentReports, setCurrentReports] = useState<OrgNode[]>(initialCurrentReports || directReports);
  const [highlightedManagerId, setHighlightedManagerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListView, setIsListView] = useState(false);

  // Find a specific node by ID
  const findNodeById = (id: number): OrgNode | null => {
    if (rootNode.id === id) return rootNode;

    // First check in the current reports (what's currently displayed)
    const currentNode = currentReports.find(node => node.id === id);
    if (currentNode) return currentNode;

    // Then check in the original direct reports
    return directReports.find(node => node.id === id) || null;
  };

  // Initialize the view mode from localStorage
  React.useEffect(() => {
    const savedMode = localStorage.getItem('orgViewMode');
    if (savedMode === 'list') {
      setIsListView(true);
    } else {
      setIsListView(false);
    }

    // Listen for view mode changes from app-sidebar toggle
    const handleViewModeChange = (event: CustomEvent) => {
      if (event.detail && typeof event.detail.isListView === 'boolean') {
        setIsListView(event.detail.isListView);
      }
    };

    window.addEventListener('orgViewModeChange', handleViewModeChange as EventListener);

    return () => {
      window.removeEventListener('orgViewModeChange', handleViewModeChange as EventListener);
    };
  }, []);

  // Refresh the view after adding a direct report
  const refreshView = async () => {
    if (focusedNode) {
      await loadDirectReportsForNode(focusedNode.id);
    } else {
      // If we're at the root, reload root's direct reports
      await loadDirectReportsForNode(rootNode.id);
    }
  };

  // Load direct reports for a specific node
  const loadDirectReportsForNode = async (nodeId: number) => {
    setIsLoading(true);
    try {
      console.log(`Loading direct reports for node ${nodeId}`);
      const response = await axios.get(`/organisation/person/${nodeId}/direct-reports`);
      const reports = response.data.directReports || [];
      console.log(`Received ${reports.length} direct reports`, reports);
      setCurrentReports(reports);
      setIsLoading(false);
      return reports;
    } catch (error) {
      console.error('Error fetching direct reports:', error);
      setIsLoading(false);
      return [];
    }
  };

  // Handle successful direct report addition
  const handleDirectReportSuccess = async (managerId: number) => {
    // Find the manager node
    const managerNode = findNodeById(managerId);

    if (managerNode) {
      // Highlight the manager briefly to provide visual feedback
      setHighlightedManagerId(managerId);
      setTimeout(() => {
        setHighlightedManagerId(null);
      }, 2000);

      // Always focus on the manager's organisation when adding a direct report
      // This ensures the user sees the manager's team with the new direct report
      await handleFocusNode(managerNode);
    }
  };

  // Function to handle opening the add direct report panel
  const handleAddDirectReport = (managerId: number) => {
    setSelectedManagerId(managerId);
    setIsAddingDirectReport(true);
  };

  // Function to handle focusing on a specific node
  const handleFocusNode = async (node: OrgNode) => {
    // Allow focusing on any node to see its direct reports
    setFocusedNode(node);

    // If we're focusing on the root node, reset the hierarchy
    if (node.id === rootNode.id) {
      setNodeHierarchy([]);
    } else {
      // When focusing on a direct report, we need to check if we're:
      // 1. Going deeper from root (need to start a new path)
      // 2. Going to a peer of current focus (need to replace last item)
      // 3. Going to a completely different branch (need to create new path)

      // Get the manager of this node if available
      const managerId = node.manager_id;
      const isFromRoot = !focusedNode || focusedNode.id === rootNode.id;

      let newHierarchy = [...nodeHierarchy];

      // If we're coming from root, start a new path
      if (isFromRoot) {
        newHierarchy = [node];
      }
      // If we're coming from the node's manager, add to the path
      else if (managerId === focusedNode?.id) {
        newHierarchy.push(node);
      }
      // If we're navigating to a peer or unrelated node, start a new path
      else {
        newHierarchy = [node];
      }

      setNodeHierarchy(newHierarchy);
    }

    // Load direct reports for the focused node
    await loadDirectReportsForNode(node.id);
  };

  // Function to navigate up one level in the hierarchy
  const handleNavigateUp = async () => {
    if (nodeHierarchy.length === 0) {
      // If we're already at the root, there's nowhere to go up to
      return;
    }

    // Remove the last node from our hierarchy
    const newHierarchy = [...nodeHierarchy];
    newHierarchy.pop();

    if (newHierarchy.length === 0) {
      // If we're going back to the root
      setFocusedNode(null);
      await loadDirectReportsForNode(rootNode.id);
    } else {
      // Otherwise, focus on the new last node in our hierarchy
      const parentNode = newHierarchy[newHierarchy.length - 1];
      setFocusedNode(parentNode);
      await loadDirectReportsForNode(parentNode.id);
    }

    setNodeHierarchy(newHierarchy);

    // Update the URL to reflect the current node
    const navigateId = newHierarchy[newHierarchy.length - 1]?.id || rootNode.id;
    router.visit(`/organisation/${navigateId}`, { preserveState: true });
  };

  // Navigate to the root level organisation
  const handleNavigateToRoot = async () => {
    setFocusedNode(null);
    setNodeHierarchy([]);
    await loadDirectReportsForNode(rootNode.id);

    // Update the URL to reflect the root organisation view
    router.visit('/organisation', { preserveState: true, replace: true });
  };

  // Handler for viewing a node's profile
  const handleViewProfile = (node: OrgNode) => {
    // Navigate to the new profile page
    router.visit(`/organisation/profile/${node.id}`);
  };

  // Navigate up one level
  const navigateUp = () => {
    if (nodeHierarchy.length === 0) {
      // If we're already at the root, there's nowhere to go up to
      return;
    }

    // Remove the last node from our hierarchy
    const newHierarchy = [...nodeHierarchy];
    newHierarchy.pop();

    if (newHierarchy.length === 0) {
      // If we're going back to the root
      setFocusedNode(null);
      loadDirectReportsForNode(rootNode.id);
    } else {
      // Otherwise, focus on the new last node in our hierarchy
      const parentNode = newHierarchy[newHierarchy.length - 1];
      setFocusedNode(parentNode);
      loadDirectReportsForNode(parentNode.id);
    }

    setNodeHierarchy(newHierarchy);

    // Update the URL to reflect the current node
    const navigateId = newHierarchy[newHierarchy.length - 1]?.id || rootNode.id;
    router.visit(`/organisation/${navigateId}`, { preserveState: true });
  };

  // Navigate to the root node
  const navigateToRoot = () => {
    setFocusedNode(null);
    setNodeHierarchy([]);
    loadDirectReportsForNode(rootNode.id);

    // Update the URL to reflect the root organisation view
    router.visit('/organisation', { preserveState: true, replace: true });
  };

  return (
    <AppLayout>
      <Head title={`Organisation - ${orgStructure.name}`} />

      {/* Simplified header without toggle buttons, since toggle is now in the app sidebar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">{orgStructure.name.replace('Organization', 'Organisation')}</h1>
            {focusedNode && (
              <p className="text-sm text-muted-foreground mt-1">
                Currently viewing: <span className="font-medium">{focusedNode.full_name}'s Organisation</span>
                {/* Show manager indicator if not viewing the root node */}
                {focusedNode.manager_id && focusedNode.id !== rootNode.id && (
                  <span className="text-sm text-muted-foreground ml-1">
                    • Reports to: <span className="font-medium cursor-pointer hover:text-primary" onClick={navigateUp}>
                      {focusedNode.manager_id === rootNode.id
                        ? rootNode.full_name
                        : "Manager"}
                    </span>
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Organization Navigation */}
            {(focusedNode || nodeHierarchy.length > 0) && (
              <>
                {/* Show "Up One Level" button if viewing a manager who isn't the root */}
                {focusedNode && focusedNode.id !== rootNode.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateUp}
                    className="flex items-center gap-1"
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span>Up One Level</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToRoot}
                  className="flex items-center gap-1"
                >
                  <Users className="h-4 w-4" />
                  <span>Full Organization</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        {/* Current view indicator */}
        <div className={`relative bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 ${focusedNode ? 'border-l-4 border-primary' : ''}`}>
          {focusedNode && (
            <div className="absolute top-0 left-0 w-1 bg-primary h-full"></div>
          )}

          {/* Breadcrumb navigation - Hide since we don't allow drilling down */}
          {false && (focusedNode || nodeHierarchy.length > 0) && (
            <div className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={handleNavigateToRoot} className="cursor-pointer">
                      {rootNode.full_name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {nodeHierarchy.map((node, index) => (
                    <React.Fragment key={node.id}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {index < nodeHierarchy.length - 1 ? (
                          <BreadcrumbLink
                            onClick={() => {
                              // Navigate to this specific level in the hierarchy
                              const newHierarchy = nodeHierarchy.slice(0, index + 1);
                              setNodeHierarchy(newHierarchy);
                              setFocusedNode(node);
                              // This is simplified; in a deeper hierarchy we'd need to find the correct reports
                            }}
                            className="cursor-pointer"
                          >
                            {node.full_name}
                          </BreadcrumbLink>
                        ) : (
                          <span>{node.full_name}</span>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}

          <div className="flex flex-col items-center">
            {/* Display either the focused node or the root node - but only in grid view */}
            {!isListView && (
              <div className={`mb-8 relative ${highlightedManagerId === (focusedNode?.id || rootNode.id) ? 'animate-pulse' : ''}`}>
                {/* Visual indicator for current manager's context */}
                {focusedNode && (
                  <div className="absolute -left-4 -right-4 -top-4 bottom-4 bg-primary/5 rounded-lg -z-10"></div>
                )}

                <OrgNodeCard
                  node={focusedNode || rootNode}
                  onAddDirectReport={handleAddDirectReport}
                  onViewProfile={handleViewProfile} // Pass the view profile handler
                />

                {/* Back up button if we're not at the root - Hide since we don't allow drilling down */}
                {false && focusedNode && (
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={handleNavigateUp}
                    >
                      <ChevronUp className="h-4 w-4" />
                      <span>View Manager</span>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Team context visual indicator - only in grid view */}
            {!isListView && focusedNode && currentReports.length > 0 && (
              <div className="w-0.5 h-8 bg-primary/50"></div>
            )}

            {/* Loading indicator */}
            {isLoading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              /* Display current reports (either direct reports of root or focused node) */
              currentReports.length > 0 && (
                <div className={`mt-4 w-full ${focusedNode ? 'bg-primary/5 p-6 rounded-lg' : ''}`}>
                  <h2 className="text-lg font-medium mb-4 text-center">
                    {focusedNode ? `${focusedNode.full_name}'s Team` : 'Direct Reports'}
                  </h2>
                  {isListView ? (
                    <OrgListView
                      rootNode={focusedNode || rootNode}
                      initialReports={currentReports}
                      onAddDirectReport={handleAddDirectReport}
                      onViewProfile={handleViewProfile}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {currentReports.map(report => (
                        <div
                          key={report.id}
                          className={`flex flex-col items-center ${highlightedManagerId === report.id ? 'animate-pulse' : ''}`}
                        >
                          <OrgNodeCard
                            node={report}
                            onAddDirectReport={handleAddDirectReport}
                            onViewProfile={handleViewProfile} // Pass the view profile handler
                            // Remove the ability to focus on direct reports
                            onFocus={handleFocusNode}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Add direct report slide-out panel */}
      <AddDirectReportSheet
        isOpen={isAddingDirectReport}
        onClose={() => {
          setIsAddingDirectReport(false);
          setSelectedManagerId(null);
        }}
        managerId={selectedManagerId || rootNode.id}
        onSuccess={async (managerId) => {
          await handleDirectReportSuccess(managerId);
          // Refresh the view to show the newly added direct report
          refreshView();
        }}
      />
    </AppLayout>
  );
}
