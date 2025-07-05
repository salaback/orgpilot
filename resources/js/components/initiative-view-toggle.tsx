import React from 'react';
import { Button } from '@/components/ui/button';
import { ListChecks, Columns } from 'lucide-react';

type ViewMode = 'list' | 'columns';

interface InitiativeViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const InitiativeViewToggle: React.FC<InitiativeViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <Button
        variant={viewMode === 'list' ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="rounded-none border-0"
      >
        <ListChecks className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">List View</span>
      </Button>
      <Button
        variant={viewMode === 'columns' ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange('columns')}
        className="rounded-none border-0"
      >
        <Columns className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Column View</span>
      </Button>
    </div>
  );
};

export default InitiativeViewToggle;
