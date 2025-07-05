import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CalendarDaysIcon, ListIcon } from 'lucide-react';

interface MeetingViewToggleProps {
  viewMode: 'calendar' | 'list';
  onViewModeChange: (mode: 'calendar' | 'list') => void;
}

export default function MeetingViewToggle({
  viewMode,
  onViewModeChange,
}: MeetingViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(value) => {
        if (value) onViewModeChange(value as 'calendar' | 'list');
      }}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="calendar" className="gap-1">
        <CalendarDaysIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Calendar</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="list" className="gap-1">
        <ListIcon className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
