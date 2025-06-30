import React from 'react';
import { Initiative } from './types';

interface User {
  id: number;
  name: string;
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
    const initials = user.name.split(' ').map(n => n[0]).join('');
    return (
      <span key={id} style={{ marginRight: 4, background: '#dee2e6', borderRadius: '50%', padding: '2px 8px', fontSize: 12 }}>{initials}</span>
    );
  });

  // Allocation bar (if any)
  let allocationBar = null;
  if (initiative.allocations && initiative.allocations.length > 0) {
    const total = initiative.allocations.reduce((sum, a) => sum + a.percent, 0);
    allocationBar = (
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 4, marginBottom: 4, background: '#e9ecef' }}>
        {initiative.allocations.map(a => {
          const user = users.find(u => u.id === a.userId);
          const color = '#51cf66'; // Use a static color for now
          return (
            <div key={a.userId} title={user ? `${user.name}: ${a.percent}%` : `${a.percent}%`} style={{ width: `${a.percent}%`, background: color }} />
          );
        })}
        {total < 100 && <div style={{ width: `${100 - total}%`, background: '#e9ecef' }} />}
      </div>
    );
  }

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
        <span style={{ marginLeft: 8, color: '#868e96', fontSize: 12 }}>{(initiative.tags || []).join(', ')}</span>
        {initiative.dueDate && <span style={{ marginLeft: 8, color: '#fa5252', fontSize: 12 }}>Due: {initiative.dueDate}</span>}
      </div>
      {allocationBar}
    </div>
  );
};

export default InitiativeCard;
