import { AppSidebar } from '@/layouts/app/app-sidebar-layout';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppShell variant="sidebar">
        <AppSidebar />
        <SidebarInset {...props}>
            <AppSidebarHeader breadcrumbs={breadcrumbs} />
            <div className="p-6">
                {children}
            </div>
        </SidebarInset>
    </AppShell>
);
