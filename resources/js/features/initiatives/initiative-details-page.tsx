import React, { useState } from 'react';
import { Initiative } from './types';
import InitiativeModal from './initiative-modal';
import { Inertia } from '@inertiajs/inertia';
import NotesSection from '../../components/notes-section';

interface OrgNode {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
}

interface Note {
  id: number;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface InitiativeDetailsPageProps {
  initiative: Initiative;
  assignees: OrgNode[];
  notes?: Note[];
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

const InitiativeDetailsPage: React.FC<InitiativeDetailsPageProps> = ({ initiative, assignees, notes = [] }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleEdit = () => {
    setModalOpen(true);
  };

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
      onSuccess: () => {
        setModalOpen(false);
        // Refresh the page data
        window.location.reload();
      },
      onError: (errors) => {
        console.error('Failed to update initiative:', errors);
        alert('Failed to update initiative. Please try again.');
      }
    });
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
      .map(id => {
        const assignee = assignees.find(a => a.id === id);
        if (!assignee) return null;
        return `${assignee.first_name} ${assignee.last_name}`.trim();
      })
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
        borderBottom: '1px solid #e9ecef',
        paddingBottom: 24
      }}>
        <div style={{ flex: 1 }}>
          <button
            onClick={() => Inertia.visit('/initiatives')}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            ← Back to Initiatives
          </button>

          <h1 style={{
            fontSize: 32,
            fontWeight: 600,
            margin: '0 0 8px 0',
            color: '#222'
          }}>
            {initiative.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span
              style={{
                background: statusColors[initiative.status] || '#666',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            >
              {statusLabels[initiative.status] || initiative.status}
            </span>

            {initiative.dueDate && (
              <span style={{ color: '#666', fontSize: 14 }}>
                Due: {formatDate(initiative.dueDate)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleEdit}
          style={{
            background: '#228be6',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}
        >
          Edit Initiative
        </button>
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
        {/* Main Content */}
        <div>
          {/* Description */}
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 12, color: '#222' }}>
              Description
            </h3>
            <div style={{
              color: '#666',
              lineHeight: 1.6,
              fontSize: 16,
              background: '#f8f9fa',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #e9ecef'
            }}>
              {initiative.description || 'No description provided.'}
            </div>
          </section>

          {/* Tags */}
          {Array.isArray(initiative.tags) && initiative.tags.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 12, color: '#222' }}>
                Tags
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {initiative.tags.map((tag, index) => (
                  <span
                    key={typeof tag === 'object' ? tag.id : index}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '4px 12px',
                      borderRadius: 16,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }}
                  >
                    {typeof tag === 'object' ? tag.name : tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Notes Section */}
          <NotesSection
            notes={notes}
            entityType="App\\Models\\Initiative"
            entityId={initiative.id}
            orgNodes={assignees}
          />
        </div>

        {/* Sidebar */}
        <div>
          <div style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: 20,
            border: '1px solid #e9ecef'
          }}>
            {/* Assignees */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#222', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Assignees
              </h4>
              <div style={{ color: '#666', fontSize: 14 }}>
                {getAssigneeNames()}
              </div>
            </div>

            {/* Due Date */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#222', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Due Date
              </h4>
              <div style={{ color: '#666', fontSize: 14 }}>
                {formatDate(initiative.dueDate)}
              </div>
            </div>

            {/* Created/Updated */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#222', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Timeline
              </h4>
              <div style={{ color: '#666', fontSize: 12, lineHeight: 1.4 }}>
                <div>Created: {new Date(initiative.created_at).toLocaleDateString()}</div>
                <div>Updated: {new Date(initiative.updated_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <InitiativeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initiative={initiative}
        users={assignees}
        onSave={handleSave}
      />
    </div>
  );
};

export default InitiativeDetailsPage;
