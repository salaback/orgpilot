import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Employee } from '@/types';
import { EmployeeCard } from '@/pages/organisation/org-node-card';
import { EmployeeListView } from '@/pages/organisation/org-list-view';
import { AddDirectReportSheet } from '@/pages/organisation/add-direct-report-sheet';
import { Button } from '@/components/ui/button';
import { ChevronUp, Users } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import axios from 'axios';
import { getCookie, setCookie } from '@/lib/cookies';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

interface IndexProps {
  orgStructure: {
    id: number;
    name: string;
    description: string;
    is_primary: boolean;
  };
  rootEmployee: Employee;
  directReports: Employee[];
  // New props for direct node navigation
  focusedEmployee?: Employee | null;
  currentReports?: Employee[];
  initialFocus?: boolean;
}

export default function Index({ orgStructure, rootEmployee, directReports, focusedEmployee: initialFocusedEmployee, currentReports: initialCurrentReports }: IndexProps) {
  const [isAddingDirectReport, setIsAddingDirectReport] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [focusedEmployee, setFocusedEmployee] = useState<Employee | null>(initialFocusedEmployee || null);
  const [employeeHierarchy, setEmployeeHierarchy] = useState<Employee[]>([]);
  const [currentReports, setCurrentReports] = useState<Employee[]>(initialCurrentReports || directReports);
  const [highlightedManagerId, setHighlightedManagerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListView, setIsListView] = useState(false);

  // Define standard breadcrumbs for the organization page
  const breadcrumbs: BreadcrumbItemType[] = [
    {
      title: 'Organisation',
      href: '/organisation',
    }
  ];

  // Add focused node to breadcrumbs if available
  if (focusedEmployee) {
    breadcrumbs.push({
      title: focusedEmployee.full_name,
      href: `/organisation/${focusedEmployee.id}`,
    });
  }

  // Find a specific node by ID
  const findEmployeeById = (id: number): Employee | null => {
    if (rootEmployee.id === id) return rootEmployee;

    // First check in the current reports (what's currently displayed)
    const currentEmployee = currentReports.find(employee => employee.id === id);
    if (currentEmployee) return currentEmployee;

    // Then check in the original direct reports
    return directReports.find(employee => employee.id === id) || null;
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
    if (focusedEmployee) {
      await loadDirectReportsForEmployee(focusedEmployee.id);
    } else {
      // If we're at the root, reload root's direct reports
      await loadDirectReportsForEmployee(rootEmployee.id);
    }
  };

  // Load direct reports for a specific node
  const loadDirectReportsForEmployee = async (employeeId: number) => {
    setIsLoading(true);
    try {
      console.log(`Loading direct reports for employee ${employeeId}`);
      const response = await axios.get(`/organisation/person/${employeeId}/direct-reports`);
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
    const managerEmployee = findEmployeeById(managerId);

    if (managerEmployee) {
      // Highlight the manager briefly to provide visual feedback
      setHighlightedManagerId(managerId);
      setTimeout(() => {
        setHighlightedManagerId(null);
      }, 2000);

      // Always focus on the manager's organisation when adding a direct report
      // This ensures the user sees the manager's team with the new direct report
      await handleFocusEmployee(managerEmployee);
    }
  };

  // Function to handle opening the add direct report panel
  const handleAddDirectReport = (managerId: number) => {
    setSelectedManagerId(managerId);
    setIsAddingDirectReport(true);
  };

  // Function to handle focusing on a specific node
  const handleFocusEmployee = async (employee: Employee) => {
    // Allow focusing on any node to see its direct reports
    setFocusedEmployee(employee);

    // If we're focusing on the root node, reset the hierarchy
    if (employee.id === rootEmployee.id) {
      setEmployeeHierarchy([]);
    } else {
      // When focusing on a direct report, we need to check if we're:
      // 1. Going deeper from root (need to start a new path)
      // 2. Going to a peer of current focus (need to replace last item)
      // 3. Going to a completely different branch (need to create new path)

      // Get the manager of this node if available
      const managerId = employee.manager_id;
      const isFromRoot = !focusedEmployee || focusedEmployee.id === rootEmployee.id;

      let newHierarchy = [...employeeHierarchy];

      // If we're coming from root, start a new path
      if (isFromRoot) {
        newHierarchy = [employee];
      }
      // If we're coming from the node's manager, add to the path
      else if (managerId === focusedEmployee?.id) {
        newHierarchy.push(employee);
      }
      // If we're navigating to a peer or unrelated node, start a new path
      else {
        newHierarchy = [employee];
      }

      setEmployeeHierarchy(newHierarchy);
    }

    // Load direct reports for the focused node
    await loadDirectReportsForEmployee(employee.id);
  };

  // Function to navigate up one level in the hierarchy
  const handleNavigateUp = async () => {
    if (employeeHierarchy.length === 0) {
      // If we're already at the root, there's nowhere to go up to
      return;
    }

    // Remove the last node from our hierarchy
    const newHierarchy = [...employeeHierarchy];
    newHierarchy.pop();

    if (newHierarchy.length === 0) {
      // If we're going back to the root
      setFocusedEmployee(null);
      await loadDirectReportsForEmployee(rootEmployee.id);
    } else {
      // Otherwise, focus on the new last node in our hierarchy
      const parentEmployee = newHierarchy[newHierarchy.length - 1];
      setFocusedEmployee(parentEmployee);
      await loadDirectReportsForEmployee(parentEmployee.id);
    }

    setEmployeeHierarchy(newHierarchy);

    // Update the URL to reflect the current node
    const navigateId = newHierarchy[newHierarchy.length - 1]?.id || rootEmployee.id;
    router.visit(`/organisation/${navigateId}`, { preserveState: true });
  };

  // Navigate to the root level organisation
  const handleNavigateToRoot = async () => {
    setFocusedEmployee(null);
    setEmployeeHierarchy([]);
    await loadDirectReportsForEmployee(rootEmployee.id);

    // Update the URL to reflect the root organisation view
    router.visit('/organisation', { preserveState: true, replace: true });
  };

  // Handler for viewing a node's profile
  const handleViewProfile = (employee: Employee) => {
    // Navigate to the new profile page
    router.visit(`/organisation/profile/${employee.id}`);
  };

  // Navigate up one level
  const navigateUp = () => {
    if (employeeHierarchy.length === 0) {
      // If we're already at the root, there's nowhere to go up to
      return;
    }

    // Remove the last node from our hierarchy
    const newHierarchy = [...employeeHierarchy];
    newHierarchy.pop();

    if (newHierarchy.length === 0) {
      // If we're going back to the root
      setFocusedEmployee(null);
      loadDirectReportsForEmployee(rootEmployee.id);
    } else {
      // Otherwise, focus on the new last node in our hierarchy
      const parentEmployee = newHierarchy[newHierarchy.length - 1];
      setFocusedEmployee(parentEmployee);
      loadDirectReportsForEmployee(parentEmployee.id);
    }

    setEmployeeHierarchy(newHierarchy);

    // Update the URL to reflect the current node
    const navigateId = newHierarchy[newHierarchy.length - 1]?.id || rootEmployee.id;
    router.visit(`/organisation/${navigateId}`, { preserveState: true });
  };

  // Navigate to the root node
  const navigateToRoot = () => {
    setFocusedEmployee(null);
    setEmployeeHierarchy([]);
    loadDirectReportsForEmployee(rootEmployee.id);

    // Update the URL to reflect the root organisation view
    router.visit('/organisation', { preserveState: true, replace: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Organisation - ${orgStructure.name}`} />

      {/* Simplified header without toggle buttons, since toggle is now in the app sidebar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">{orgStructure.name.replace('Organization', 'Organisation')}</h1>
            {focusedEmployee && (
              <p className="text-sm text-muted-foreground mt-1">
                Currently viewing: <span className="font-medium">{focusedEmployee.full_name}'s Organisation</span>
                {/* Show manager indicator if not viewing the root node */}
                {focusedEmployee.manager_id && focusedEmployee.id !== rootEmployee.id && (
                  <span className="text-sm text-muted-foreground ml-1">
                    • Reports to: <span className="font-medium cursor-pointer hover:text-primary" onClick={navigateUp}>
                      {focusedEmployee.manager_id === rootEmployee.id
                        ? rootEmployee.full_name
                        : "Manager"}
                    </span>
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Organization Navigation */}
            {(focusedEmployee || employeeHierarchy.length > 0) && (
              <>
                {/* Show "Up One Level" button if viewing a manager who isn't the root */}
                {focusedEmployee && focusedEmployee.id !== rootEmployee.id && (
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
        <div className={`relative bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 ${focusedEmployee ? 'border-l-4 border-primary' : ''}`}>
          {focusedEmployee && (
            <div className="absolute top-0 left-0 w-1 bg-primary h-full"></div>
          )}

          {/* Breadcrumb navigation - Hide since we don't allow drilling down */}
          {false && (focusedEmployee || employeeHierarchy.length > 0) && (
            <div className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={handleNavigateToRoot} className="cursor-pointer">
                      {rootEmployee.full_name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {employeeHierarchy.map((employee, index) => (
                    <React.Fragment key={employee.id}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {index < employeeHierarchy.length - 1 ? (
                          <BreadcrumbLink
                            onClick={() => {
                              // Navigate to this specific level in the hierarchy
                              const newHierarchy = employeeHierarchy.slice(0, index + 1);
                              setEmployeeHierarchy(newHierarchy);
                              setFocusedEmployee(employee);
                              // This is simplified; in a deeper hierarchy we'd need to find the correct reports
                            }}
                            className="cursor-pointer"
                          >
                            {employee.full_name}
                          </BreadcrumbLink>
                        ) : (
                          <span>{employee.full_name}</span>
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
              <div className={`mb-8 relative ${highlightedManagerId === (focusedEmployee?.id || rootEmployee.id) ? 'animate-pulse' : ''}`}>
                {/* Visual indicator for current manager's context */}
                {focusedEmployee && (
                  <div className="absolute -left-4 -right-4 -top-4 bottom-4 bg-primary/5 rounded-lg -z-10"></div>
                )}

                <EmployeeCard
                  node={focusedEmployee || rootEmployee}
                  onAddDirectReport={handleAddDirectReport}
                  onViewProfile={handleViewProfile} // Pass the view profile handler
                />

                {/* Back up button if we're not at the root - Hide since we don't allow drilling down */}
                {false && focusedEmployee && (
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
            {!isListView && focusedEmployee && currentReports.length > 0 && (
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
                <div className={`mt-4 w-full ${focusedEmployee ? 'bg-primary/5 p-6 rounded-lg' : ''}`}>
                  <h2 className="text-lg font-medium mb-4 text-center">
                    {focusedEmployee ? `${focusedEmployee.full_name}'s Team` : 'Direct Reports'}
                  </h2>
                  {isListView ? (
                    <EmployeeListView
                      rootEmployee={focusedEmployee || rootEmployee}
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
                          <EmployeeCard
                            node={report}
                            onAddDirectReport={handleAddDirectReport}
                            onViewProfile={handleViewProfile} // Pass the view profile handler
                            // Remove the ability to focus on direct reports
                            onFocus={handleFocusEmployee}
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
        open={isAddingDirectReport}
        onClose={() => setIsAddingDirectReport(false)}
        manager={focusedEmployee || rootEmployee}
        onSuccess={async (managerId) => {
          await handleDirectReportSuccess(managerId);
          setIsAddingDirectReport(false);
        }}
      />
    </AppLayout>
  );
}
