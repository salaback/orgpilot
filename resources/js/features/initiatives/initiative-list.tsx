import { Inertia } from '@inertiajs/inertia';
import React, { useState } from 'react';
import InitiativeCard from './initiative-card';
import InitiativeModal from './initiative-modal';
import { Initiative } from './types';
import { Employee } from '@/types';

interface InitiativeListProps {
    initiatives: Initiative[];
    assignees: Employee[];
}

const InitiativeList: React.FC<InitiativeListProps> = ({ initiatives, assignees }) => {
    const [modalOpen, setModalOpen] = useState(false);

    const handleCardClick = (initiative: Initiative) => {
        Inertia.visit(`/initiatives/${initiative.id}`);
    };

    return (
        <>
            <table style={{ width: '100%', background: '#fff', borderRadius: 8, borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Assignees</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Tags</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Due Date</th>
                    </tr>
                </thead>
                <tbody>
                    {initiatives.map((initiative: Initiative) => (
                        <tr
                            key={initiative.id}
                            style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                            onClick={() => handleCardClick(initiative)}
                        >
                            <td style={{ padding: 8 }}>
                                <InitiativeCard initiative={initiative} users={assignees} compact />
                            </td>
                            <td style={{ padding: 8 }}>{initiative.status.replace('_', ' ')}</td>
                            <td style={{ padding: 8 }}>
                                {initiative.assignees.length === 0 ? (
                                    <span style={{ color: '#aaa' }}>Backlog</span>
                                ) : (
                                    initiative.assignees.map((id) => {
                                        const user = assignees.find((u) => u.id === id);
                                        return user ? (
                                            <span key={user.id} title={user.email || ''}>
                                                {user.first_name} {user.last_name}
                                            </span>
                                        ) : null;
                                    })
                                )}
                            </td>
                            <td style={{ padding: 8 }}>
                                {Array.isArray(initiative.tags) && initiative.tags.length > 0 ? (
                                    initiative.tags
                                        .map((tag) => {
                                            const tagName = typeof tag === 'object' ? tag.name : tag;
                                            return tagName;
                                        })
                                        .join(', ')
                                ) : (
                                    <span style={{ color: '#aaa' }}>No tags</span>
                                )}
                            </td>
                            <td style={{ padding: 8 }}>{initiative.dueDate || <span style={{ color: '#aaa' }}>No due date</span>}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <InitiativeModal open={modalOpen} onClose={() => setModalOpen(false)} initiative={undefined} assignees={assignees} onSave={() => {}} />
        </>
    );
};

export default InitiativeList;
