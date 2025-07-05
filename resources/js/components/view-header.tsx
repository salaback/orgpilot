import React, { ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SplitIcon, LayoutListIcon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { getCookie, setCookie } from '@/lib/cookies';

export type ViewMode = 'list' | 'split' | boolean;

interface ViewHeaderProps {
  title: string;
  description?: ReactNode;
  cookieKey?: string;
  defaultViewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  actions?: ReactNode;
  className?: string;
  showToggleLabels?: boolean;
}

export function ViewHeader({
  title,
  description,
  cookieKey,
  defaultViewMode = 'list',
  onViewModeChange,
  actions,
  className = '',
  showToggleLabels = true,
}: ViewHeaderProps) {
  // Initialize view mode from cookie or default
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);

  // On mount, try to get view mode from cookie
  useEffect(() => {
    if (cookieKey) {
      const savedViewMode = getCookie(`viewMode-${cookieKey}`);
      if (savedViewMode) {
        // Handle boolean values for backward compatibility
        const parsedMode = savedViewMode === 'true' ? true :
                           savedViewMode === 'false' ? false :
                           savedViewMode;
        setViewMode(parsedMode as ViewMode);
        if (onViewModeChange) {
          onViewModeChange(parsedMode as ViewMode);
        }
      }
    }
  }, [cookieKey, onViewModeChange]);

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);

    // Save to cookie if cookieKey is provided
    if (cookieKey && mode) {
      setCookie(`viewMode-${cookieKey}`, String(mode));
    }

    // Call parent handler if provided
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  return (
    <div className={`sticky top-0 z-10 bg-white dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700 shadow-sm mb-6 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            typeof description === 'string' ?
              <p className="text-sm text-muted-foreground mt-1">{description}</p> :
              <div className="text-sm text-muted-foreground mt-1">{description}</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Custom actions */}
          {actions}

          {/* View toggle - only show if onViewModeChange is provided */}
          {onViewModeChange && (
            <ToggleGroup
              type="single"
              value={typeof viewMode === 'boolean' ? (viewMode ? 'split' : 'list') : String(viewMode)}
              onValueChange={(value) => value && handleViewModeChange(value as ViewMode)}
              className="border rounded-md"
            >
              <ToggleGroupItem
                value="list"
                aria-label="Toggle list view"
                title="List View"
                className="data-[state=on]:bg-gray-100 px-2 py-1 flex items-center gap-1"
              >
                <LayoutListIcon className="h-4 w-4" />
                {showToggleLabels && <span className="text-sm font-medium">List View</span>}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="split"
                aria-label="Toggle split view"
                title="Split View"
                className="data-[state=on]:bg-gray-100 px-2 py-1 flex items-center gap-1"
              >
                <SplitIcon className="h-4 w-4" />
                {showToggleLabels && <span className="text-sm font-medium">Split View</span>}
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
      </div>
    </div>
  );
}
