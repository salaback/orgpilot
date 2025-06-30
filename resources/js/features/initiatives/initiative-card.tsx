import React from 'react';
import { Initiative } from './types';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
}

interface InitiativeCardProps {
  initiative: Initiative;
  users: User[];
  compact?: boolean;
  onClick?: () => void;
}

const InitiativeCard: React.FC<InitiativeCardProps> = ({ initiative, users, compact, onClick }) => {
  const assigneeAvatars = (initiative.assignees || []).map(id => {
    const user = users.find(u => u.id === id);
    if (!user) return null;

    // Create full name from first_name and last_name, with safer fallback handling
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    // Create initials more safely with additional checks
    let initials = '?';
    if (fullName && fullName.length > 0) {
      try {
        initials = fullName.split(' ')
          .filter(name => name.length > 0) // Filter out empty strings
          .map(name => name[0])
          .join('')
          .toUpperCase();
        // Fallback if no valid initials were created
        if (!initials || initials.length === 0) {
          initials = '?';
        }
      } catch (error) {
        console.warn('Error creating initials for user:', user, error);
        initials = '?';
      }
    }

    return (
      <span key={id} style={{ marginRight: 4, background: '#dee2e6', borderRadius: '50%', padding: '2px 8px', fontSize: 12 }}>{initials}</span>
    );
  }).filter(Boolean); // Remove any null entries

  // Allocation bar (if any)
  let allocationBar = null;
  if (initiative.allocations && initiative.allocations.length > 0) {
    const total = initiative.allocations.reduce((sum, a) => sum + a.percent, 0);
    allocationBar = (
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 4, marginBottom: 4, background: '#e9ecef' }}>
        {initiative.allocations.map(a => {
          const user = users.find(u => u.id === a.userId);
          const userName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Unknown';
          const color = '#51cf66'; // Use a static color for now
          return (
            <div key={a.userId} title={`${userName}: ${a.percent}%`} style={{ width: `${a.percent}%`, background: color }} />
          );
        })}
        {total < 100 && <div style={{ width: `${100 - total}%`, background: '#e9ecef' }} />}
      </div>
    );
  }

  // Format due date as localized string
  const formatDueDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        padding: compact ? 4 : 12,
        marginBottom: 8,
        cursor: onClick ? 'pointer' : undefined,
        border: '1px solid #e9ecef',
        fontSize: compact ? 14 : 16,
      }}
    >
      <div style={{ fontWeight: 500 }}>{initiative.title}</div>
      {!compact && <div style={{ color: '#666', fontSize: 13, margin: '4px 0 2px 0' }}>{initiative.description}</div>}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
        {assigneeAvatars.length > 0 ? assigneeAvatars : <span style={{ color: '#aaa', fontSize: 12 }}>Backlog</span>}
        <span style={{ marginLeft: 8, color: '#868e96', fontSize: 12 }}>{Array.isArray(initiative.tags) ? initiative.tags.join(', ') : ''}</span>
        {initiative.dueDate && <span style={{ marginLeft: 8, color: '#fa5252', fontSize: 12 }}>Due: {formatDueDate(initiative.dueDate)}</span>}
      </div>
      {allocationBar}
    </div>
  );
};

export default InitiativeCard;
