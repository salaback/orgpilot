import { Button } from '@/components/ui/button';
import { LayoutListIcon, SplitIcon } from 'lucide-react';
import React from 'react';

type ViewMode = 'list' | 'split';

interface TaskViewToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

const TaskViewToggle: React.FC<TaskViewToggleProps> = ({ viewMode, onViewModeChange }) => {
    return (
        <div className="flex items-center overflow-hidden rounded-md border">
            <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none border-0"
            >
                <LayoutListIcon className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">List View</span>
            </Button>
            <Button
                variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('split')}
                className="rounded-none border-0"
            >
                <SplitIcon className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Split View</span>
            </Button>
        </div>
    );
};

export default TaskViewToggle;
