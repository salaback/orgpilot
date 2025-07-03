import React, { FormEvent, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface CompleteProps extends PageProps {
  user: User;
}

export default function Complete({ user }: CompleteProps) {
  const { data, setData, patch, errors, processing } = useForm({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    patch(route('profile.update'));
  };

  return (
    <>
      <Head title="Complete Your Profile" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <h1 className="text-lg font-medium mb-6">Complete Your Profile</h1>

              <p className="mb-6">
                Please provide your first and last name to continue using the application.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={data.first_name}
                    onChange={(e) => setData('first_name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={data.last_name}
                    onChange={(e) => setData('last_name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>

                <div className="flex items-center justify-end mt-6">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={processing}
                  >
                    {processing ? 'Saving...' : 'Save and Continue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
