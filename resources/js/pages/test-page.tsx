import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

const TestPage = () => {
  return (
    <AppLayout>
      <Head title="Test Page" />
      <div className="container p-6">
        <h1 className="text-2xl font-bold">Test Page</h1>
        <p className="mt-4">If you can see this page, Inertia.js is working correctly!</p>
      </div>
    </AppLayout>
  );
};

export default TestPage;
