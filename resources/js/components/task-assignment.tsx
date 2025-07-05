import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { User, UserPlus, Search } from 'lucide-react';
import { router } from '@inertiajs/react';
import Dropdown from './ui/Dropdown';

interface OrgNode {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface TaskAssignmentProps {
  taskId: number;
  orgNodes: OrgNode[];
  currentUser?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  onAssignmentComplete?: (taskId: number, assigneeId: number) => void;
}

export default function TaskAssignment({
  taskId,
  orgNodes,
  currentUser,
  onAssignmentComplete
}: TaskAssignmentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter employees based on search term
  const filteredEmployees = orgNodes.filter(employee =>
    // exclude current user from general list
    (employee.id !== currentUser?.id) && (
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle assignment
  const handleAssignment = async (employeeId: number) => {
    setIsAssigning(true);

    try {
      router.patch(route('tasks.update', taskId), {
        assigned_to: employeeId
      }, {
        preserveScroll: true,
        onSuccess: () => {
          setSearchTerm('');
          onAssignmentComplete?.(taskId, employeeId);
        },
        onError: (errors) => {
          console.error('Assignment failed:', errors);
        },
        onFinish: () => {
          setIsAssigning(false);
        }
      });
    } catch (error) {
      console.error('Assignment error:', error);
      setIsAssigning(false);
    }
  };

  // Handle assign to self
  const handleAssignToSelf = () => {
    if (currentUser) {
      handleAssignment(currentUser.id);
    }
  };

  return (
    <Dropdown
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          disabled={isAssigning}
        >
          <UserPlus className="w-3 h-3 mr-1" /> Assign
        </Button>
      }
    >
      <Card className="mt-2 w-72 max-h-80 overflow-hidden shadow-lg border bg-white dark:bg-gray-800">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto">
          {/* Assign to self option */}
          {currentUser && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAssignToSelf}
                disabled={isAssigning}
                className="w-full justify-start text-left hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <User className="w-4 h-4 mr-2 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-600">
                    Assign to me
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentUser.first_name} {currentUser.last_name}
                  </div>
                </div>
              </Button>
            </div>
          )}

          {/* Employee list */}
          <div className="p-2">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <User className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No employees found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredEmployees.map((employee) => (
                  <Button
                    key={employee.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAssignment(employee.id)}
                    disabled={isAssigning}
                    className="w-full justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {employee.email}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Dropdown>
  );
}
