import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Grid2X2 } from 'lucide-react';

type ViewMode = 'grid' | 'list';

interface OrgViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const OrgViewToggle: React.FC<OrgViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <Button
        variant={viewMode === 'grid' ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="rounded-none border-0"
      >
        <Grid2X2 className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Grid View</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="rounded-none border-0"
      >
        <List className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">List View</span>
      </Button>
    </div>
  );
};

export default OrgViewToggle;
