import React, { useState } from 'react';
import InitiativeBoard from './initiative-board';
import InitiativeList from './initiative-list';
import FilterBar from './filter-bar';
import { defaultAssignees } from './types';

interface Initiative {
  id: number;
  title: string;
  description?: string;
  status: string;
  tags: string[];
  due_date?: string;
  assignees?: number[];
  teamLabel?: string;
  allocations?: any[];
}

interface OrgNode {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
}

interface InitiativesPageProps {
  initiatives: Initiative[];
  assignees: OrgNode[];
  defaultOrgStructureId: number | null;
}

const InitiativesPage: React.FC<InitiativesPageProps> = ({ initiatives, assignees, defaultOrgStructureId }) => {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');

  // Filter initiatives by search term (case-insensitive, matches title, description, or assignee names)
  const filteredInitiatives = initiatives.filter(i => {
    const searchLower = search.toLowerCase();

    // Check title and description
    const titleMatch = i.title.toLowerCase().includes(searchLower);
    const descriptionMatch = i.description && i.description.toLowerCase().includes(searchLower);

    // Check assignee names
    const assigneeMatch = (i.assignees || []).some(assigneeId => {
      const assignee = assignees.find(a => a.id === assigneeId);
      if (!assignee) return false;

      const fullName = `${assignee.first_name} ${assignee.last_name}`.trim().toLowerCase();
      const firstName = (assignee.first_name || '').toLowerCase();
      const lastName = (assignee.last_name || '').toLowerCase();

      return fullName.includes(searchLower) ||
             firstName.includes(searchLower) ||
             lastName.includes(searchLower);
    });

    // Check tag names
    const tagMatch = Array.isArray(i.tags) && i.tags.some(tag => {
      const tagName = typeof tag === 'object' ? tag.name : tag;
      return tagName.toLowerCase().includes(searchLower);
    });

    return titleMatch || descriptionMatch || assigneeMatch || tagMatch;
  }).map(i => defaultAssignees(i));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Initiatives</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('board')}
            disabled={view === 'board'}
            title="Board View"
            className={`
              border-2 border-blue-500 rounded-md p-1.5 flex items-center transition-all
              ${view === 'board'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
              }
            `}
          >
            {/* Board (Kanban) Icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="6" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="9" y="4" width="6" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="16" y="4" width="4" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
          <button
            onClick={() => setView('list')}
            disabled={view === 'list'}
            title="List View"
            className={`
              border-2 border-blue-500 rounded-md p-1.5 flex items-center transition-all
              ${view === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
              }
            `}
          >
            {/* List (Table) Icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="3" y="10" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="3" y="15" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </div>
      </div>
      <FilterBar search={search} onSearchChange={setSearch} />
      <div className="mt-6">
        {view === 'board' ? (
          <InitiativeBoard
            initiatives={filteredInitiatives}
            assignees={assignees}
            defaultOrgStructureId={defaultOrgStructureId}
            onSearchChange={setSearch}
          />
        ) : (
          <InitiativeList initiatives={filteredInitiatives} assignees={assignees} />
        )}
      </div>
    </div>
  );
};

export default InitiativesPage;
