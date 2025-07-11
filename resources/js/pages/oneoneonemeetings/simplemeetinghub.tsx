import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React from 'react';

interface SimpleMeetingHubProps {
    orgNode: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        title: string;
    };
}

const SimpleMeetingHub: React.FC<SimpleMeetingHubProps> = ({ orgNode }) => {
    return (
        <AppLayout>
            <Head title={`1:1 Meetings with ${orgNode.first_name}`} />

            <div className="container py-6">
                <h1 className="text-2xl font-bold">
                    1:1 Meetings with {orgNode.first_name} {orgNode.last_name}
                </h1>
                <p className="mt-2 text-gray-600">This is a simplified version of the 1:1 Meeting Hub page.</p>

                <div className="mt-8">
                    <h2 className="text-xl font-semibold">Direct Report Information</h2>
                    <div className="mt-4 rounded-lg bg-white p-4 shadow">
                        <p>
                            <strong>Name:</strong> {orgNode.first_name} {orgNode.last_name}
                        </p>
                        <p>
                            <strong>Email:</strong> {orgNode.email}
                        </p>
                        <p>
                            <strong>Title:</strong> {orgNode.title}
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default SimpleMeetingHub;
