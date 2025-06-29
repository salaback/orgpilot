import React from 'react';
import { AppHeader } from '@/components/app-header';
import { PropsWithChildren } from 'react';

interface AppLayoutProps {
  title?: string;
  breadcrumbs?: { title: string; href: string }[];
}

export default function AppLayout({
  children,
  title,
  breadcrumbs = []
}: PropsWithChildren<AppLayoutProps>) {
  // Add the current page as the last breadcrumb if title is provided
  const pageBreadcrumbs = title
    ? [...breadcrumbs, { title, href: '#' }]
    : breadcrumbs;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader breadcrumbs={pageBreadcrumbs} />
      <main className="max-w-7xl mx-auto px-4">{children}</main>
    </div>
  );
}
