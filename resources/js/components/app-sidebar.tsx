import React from 'react';
import { NavMain } from './nav-main';
import { NavFooter } from './nav-footer';
import { NavUser } from './nav-user';
import { type NavItem } from '@/types';
import { Calendar, CheckSquare, LayoutGrid, Target, Users } from 'lucide-react';

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Initiatives',
    href: '/initiatives',
    icon: Target,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Meetings',
    href: '/meetings',
    icon: Calendar,
  },
  {
    title: 'My Organization',
    href: '/organisation',
    icon: Users,
  },
];

const footerNavItems: NavItem[] = [
  // Add footer items here if needed
];

const AppSidebar: React.FC = () => {
  return (
    <aside className="flex w-64 flex-col border-r border-sidebar-border/50 bg-sidebar text-sidebar-foreground">
      <div className="flex flex-1 flex-col gap-2">
        <NavMain items={mainNavItems} />
        <NavFooter items={footerNavItems} />
      </div>
      <NavUser />
    </aside>
  );
};

export default AppSidebar;
