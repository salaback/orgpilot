import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export * from './task';
export * from './meeting';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string;
    name?: string; // Virtual attribute
}

// Organization Types
export interface Employee {
    id: number;
    org_structure_id: number;
    name: string;
    title: string;
    email: string | null;
    status: 'active' | 'open' | 'former';
    node_type: 'person' | 'placeholder';
    manager_id: number | null;
    start_date: string | null;
    end_date: string | null;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
    directReports?: Employee[];
    direct_reports_count?: number;
    first_name: string;
    last_name: string;
    full_name: string;
}

export interface OrgStructure {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}
