import React, { FormEvent, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { TextField } from '@/components/form/text-field';
import { Button } from '@/components/ui/button';

interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface CompleteProps {
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

      <div className="py-12 flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <h1 className="text-lg font-medium mb-6">Complete Your Profile</h1>

              <p className="mb-6">
                Please provide your first and last name to continue using the application.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <TextField
                  id="first_name"
                  name="first_name"
                  label="First Name"
                  value={data.first_name}
                  onChange={e => setData('first_name', e.target.value)}
                  error={errors.first_name}
                  placeholder="Enter your first name"
                />
                <TextField
                  id="last_name"
                  name="last_name"
                  label="Last Name"
                  value={data.last_name}
                  onChange={e => setData('last_name', e.target.value)}
                  error={errors.last_name}
                  placeholder="Enter your last name"
                />
                <div className="flex items-center justify-end">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save and Continue'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
