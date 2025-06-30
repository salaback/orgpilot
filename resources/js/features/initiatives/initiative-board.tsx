import React, { useState } from 'react';
import { Initiative, InitiativeStatus, defaultAssignees } from './types';
import InitiativeCard from './initiative-card';
import InitiativeModal from './initiative-modal';
import { Inertia } from '@inertiajs/inertia';
import {
  DndContext,
  DragOverlay,
  DropAnimation,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  UniqueIdentifier,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const statusLabels: Record<InitiativeStatus, string> = {
  planned: 'Planned',
  'in-progress': 'In Progress',
  complete: 'Complete',
  'on-hold': 'On Hold',
  cancelled: 'Cancelled',
};

const statusOrder: InitiativeStatus[] = [
  'planned',
  'in-progress',
  'on-hold',
  'complete',
  'cancelled',
];

interface InitiativeBoardProps {
  initiatives: Initiative[];
  assignees: Array<{
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    title: string;
  }>;
  defaultOrgStructureId: number | null;
  onSearchChange: (value: string) => void;
}

// Create a draggable card component
interface DraggableCardProps {
  initiative: Initiative;
  users: Array<{
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    title: string;
  }>;
  onClick: () => void;
  onSearchChange: (value: string) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ initiative, users, onClick, onSearchChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: initiative.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <InitiativeCard
        initiative={initiative}
        users={users}
        onClick={onClick}
        onSearchChange={onSearchChange}
      />
    </div>
  );
};

// Create a droppable column component
interface DroppableColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
  backgroundColor?: string;
  isOver?: boolean;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, title, children, backgroundColor = '#f8f9fa', isOver = false }) => {
  const { setNodeRef, isOver: isOverDroppable } = useDroppable({
    id: id,
  });

  const columnStyle = {
    minWidth: 280,
    background: isOverDroppable ? '#e3f2fd' : backgroundColor,
    borderRadius: 8,
    padding: 12,
    border: isOverDroppable ? '2px dashed #2196f3' : '1px solid transparent',
    boxShadow: isOverDroppable ? '0 4px 8px rgba(33, 150, 243, 0.3)' : 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <div ref={setNodeRef} style={columnStyle}>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <div style={{ minHeight: 100 }}>
        {children}
      </div>
    </div>
  );
};

const InitiativeBoard: React.FC<InitiativeBoardProps> = ({ initiatives, assignees, defaultOrgStructureId, onSearchChange }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [selected, setSelected] = useState<Initiative | undefined>(undefined);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCardClick = (initiative: Initiative) => {
    Inertia.visit(`/initiatives/${initiative.id}`);
  };

  const handleNewClick = () => {
    setSelected(undefined);
    setNewModalOpen(true);
  };

  // Replace handleCreate with actual create logic
  const handleCreate = (newInitiative: Initiative) => {
    if (!defaultOrgStructureId) {
      alert('No org structure found for this user.');
      return;
    }
    Inertia.post('/api/initiatives', {
      title: newInitiative.title,
      description: newInitiative.description,
      status: newInitiative.status,
      tags: newInitiative.tags,
      dueDate: newInitiative.dueDate || null,
      assignees: newInitiative.assignees,
      org_structure_id: defaultOrgStructureId,
    }, {
      onSuccess: () => setNewModalOpen(false),
    });
  };

  // Fix the handleSave function to actually update existing initiatives
  const handleSave = (updatedInitiative: Initiative) => {
    if (!updatedInitiative.id) {
      alert('Initiative ID is missing.');
      return;
    }

    Inertia.put(`/api/initiatives/${updatedInitiative.id}`, {
      title: updatedInitiative.title,
      description: updatedInitiative.description,
      status: updatedInitiative.status,
      tags: updatedInitiative.tags,
      dueDate: updatedInitiative.dueDate || null,
      assignees: updatedInitiative.assignees,
    }, {
      onSuccess: () => setModalOpen(false),
      onError: (errors) => {
        console.error('Failed to update initiative:', errors);
        alert('Failed to update initiative. Please try again.');
      }
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', event.active.id);
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { activeId: active.id, overId: over?.id });
    setActiveId(null);
    setOverId(null);

    if (!over) {
      console.log('No drop target detected');
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // Find the initiative being dragged
    const activeInitiative = initiatives.find(i => i.id === activeId);
    if (!activeInitiative) {
      console.log('Active initiative not found');
      return;
    }

    console.log('Active initiative:', activeInitiative);
    console.log('Drop target ID:', overId);

    // Determine the new status and handle reordering
    let newStatus: InitiativeStatus | null = null;
    let newOrder: number | null = null;

    // Check if dropped directly on a status column
    if (statusOrder.includes(overId as InitiativeStatus)) {
      newStatus = overId as InitiativeStatus;
      // When dropped on empty column, put it at the end
      const existingCardsInColumn = initiatives.filter(i => i.status === newStatus);
      newOrder = existingCardsInColumn.length > 0 ? Math.max(...existingCardsInColumn.map(i => i.order || 0)) + 1 : 0;
      console.log('Detected direct status column drop:', newStatus, 'new order:', newOrder);
    } else if (overId === 'backlog') {
      newStatus = 'planned';
      const existingCardsInBacklog = initiatives.filter(i => !i.assignees || i.assignees.length === 0);
      newOrder = existingCardsInBacklog.length > 0 ? Math.max(...existingCardsInBacklog.map(i => i.order || 0)) + 1 : 0;
      console.log('Detected backlog drop, setting to planned with order:', newOrder);
    } else {
      // If dropped on another card, find which column that card is in
      const targetInitiative = initiatives.find(i => i.id === overId);
      if (targetInitiative) {
        console.log('Target initiative:', targetInitiative);

        newStatus = targetInitiative.status as InitiativeStatus;

        // Calculate new order based on where it was dropped relative to the target card
        const cardsInTargetColumn = initiatives.filter(i => i.status === newStatus).sort((a, b) => (a.order || 0) - (b.order || 0));
        const targetIndex = cardsInTargetColumn.findIndex(i => i.id === targetInitiative.id);

        if (activeInitiative.status === newStatus) {
          // Reordering within the same column
          const activeIndex = cardsInTargetColumn.findIndex(i => i.id === activeInitiative.id);

          if (activeIndex !== targetIndex && activeIndex !== -1) {
            console.log('Reordering within same column from index', activeIndex, 'to', targetIndex);

            // Handle case where all cards have the same order value (e.g., all 0)
            const allOrdersAreSame = cardsInTargetColumn.every(card => card.order === cardsInTargetColumn[0].order);

            if (allOrdersAreSame) {
              // Reassign order values based on current positions
              console.log('All cards have same order value, reassigning based on position');

              // Create new order based on target position
              if (activeIndex < targetIndex) {
                // Moving down - insert after target
                newOrder = targetIndex + 1;
              } else {
                // Moving up - insert before target
                newOrder = targetIndex;
              }
            } else {
              // Calculate new order based on position relative to target
              if (targetIndex === 0) {
                newOrder = Math.max(0, (targetInitiative.order || 0) - 1);
              } else if (targetIndex === cardsInTargetColumn.length - 1) {
                newOrder = (targetInitiative.order || 0) + 1;
              } else {
                // Insert between cards
                const prevCard = cardsInTargetColumn[targetIndex - 1];
                const nextCard = cardsInTargetColumn[targetIndex + 1];
                newOrder = Math.floor(((prevCard?.order || 0) + (nextCard?.order || 0)) / 2);

                // If the calculated order would be the same as existing, use simple increment
                if (newOrder === (prevCard?.order || 0) || newOrder === (nextCard?.order || 0)) {
                  newOrder = (targetInitiative.order || 0) + 0.5;
                }
              }
            }
          } else {
            // No change needed
            console.log('No position change within same column');
            return;
          }
        } else {
          // Moving to different column, insert after target card
          newOrder = (targetInitiative.order || 0) + 1;
          console.log('Moving to different column, inserting after target with order:', newOrder);
        }
      } else {
        console.log('Unknown drop target:', overId);
        return;
      }
    }

    console.log('Comparing - current status:', activeInitiative.status, 'new status:', newStatus);
    console.log('Comparing - current order:', activeInitiative.order, 'new order:', newOrder);

    // Update if status or order changed
    const statusChanged = newStatus && newStatus !== activeInitiative.status;
    const orderChanged = newOrder !== null && newOrder !== (activeInitiative.order || 0);

    if (statusChanged || orderChanged) {
      console.log(`Updating initiative ${activeInitiative.id} - status: ${activeInitiative.status} -> ${newStatus}, order: ${activeInitiative.order} -> ${newOrder}`);

      const updateData = {
        title: activeInitiative.title,
        description: activeInitiative.description,
        status: newStatus || activeInitiative.status,
        order: newOrder !== null ? newOrder : (activeInitiative.order || 0),
        tags: activeInitiative.tags,
        dueDate: activeInitiative.dueDate || null,
        assignees: activeInitiative.assignees,
      };
      console.log('API call data:', updateData);
      console.log('API endpoint:', `/api/initiatives/${activeInitiative.id}`);

      // Use fetch instead of Inertia.put to avoid Inertia response requirement
      fetch(`/api/initiatives/${activeInitiative.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
      .then(async response => {
        console.log('API request finished');
        if (response.ok) {
          const data = await response.json();
          console.log('Initiative updated successfully', data);
          // Refresh the page to show the changes
          window.location.reload();
        } else {
          const errorData = await response.json();
          console.error('Failed to update initiative:', errorData);
          alert('Failed to move initiative. Please try again.');
        }
      })
      .catch(error => {
        console.error('Network error:', error);
        alert('Failed to move initiative. Please try again.');
      });
    } else {
      console.log('No changes needed');
    }
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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button
            onClick={handleNewClick}
            style={{ background: '#228be6', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 500, fontSize: 16 }}
          >
            + New Initiative
          </button>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
          {statusOrder.map((status) => (
            <SortableContext key={status} items={initiatives.filter(i => i.status === status).map(i => i.id)} strategy={verticalListSortingStrategy}>
              <DroppableColumn
                id={status}
                title={statusLabels[status]}
                isOver={overId === status}
              >
                {initiatives.filter(i => i.status === status).length === 0 && (
                  <div style={{ color: '#aaa', fontStyle: 'italic' }}>No initiatives</div>
                )}
                {initiatives.filter(i => i.status === status).map(initiative => (
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
          <SortableContext items={initiatives.filter(i => !i.assignees || i.assignees.length === 0).map(i => i.id)} strategy={verticalListSortingStrategy}>
            <DroppableColumn
              id="backlog"
              title="Backlog"
              backgroundColor="#f1f3f5"
              isOver={overId === 'backlog'}
            >
              {initiatives.filter(i => !i.assignees || i.assignees.length === 0).length === 0 && (
                <div style={{ color: '#aaa', fontStyle: 'italic' }}>No backlog</div>
              )}
              {initiatives.filter(i => !i.assignees || i.assignees.length === 0).map(initiative => (
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
            <div style={{
              transform: 'rotate(5deg)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              borderRadius: 8,
            }}>
              <InitiativeCard
                initiative={defaultAssignees(initiatives.find(i => i.id === activeId)!)}
                users={assignees}
              />
            </div>
          ) : null}
        </DragOverlay>
        {/* New Initiative Slide Out */}
        <InitiativeModal
          open={newModalOpen}
          onClose={() => setNewModalOpen(false)}
          users={assignees}
          onSave={handleCreate}
        />
        {/* Edit Initiative Modal */}
        <InitiativeModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          initiative={selected}
          users={assignees}
          onSave={handleSave}
        />
      </div>
    </DndContext>
  );
};

export default InitiativeBoard;
