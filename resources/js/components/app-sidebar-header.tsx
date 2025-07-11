import React from 'react';
import AppSidebar from './app-sidebar';
import { AppContent } from './app-content';
import { AppHeader } from './app-header';

interface AppSidebarHeaderProps {
  children?: React.ReactNode;
}

const AppSidebarHeader: React.FC<AppSidebarHeaderProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <AppHeader />
        <AppContent>{children}</AppContent>
      </div>
    </div>
  );
};

export default AppSidebarHeader;
