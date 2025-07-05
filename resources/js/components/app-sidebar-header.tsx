import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import TaskHeader from '@/components/task-header';
import { usePathname } from '@/hooks/use-pathname';
import { useState, useEffect } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const pathname = usePathname();
    const isTasksPage = pathname === '/tasks' || pathname.startsWith('/tasks/');

    // Initialize with user's preference from localStorage if available
    const [viewMode, setViewMode] = useState<'list' | 'split'>(() => {
        // Only run on client-side
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('taskViewMode');
            return (savedMode === 'list' || savedMode === 'split') ? savedMode as 'list' | 'split' : 'list';
        }
        return 'list';
    });

    // Save preference to localStorage when it changes
    useEffect(() => {
        if (viewMode) {
            localStorage.setItem('taskViewMode', viewMode);
        }
    }, [viewMode]);

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 flex-grow">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {isTasksPage && (
                <TaskHeader viewMode={viewMode} onViewModeChange={setViewMode} />
            )}
        </header>
    );
}
