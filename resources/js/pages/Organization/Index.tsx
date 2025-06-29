import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { OrgNode } from '@/types';
import { OrgNodeCard } from '@/Pages/Organization/OrgNodeCard';
import { AddDirectReportSheet } from '@/Pages/Organization/AddDirectReportSheet';
import { ChevronUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import axios from 'axios';

interface IndexProps {
  orgStructure: {
    id: number;
    name: string;
    description: string;
    is_primary: boolean;
  };
  rootNode: OrgNode;
  directReports: OrgNode[];
}

export default function Index({ orgStructure, rootNode, directReports }: IndexProps) {
  const [isAddingDirectReport, setIsAddingDirectReport] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [focusedNode, setFocusedNode] = useState<OrgNode | null>(null);
  const [nodeHierarchy, setNodeHierarchy] = useState<OrgNode[]>([]);
  const [currentReports, setCurrentReports] = useState<OrgNode[]>(directReports);
  const [highlightedManagerId, setHighlightedManagerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading indicator

  // Find a specific node by ID
  const findNodeById = (id: number): OrgNode | null => {
    if (rootNode.id === id) return rootNode;

    // First check in the current reports (what's currently displayed)
    const currentNode = currentReports.find(node => node.id === id);
    if (currentNode) return currentNode;

    // Then check in the original direct reports
    return directReports.find(node => node.id === id) || null;
  };

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
      const response = await axios.get(`/organization/node/${nodeId}/direct-reports`);
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

      // Always focus on the manager's organization when adding a direct report
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
  };

  // Navigate to the root level organization
  const handleNavigateToRoot = async () => {
    setFocusedNode(null);
    setNodeHierarchy([]);
    await loadDirectReportsForNode(rootNode.id);
  };

  return (
    <AppLayout>
      <Head title="My Organisation" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Current view indicator */}
          <div className={`relative bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 ${focusedNode ? 'border-l-4 border-primary' : ''}`}>
            {focusedNode && (
              <div className="absolute top-0 left-0 w-1 bg-primary h-full"></div>
            )}

            {/* Organization hierarchy header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold">{orgStructure.name}</h1>
                {focusedNode && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Currently viewing: <span className="font-medium">{focusedNode.full_name}'s Organization</span>
                    {/* Show manager indicator if not viewing the root node */}
                    {focusedNode.manager_id && focusedNode.id !== rootNode.id && (
                      <span className="text-sm text-muted-foreground ml-1">
                        • Reports to: <span className="font-medium cursor-pointer hover:text-primary" onClick={handleNavigateUp}>
                          {focusedNode.manager_id === rootNode.id
                            ? rootNode.full_name
                            : (focusedNode.manager?.full_name || "Manager")}
                        </span>
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Organization Navigation */}
              {(focusedNode || nodeHierarchy.length > 0) && (
                <div className="flex items-center gap-2">
                  {/* Show "Up One Level" button if viewing a manager who isn't the root */}
                  {focusedNode && focusedNode.id !== rootNode.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNavigateUp}
                      className="flex items-center gap-1"
                    >
                      <ChevronUp className="h-4 w-4" />
                      <span>Up One Level</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNavigateToRoot}
                    className="flex items-center gap-1"
                  >
                    <Users className="h-4 w-4" />
                    <span>Full Organization</span>
                  </Button>
                </div>
              )}
            </div>

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
              {/* Display either the focused node or the root node */}
              <div className={`mb-8 relative ${highlightedManagerId === (focusedNode?.id || rootNode.id) ? 'animate-pulse' : ''}`}>
                {/* Visual indicator for current manager's context */}
                {focusedNode && (
                  <div className="absolute -left-4 -right-4 -top-4 bottom-4 bg-primary/5 rounded-lg -z-10"></div>
                )}

                <OrgNodeCard
                  node={focusedNode || rootNode}
                  onAddDirectReport={handleAddDirectReport}
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

              {/* Team context visual indicator */}
              {focusedNode && currentReports.length > 0 && (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {currentReports.map(report => (
                        <div
                          key={report.id}
                          className={`flex flex-col items-center ${highlightedManagerId === report.id ? 'animate-pulse' : ''}`}
                        >
                          <OrgNodeCard
                            node={report}
                            onAddDirectReport={handleAddDirectReport}
                            // Remove the ability to focus on direct reports
                            onFocus={handleFocusNode}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
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
