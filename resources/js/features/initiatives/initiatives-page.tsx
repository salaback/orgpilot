import ActionButton from '@/components/ui/action-button';
import { Button } from '@/components/ui/button';
import { getCookie } from '@/lib/cookies';
import { router } from '@inertiajs/react';
import { FilterIcon, PlusIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import FilterBar from './filter-bar';
import InitiativeBoard from './initiative-board';
import InitiativeList from './initiative-list';
import InitiativeModal from './initiative-modal';
import { Initiative } from './types';
import { Employee } from '@/types';

interface InitiativesPageProps {
    initiatives: Initiative[];
    assignees: Employee[];
    defaultOrgStructureId: number | null;
}

const InitiativesPage: React.FC<InitiativesPageProps> = ({ initiatives, assignees, defaultOrgStructureId }) => {
    // Initialize view mode from cookie or default to 'columns' (board view)
    const [viewMode, setViewMode] = useState<'columns' | 'list'>(() => {
        // Try to get from cookie first
        if (typeof document !== 'undefined') {
            const cookieValue = getCookie('initiativeViewMode');
            if (cookieValue === 'list' || cookieValue === 'columns') {
                return cookieValue as 'list' | 'columns';
            }
        }

        // Fall back to localStorage for backward compatibility
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('initiativeViewMode');
            return savedMode === 'list' || savedMode === 'columns' ? (savedMode as 'columns' | 'list') : 'columns';
        }
        return 'columns';
    });

    const [search, setSearch] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);

    // Add state for the initiative modal
    const [modalOpen, setModalOpen] = useState(false);

    // Listen for view mode changes from sidebar toggle
    useEffect(() => {
        const handleViewModeChange = (event: CustomEvent) => {
            setViewMode(event.detail.viewMode);
        };

        // Add event listener
        window.addEventListener('initiativeViewModeChange', handleViewModeChange as EventListener);

        // Clean up event listener
        return () => {
            window.removeEventListener('initiativeViewModeChange', handleViewModeChange as EventListener);
        };
    }, []);

    // Handle creating a new initiative
    const handleNewInitiative = () => {
        setModalOpen(true);
    };

    // Correct handleCreate type
    const handleCreate = (newInitiative: Initiative) => {
        if (!defaultOrgStructureId) {
            alert('No org structure found for this user.');
            return;
        }

        router.post(
            '/api/initiatives',
            {
                title: newInitiative.title,
                description: newInitiative.description,
                status: newInitiative.status,
                tags: newInitiative.tags,
                dueDate: newInitiative.dueDate || null,
                assignees: newInitiative.assignees,
                org_structure_id: defaultOrgStructureId,
            },
            {
                onSuccess: () => setModalOpen(false),
            },
        );
    };

    // Filter initiatives by search term (case-insensitive, matches title, description, or assignee names)
    const filteredInitiatives = initiatives
        .filter((i) => {
            const searchLower = search.toLowerCase();

            // Check title and description
            const titleMatch = i.title.toLowerCase().includes(searchLower);
            const descriptionMatch = i.description && i.description.toLowerCase().includes(searchLower);

            // Check assignee names
            const assigneeMatch = (i.assignees || []).some((assigneeId) => {
                const assignee = assignees.find((a) => a.id === assigneeId);
                if (!assignee) return false;

                const fullName = `${assignee.first_name} ${assignee.last_name}`.trim().toLowerCase();
                const firstName = (assignee.first_name || '').toLowerCase();
                const lastName = (assignee.last_name || '').toLowerCase();

                return fullName.includes(searchLower) || firstName.includes(searchLower) || lastName.includes(searchLower);
            });

            // Check tag names
            const tagMatch =
                Array.isArray(i.tags) &&
                i.tags.some((tag) => {
                    const tagName = typeof tag === 'object' ? tag.name : tag;
                    return tagName.toLowerCase().includes(searchLower);
                });

            return titleMatch || descriptionMatch || assigneeMatch || tagMatch;
        })
        .map((i: Initiative) => ({
            ...i,
            assignees: i.assignees?.map((assigneeId) => assignees.find((a) => a.id === assigneeId)),
        }));

    return (
        <div className="p-6">
            {/* Simple header without toggle buttons, since toggle is now in the app sidebar */}
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Initiatives</h1>
                <div className="flex items-center gap-2">
                    <ActionButton label="New Initiative" icon={PlusIcon} onClick={handleNewInitiative} />

                    <Button
                        variant={filterOpen ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setFilterOpen(!filterOpen)}
                        className="flex items-center gap-1"
                    >
                        <FilterIcon className="h-4 w-4" />
                        <span>Filter</span>
                    </Button>
                </div>
            </div>

            <FilterBar search={search} onSearchChange={setSearch} />

            {viewMode === 'columns' && (
                <InitiativeBoard
                    initiatives={filteredInitiatives}
                    assignees={assignees}
                    defaultOrgStructureId={defaultOrgStructureId}
                    onSearchChange={setSearch}
                />
            )}

            {viewMode === 'list' && <InitiativeList initiatives={filteredInitiatives} assignees={assignees} />}

            {/* Initiative creation modal */}
            <InitiativeModal open={modalOpen} onClose={() => setModalOpen(false)} assignees={assignees} onSave={handleCreate} />
        </div>
    );
};

export default InitiativesPage;
