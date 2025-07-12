import { AppSidebar } from '@/layouts/app/app-sidebar-layout';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, ...props }: AppLayoutProps) => (
    <AppShell variant="sidebar">
        <AppSidebar />
        <SidebarInset {...props}>
            {children}
        </SidebarInset>
    </AppShell>
);
