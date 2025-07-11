import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    DropAnimation,
    KeyboardSensor,
    PointerSensor,
    UniqueIdentifier,
    defaultDropAnimationSideEffects,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Inertia } from '@inertiajs/inertia';
import React, { useState } from 'react';
import InitiativeCard from './initiative-card';
import InitiativeModal from './initiative-modal';
import { Initiative, InitiativeStatus, defaultAssignees } from './types';
import { Employee } from '@/types';

const statusLabels: Record<InitiativeStatus, string> = {
    planned: 'Planned',
    'in-progress': 'In Progress',
    complete: 'Complete',
    'on-hold': 'On Hold',
    cancelled: 'Cancelled',
};

const statusOrder: InitiativeStatus[] = ['planned', 'in-progress', 'on-hold', 'complete', 'cancelled'];

interface InitiativeBoardProps {
    initiatives: Initiative[];
    assignees: Employee[];
    defaultOrgStructureId: number | null;
    onSearchChange: (value: string) => void;
}

// Create a draggable card component
interface DraggableCardProps {
    initiative: Initiative;
    users: Employee[];
    onClick: () => void;
    onSearchChange: (value: string) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ initiative, users, onClick, onSearchChange }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: initiative.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <InitiativeCard initiative={initiative} users={users} onClick={onClick} onSearchChange={onSearchChange} />
        </div>
    );
};

// Create a droppable column component
interface DroppableColumnProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, title, children }) => {
    const { setNodeRef, isOver: isOverDroppable } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-w-[280px] rounded-lg border p-3 transition-all duration-200 ${
                isOverDroppable
                    ? 'border-2 border-dashed border-blue-300 bg-blue-50 shadow-lg dark:border-blue-600 dark:bg-blue-900/20'
                    : 'border-transparent bg-gray-50 dark:bg-gray-800'
            } `}
        >
            <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-900 uppercase dark:text-gray-100">{title}</h3>
            <div className="min-h-[100px]">{children}</div>
        </div>
    );
};

const InitiativeBoard: React.FC<InitiativeBoardProps> = ({ initiatives, assignees, defaultOrgStructureId, onSearchChange }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [newModalOpen, setNewModalOpen] = useState(false);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleCardClick = (initiative: Initiative) => {
        Inertia.visit(`/initiatives/${initiative.id}`);
    };

    // Replace handleCreate with actual create logic
    const handleCreate = (newInitiative: Initiative) => {
        if (!defaultOrgStructureId) {
            alert('No org structure found for this user.');
            return;
        }
        const tags = Array.isArray(newInitiative.tags)
            ? newInitiative.tags.map((tag) => (typeof tag === 'object' && tag.id ? String(tag.id) : String(tag)))
            : [];
        Inertia.post(
            '/api/initiatives',
            {
                title: newInitiative.title,
                description: newInitiative.description,
                status: newInitiative.status,
                tags,
                dueDate: newInitiative.dueDate || null,
                assignees: newInitiative.assignees,
                org_structure_id: defaultOrgStructureId,
            },
            {
                onSuccess: () => setNewModalOpen(false),
            },
        );
    };

    // Fix the handleSave function to actually update existing initiatives
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
                onSuccess: () => setModalOpen(false),
                onError: (errors) => {
                    console.error('Failed to update initiative:', errors);
                    alert('Failed to update initiative. Please try again.');
                },
            },
        );
    };

    const handleDragStart = (event: DragStartEvent) => {
        console.log('Drag started:', event.active.id);
        setActiveId(event.active.id);
    };

    const handleDragOver = () => {
        // Drag over logic removed, event parameter unused
    };

    // Remove unused variables from drag and drop handlers
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const activeInitiative = initiatives.find(initiative => initiative.id.toString() === activeId);
        const overInitiative = initiatives.find(initiative => initiative.id.toString() === overId);

        if (!activeInitiative || !overInitiative) return;

        const activeIndex = initiatives.findIndex(initiative => initiative.id === activeInitiative.id);
        const overIndex = initiatives.findIndex(initiative => initiative.id === overInitiative.id);

        const newInitiatives = [...initiatives];
        newInitiatives.splice(activeIndex, 1);
        newInitiatives.splice(overIndex, 0, activeInitiative);

        // The original code had a setInitiatives call here, but setInitiatives is not defined in this component.
        // Assuming the intent was to update the state, but the state variable is called 'initiatives'
        // and the setState function is not directly exposed.
        // For now, removing the line as it's not directly applicable without a state setter.
        // setInitiatives(newInitiatives); // This line was removed as setInitiatives is not defined.
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
                    {statusOrder.map((status) => (
                        <SortableContext
                            key={status}
                            items={initiatives.filter((i) => i.status === status).map((i) => i.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <DroppableColumn id={status} title={statusLabels[status]}>
                                {initiatives.filter((i) => i.status === status).length === 0 && (
                                    <div style={{ color: '#aaa', fontStyle: 'italic' }}>No initiatives</div>
                                )}
                                {initiatives
                                    .filter((i) => i.status === status)
                                    .map((initiative) => (
                                        <DraggableCard
                                            key={initiative.id}
                                            initiative={defaultAssignees(initiative)}
                                            users={assignees}
                                            onClick={() => handleCardClick(initiative)}
                                            onSearchChange={onSearchChange}
                                        />
                                    ))}
                            </DroppableColumn>
                        </SortableContext>
                    ))}
                    {/* Backlog column for unassigned */}
                    <SortableContext
                        items={initiatives.filter((i) => !i.assignees || i.assignees.length === 0).map((i) => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <DroppableColumn id="backlog" title="Backlog">
                            {initiatives.filter((i) => !i.assignees || i.assignees.length === 0).length === 0 && (
                                <div style={{ color: '#aaa', fontStyle: 'italic' }}>No backlog</div>
                            )}
                            {initiatives
                                .filter((i) => !i.assignees || i.assignees.length === 0)
                                .map((initiative) => (
                                    <DraggableCard
                                        key={initiative.id}
                                        initiative={defaultAssignees(initiative)}
                                        users={assignees}
                                        onClick={() => handleCardClick(initiative)}
                                        onSearchChange={onSearchChange}
                                    />
                                ))}
                        </DroppableColumn>
                    </SortableContext>
                </div>
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        <div
                            style={{
                                transform: 'rotate(5deg)',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                                borderRadius: 8,
                            }}
                        >
                            <InitiativeCard initiative={defaultAssignees(initiatives.find((i) => i.id === activeId)!)} users={assignees} />
                        </div>
                    ) : null}
                </DragOverlay>
                {/* New Initiative Slide Out */}
                <InitiativeModal open={newModalOpen} onClose={() => setNewModalOpen(false)} assignees={assignees} onSave={handleCreate} />
                {/* Edit Initiative Modal */}
                <InitiativeModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    initiative={initiatives.find(i => i.id === activeId)} // This line was removed as setSelected is removed.
                    assignees={assignees}
                    onSave={handleSave}
                />
            </div>
        </DndContext>
    );
};

export default InitiativeBoard;
