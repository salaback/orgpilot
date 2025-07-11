import { Button } from '@/components/ui/button';
import { ViewHeader, ViewMode } from '@/components/view-header';
import { ArrowDownAZIcon, FilterIcon, PlusIcon } from 'lucide-react';

type InitiativeViewMode = 'list' | 'columns';

interface InitiativeViewHeaderProps {
    title: string;
    description?: string;
    viewMode: InitiativeViewMode;
    onViewModeChange: (mode: InitiativeViewMode) => void;
    onAddInitiative?: () => void;
    filterActive?: boolean;
    onToggleFilter?: () => void;
    onToggleSort?: () => void;
    sortActive?: boolean;
}

export function InitiativeViewHeader({
    title,
    description,
    viewMode,
    onViewModeChange,
    onAddInitiative,
    filterActive,
    onToggleFilter,
    onToggleSort,
    sortActive,
}: InitiativeViewHeaderProps) {
    // Create action buttons
    const actionButtons = (
        <>
            {/* Initiative actions */}
            {onAddInitiative && (
                <Button variant="outline" size="sm" onClick={onAddInitiative} className="flex items-center gap-1">
                    <PlusIcon className="h-4 w-4" />
                    <span>New Initiative</span>
                </Button>
            )}

            {onToggleSort && (
                <Button variant={sortActive ? 'secondary' : 'outline'} size="sm" onClick={onToggleSort} className="flex items-center gap-1">
                    <ArrowDownAZIcon className="h-4 w-4" />
                    <span>Sort</span>
                </Button>
            )}

            {onToggleFilter && (
                <Button variant={filterActive ? 'secondary' : 'outline'} size="sm" onClick={onToggleFilter} className="flex items-center gap-1">
                    <FilterIcon className="h-4 w-4" />
                    <span>Filter</span>
                </Button>
            )}
        </>
    );

    // Map our internal viewMode names to match what the ViewHeader expects
    const mapViewMode = (mode: InitiativeViewMode): ViewMode => {
        return mode === 'list' ? 'list' : 'split';
    };

    const handleViewModeChange = (mode: ViewMode) => {
        // Map back from ViewHeader's mode names to our component's mode names
        const newMode = mode === 'list' ? 'list' : 'columns';
        onViewModeChange(newMode as InitiativeViewMode);
    };

    return (
        <ViewHeader
            title={title}
            description={description}
            cookieKey={`initiative-view-${title.toLowerCase().replace(/\s+/g, '-')}`}
            defaultViewMode={mapViewMode(viewMode)}
            onViewModeChange={handleViewModeChange}
            actions={actionButtons}
        />
    );
}
