import { Button } from '@/components/ui/button';
import { Columns, ListChecks } from 'lucide-react';
import React from 'react';

type ViewMode = 'list' | 'columns';

interface InitiativeViewToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

const InitiativeViewToggle: React.FC<InitiativeViewToggleProps> = ({ viewMode, onViewModeChange }) => {
    return (
        <div className="flex items-center overflow-hidden rounded-md border">
            <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none border-0"
            >
                <ListChecks className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">List View</span>
            </Button>
            <Button
                variant={viewMode === 'columns' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('columns')}
                className="rounded-none border-0"
            >
                <Columns className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Column View</span>
            </Button>
        </div>
    );
};

export default InitiativeViewToggle;
