import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import TaskViewToggle from '@/components/task-view-toggle';
import OrgViewToggle from '@/components/org-view-toggle';
import InitiativeViewToggle from '@/components/initiative-view-toggle';
import { usePathname } from '@/hooks/use-pathname';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { getCookie, setCookie } from '@/lib/cookies';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const pathname = usePathname();
    const isTasksPage = pathname === '/tasks' || pathname.startsWith('/tasks/');
    const isOrgPage = pathname === '/organisation' || pathname.startsWith('/organisation/');
    const isInitiativesPage = pathname === '/initiatives' || pathname.startsWith('/initiatives/');

    // Task view state (list/split)
    const [taskViewMode, setTaskViewMode] = useState<'list' | 'split'>(() => {
        // Try to get from cookie first
        if (typeof document !== 'undefined') {
            const cookieValue = getCookie('taskViewMode');
            if (cookieValue === 'list' || cookieValue === 'split') {
                return cookieValue as 'list' | 'split';
            }
        }

        // Fall back to localStorage for backward compatibility
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('taskViewMode');
            return (savedMode === 'list' || savedMode === 'split') ? savedMode as 'list' | 'split' : 'list';
        }
        return 'list';
    });

    // Organization view state (grid/list)
    const [orgViewMode, setOrgViewMode] = useState<'grid' | 'list'>(() => {
        // Try to get from cookie first
        if (typeof document !== 'undefined') {
            const cookieValue = getCookie('orgViewMode');
            if (cookieValue === 'grid' || cookieValue === 'list') {
                return cookieValue as 'grid' | 'list';
            }
        }

        // Fall back to localStorage for backward compatibility
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('orgViewMode');
            return savedMode === 'list' ? 'list' : 'grid';
        }
        return 'grid'; // Default to grid view
    });

    // Initiative view state (list/columns)
    const [initiativeViewMode, setInitiativeViewMode] = useState<'list' | 'columns'>(() => {
        // Try to get from cookie first
        if (typeof document !== 'undefined') {
            const cookieValue = getCookie('initiativeViewMode');
            if (cookieValue === 'list' || cookieValue === 'columns') {
                return cookieValue as 'list' | 'columns';
            }
        }

        // Fall back to localStorage for backward compatibility
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('initiativeViewMode');
            return (savedMode === 'list' || savedMode === 'columns') ? savedMode as 'list' | 'columns' : 'columns';
        }
        return 'columns'; // Default to columns view
    });

    // Update task view mode and save to cookie/localStorage
    const handleTaskViewModeChange = (mode: 'list' | 'split') => {
        setTaskViewMode(mode);
        setCookie('taskViewMode', mode);
        localStorage.setItem('taskViewMode', mode); // For backward compatibility
    };

    // Update org view mode and save to cookie/localStorage
    const handleOrgViewModeChange = (mode: 'grid' | 'list') => {
        setOrgViewMode(mode);
        setCookie('orgViewMode', mode);
        localStorage.setItem('orgViewMode', mode); // For backward compatibility

        // Dispatch custom event for existing components that might listen for changes
        const event = new CustomEvent('orgViewModeChange', {
            detail: { isListView: mode === 'list' }
        });
        window.dispatchEvent(event);
    };

    // Update initiative view mode and save to cookie/localStorage
    const handleInitiativeViewModeChange = (mode: 'list' | 'columns') => {
        setInitiativeViewMode(mode);
        setCookie('initiativeViewMode', mode);
        localStorage.setItem('initiativeViewMode', mode); // For backward compatibility

        // Dispatch custom event for existing components that might listen for changes
        const event = new CustomEvent('initiativeViewModeChange', {
            detail: { viewMode: mode }
        });
        window.dispatchEvent(event);
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 flex-grow">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2">
                {isOrgPage && (
                    <OrgViewToggle
                        viewMode={orgViewMode}
                        onViewModeChange={handleOrgViewModeChange}
                    />
                )}

                {isInitiativesPage && (
                    <InitiativeViewToggle
                        viewMode={initiativeViewMode}
                        onViewModeChange={handleInitiativeViewModeChange}
                    />
                )}

                {isTasksPage && (
                    <TaskViewToggle
                        viewMode={taskViewMode}
                        onViewModeChange={handleTaskViewModeChange}
                    />
                )}
            </div>
        </header>
    );
}
