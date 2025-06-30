import React, { useState } from 'react';
import { Initiative, InitiativeStatus, defaultAssignees } from './types';
import InitiativeCard from './initiative-card';
import InitiativeModal from './initiative-modal';
import { Inertia } from '@inertiajs/inertia';

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
  assignees: any[];
  defaultOrgStructureId: number | null;
}

const InitiativeBoard: React.FC<InitiativeBoardProps> = ({ initiatives, assignees, defaultOrgStructureId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [selected, setSelected] = useState<Initiative | undefined>(undefined);

  const handleCardClick = (initiative: Initiative) => {
    setSelected(initiative);
    setModalOpen(true);
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
      ...newInitiative,
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
      ...updatedInitiative,
    }, {
      onSuccess: () => setModalOpen(false),
      onError: (errors) => {
        console.error('Failed to update initiative:', errors);
        alert('Failed to update initiative. Please try again.');
      }
    });
  };

  return (
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
          <div key={status} style={{ minWidth: 280, background: '#f8f9fa', borderRadius: 8, padding: 12 }}>
            <h3 style={{ marginBottom: 8 }}>{statusLabels[status]}</h3>
            {initiatives.filter(i => i.status === status).length === 0 && (
              <div style={{ color: '#aaa', fontStyle: 'italic' }}>No initiatives</div>
            )}
            {initiatives.filter(i => i.status === status).map(initiative => (
              <InitiativeCard key={initiative.id} initiative={defaultAssignees(initiative)} users={assignees} onClick={() => handleCardClick(initiative)} />
            ))}
          </div>
        ))}
        {/* Backlog column for unassigned */}
        <div style={{ minWidth: 280, background: '#f1f3f5', borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginBottom: 8 }}>Backlog</h3>
          {initiatives.filter(i => !i.assignees || i.assignees.length === 0).length === 0 && (
            <div style={{ color: '#aaa', fontStyle: 'italic' }}>No backlog</div>
          )}
          {initiatives.filter(i => !i.assignees || i.assignees.length === 0).map(initiative => (
            <InitiativeCard key={initiative.id} initiative={defaultAssignees(initiative)} users={assignees} onClick={() => handleCardClick(initiative)} />
          ))}
        </div>
      </div>
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
  );
};

export default InitiativeBoard;
