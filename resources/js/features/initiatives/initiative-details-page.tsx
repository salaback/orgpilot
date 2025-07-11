import { Inertia } from '@inertiajs/inertia';
import React, { useEffect, useState } from 'react';
import NotesSection from '../../components/notes-section';
import TaskManagement from '../../components/task-management-enhanced';
import InitiativeModal from './initiative-modal';
import type { Employee, Task } from '@/types';
// Remove local Task and Tag interfaces and use imported ones

interface Note {
    id: number;
    title?: string;
    content: string;
    created_at: string;
    updated_at: string;
}

interface InitiativeDetailsPageProps {
    initiative: Initiative;
    assignees: Employee[];
    notes?: Note[];
    activeTab?: string; // Add activeTab prop
}

const statusLabels: Record<string, string> = {
    planned: 'Planned',
    'in-progress': 'In Progress',
    complete: 'Complete',
    'on-hold': 'On Hold',
    cancelled: 'Cancelled',
};

const statusColors: Record<string, string> = {
    planned: '#ffd43b',
    'in-progress': '#339af0',
    complete: '#51cf66',
    'on-hold': '#ff922b',
    cancelled: '#ff6b6b',
};

const InitiativeDetailsPage: React.FC<InitiativeDetailsPageProps> = ({
    initiative,
    assignees,
    notes = [],
    activeTab: initialTab = 'overview', // Receive activeTab prop with default value
}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(initialTab); // Initialize with the provided tab
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    // Load tasks for this initiative when the page loads, not just when the tab is clicked
    useEffect(() => {
        setLoadingTasks(true);
        fetch(`/api/initiatives/${initiative.id}/tasks`)
            .then((response) => response.json())
            .then((data) => {
                setTasks(data);
                setLoadingTasks(false);
            })
            .catch((error) => {
                console.error('Failed to load tasks:', error);
                setLoadingTasks(false);
            });
    }, [initiative.id]);

    const handleEdit = () => {
        setModalOpen(true);
    };

    const handleSave = (updatedInitiative: Initiative) => {
        if (!updatedInitiative.id) {
            alert('Initiative ID is missing.');
            return;
        }

        const tags = Array.isArray(updatedInitiative.tags)
            ? updatedInitiative.tags.map((tag) => (typeof tag === 'object' && tag.id ? String(tag.id) : String(tag)))
            : [];

        Inertia.put(
            `/api/initiatives/${updatedInitiative.id}`,
            {
                title: updatedInitiative.title,
                description: updatedInitiative.description,
                status: updatedInitiative.status,
                tags,
                dueDate: updatedInitiative.dueDate || null,
                assignees: updatedInitiative.assignees,
            },
            {
                onSuccess: () => {
                    setModalOpen(false);
                    // Refresh the page data
                    window.location.reload();
                },
                onError: (errors) => {
                    console.error('Failed to update initiative:', errors);
                    alert('Failed to update initiative. Please try again.');
                },
            },
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No due date';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const getAssigneeNames = () => {
        if (!initiative.assignees || initiative.assignees.length === 0) {
            return 'Unassigned';
        }

        return initiative.assignees
            .map((id) => {
                const assignee = assignees.find((a) => a.id === id);
                if (!assignee) return null;
                return `${assignee.first_name} ${assignee.last_name}`.trim();
            })
            .filter(Boolean)
            .join(', ');
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📋' },
        { id: 'tasks', label: 'Tasks', icon: '✅', count: tasks.length },
        { id: 'notes', label: 'Notes', icon: '📝', count: notes.length },
    ];

    return (
        <div className="min-h-screen bg-white transition-colors dark:bg-gray-900">
            <div
                style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                }}
            >
                {/* Header */}
                <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-colors dark:border-gray-700 dark:bg-gray-800">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '16px',
                        }}
                    >
                        <div>
                            <h1 className="mb-2 text-[32px] font-semibold text-gray-900 dark:text-gray-100">{initiative.title}</h1>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <span
                                    style={{
                                        background: statusColors[initiative.status] || '#6c757d',
                                        color: '#fff',
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {statusLabels[initiative.status] || initiative.status}
                                </span>

                                <span style={{ color: '#666', fontSize: '14px' }}>Due: {formatDate(initiative.dueDate || initiative.dueDate)}</span>

                                <span style={{ color: '#666', fontSize: '14px' }}>Assigned: {getAssigneeNames()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleEdit}
                            style={{
                                background: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            ✏️ Edit Initiative
                        </button>
                    </div>

                    {initiative.description && (
                        <p
                            style={{
                                color: '#555',
                                fontSize: '16px',
                                lineHeight: 1.5,
                                margin: '0 0 16px 0',
                            }}
                        >
                            {initiative.description}
                        </p>
                    )}

                    {/* Tags */}
                    {Array.isArray(initiative.tags) && initiative.tags.length > 0 ? (
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                marginTop: '16px',
                            }}
                        >
                            {initiative.tags
                                .map((tag) => (typeof tag === 'object' && 'name' in tag ? tag.name : String(tag)))
                                .map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: '#fff',
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                marginTop: '16px',
                            }}
                        >
                            <span style={{ color: '#aaa' }}>No tags</span>
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="mb-0 rounded-t-2xl border-b border-gray-200 bg-white p-0 shadow-lg transition-colors dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex gap-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 border-b-4 px-6 py-4 text-base font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 bg-white text-blue-600 dark:bg-gray-900 dark:text-blue-400'
                                        : 'border-transparent bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                } rounded-t-2xl`}
                                style={{ outline: 'none' }}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span
                                        className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                            activeTab === tab.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="min-h-[60vh] rounded-b-2xl bg-white p-6 shadow-lg transition-colors dark:bg-gray-800">
                    {activeTab === 'overview' && (
                        <div>
                            <h2 className="mb-5 text-2xl font-semibold text-gray-900 dark:text-gray-100">Initiative Overview</h2>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {/* Summary Card */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500 }}>Summary</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <strong>Status:</strong> {statusLabels[initiative.status] || initiative.status}
                                        </div>
                                        <div>
                                            <strong>Due Date:</strong> {formatDate(initiative.dueDate || initiative.dueDate)}
                                        </div>
                                        <div>
                                            <strong>Assignees:</strong> {getAssigneeNames()}
                                        </div>
                                        <div>
                                            <strong>Tasks:</strong> {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                                        </div>
                                        <div>
                                            <strong>Notes:</strong> {notes.length} note{notes.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500 }}>Quick Actions</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button
                                            onClick={() => setActiveTab('tasks')}
                                            style={{
                                                background: '#28a745',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '10px 16px',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                            }}
                                        >
                                            ✅ View Tasks ({tasks.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('notes')}
                                            style={{
                                                background: '#17a2b8',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '10px 16px',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                            }}
                                        >
                                            📝 View Notes ({notes.length})
                                        </button>
                                        <button
                                            onClick={() => window.open(`/tasks/create?initiative_id=${initiative.id}`, '_blank')}
                                            style={{
                                                background: '#007bff',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '10px 16px',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                            }}
                                        >
                                            ➕ Create New Task
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="mt-6">
                                <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-gray-100">Recent Activity</h3>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
                                    <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>Activity tracking coming soon...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div>
                            {loadingTasks ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <p>Loading tasks...</p>
                                </div>
                            ) : (
                                <TaskManagement
                                    tasks={tasks}
                                    initiatives={[initiative]}
                                    employees={assignees}
                                    initiativeId={initiative.id}
                                    showCreateForm={false}
                                    onTaskCreated={(task) => setTasks([...tasks, task])}
                                    onTaskUpdated={(updatedTask) => {
                                        setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
                                    }}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div>
                            <NotesSection
                                notes={notes}
                                entityType="initiative"
                                entityId={initiative.id}
                                // employees prop removed if not expected by NotesSection
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <InitiativeModal
                    open={modalOpen}
                    initiative={initiative}
                    assignees={assignees}
                    onSave={handleSave}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

export default InitiativeDetailsPage;
