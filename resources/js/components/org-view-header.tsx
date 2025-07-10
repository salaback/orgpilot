import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, Users } from 'lucide-react';
import { Employee } from '@/types';
import { ViewHeader, ViewMode } from '@/components/view-header';

interface OrgViewHeaderProps {
  orgStructure: {
    id: number;
    name: string;
    description: string;
    is_primary: boolean;
  };
  focusedEmployee: Employee | null;
  rootEmployee: Employee;
  employeeHierarchy?: Employee[];
  onNavigateUp: () => void;
  onNavigateToRoot: () => void;
  isListView: boolean;
  setIsListView: (isListView: boolean) => void;
}

export function OrgViewHeader({
  orgStructure,
  focusedEmployee,
  rootEmployee,
  employeeHierarchy = [],
  onNavigateUp,
  onNavigateToRoot,
  isListView,
  setIsListView
}: OrgViewHeaderProps) {
  // Handle view mode change to maintain backward compatibility with boolean
  const handleViewModeChange = (mode: ViewMode) => {
    if (typeof mode === 'string') {
      setIsListView(mode === 'list');
    } else {
      setIsListView(!mode);
    }
  };

  // Create description content as a React element
  const descriptionContent = focusedEmployee && (
    <React.Fragment>
      Currently viewing: <span className="font-medium">{focusedEmployee.full_name}'s Organisation</span>
      {/* Show manager indicator if not viewing the root node */}
      {focusedEmployee.manager_id && focusedEmployee.id !== rootEmployee.id && (
        <span className="text-sm text-muted-foreground ml-1">
          • Reports to: <span className="font-medium cursor-pointer hover:text-primary" onClick={onNavigateUp}>
            {focusedEmployee.manager_id === rootEmployee.id
              ? rootEmployee.full_name
              : "Manager"}
          </span>
        </span>
      )}
    </React.Fragment>
  );

  // Create the action buttons
  const actionButtons = (
    <>
      {/* Organization Navigation */}
      {(focusedEmployee || employeeHierarchy.length > 0) && (
        <>
          {/* Show "Up One Level" button if viewing a manager who isn't the root */}
          {focusedEmployee && focusedEmployee.id !== rootEmployee.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateUp}
              className="flex items-center gap-1"
            >
              <ChevronUp className="h-4 w-4" />
              <span>Up One Level</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToRoot}
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            <span>Full Organization</span>
          </Button>
        </>
      )}
    </>
  );

  return (
    <ViewHeader
      title={orgStructure.name.replace('Organization', 'Organisation')}
      description={descriptionContent}
      cookieKey={`org-view-${orgStructure.id}`}
      defaultViewMode={!isListView} // Convert to match expected format (split = true)
      onViewModeChange={handleViewModeChange}
      actions={actionButtons}
    />
  );
}
