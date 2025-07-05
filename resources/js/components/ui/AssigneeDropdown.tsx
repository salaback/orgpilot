import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Input } from './input';
import { User } from 'lucide-react';
import Dropdown from './Dropdown';

interface OrgNode {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface AssigneeDropdownProps {
  taskId: number;
  currentAssigneeId?: number;
  orgNodes: OrgNode[];
  onChange: (taskId: number, assigneeId: number | null) => void;
  currentUser?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export default function AssigneeDropdown({
  taskId,
  currentAssigneeId,
  orgNodes,
  onChange,
  currentUser
}: AssigneeDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = orgNodes.filter(node => {
    const name = `${node.first_name} ${node.last_name}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    if (name.includes(search)) return true;
    if (node.email && node.email.toLowerCase().includes(search)) return true;
    return false;
  });
  const label = currentAssigneeId
    ? (() => {
        const found = orgNodes.find(n => n.id === currentAssigneeId);
        return found ? `${found.first_name} ${found.last_name}` : 'Unassigned';
      })()
    : 'Unassigned';

  return (
    <Dropdown
      onOpen={() => setTimeout(() => inputRef.current?.focus(), 0)}
      trigger={
        <Button variant="ghost" size="sm" className="flex items-center gap-1 p-0">
          <User className="w-3 h-3" /> {label}
        </Button>
      }
      className="mt-2 w-48"
    >
      <Card className="p-2">
        <div className="space-y-1">
          <Input
            ref={inputRef}
            placeholder="Search assignees..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-3 text-sm"
          />

          <div className="space-y-1">
            <button
              className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              onClick={() => onChange(taskId, null)}
            >
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <User className="w-3 h-3 text-gray-500" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Unassigned</span>
            </button>

            {currentUser && (
              <button
                className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 border border-blue-200 dark:border-blue-800"
                onClick={() => onChange(taskId, currentUser.id)}
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Assign to Me</span>
              </button>
            )}
          </div>

          {filtered.length > 0 && (
            <>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filtered.map(node => (
                  <button
                    key={node.id}
                    className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    onClick={() => onChange(taskId, node.id)}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-medium">
                      {node.first_name.charAt(0)}{node.last_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 dark:text-gray-100 font-medium truncate">
                        {node.first_name} {node.last_name}
                      </div>
                      {node.email && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {node.email}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>
    </Dropdown>
  );
}
