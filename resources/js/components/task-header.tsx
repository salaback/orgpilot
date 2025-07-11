// filepath: /Users/seanalaback/PhpstormProjects/OrgPilot/resources/js/components/task-header.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter } from 'lucide-react';

interface TaskHeaderProps {
  onAddTask: () => void;
  onFilterChange: (filter: string) => void;
  currentFilter: string;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ onAddTask, onFilterChange, currentFilter }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tasks</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button onClick={onAddTask} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {['All', 'Active', 'Completed'].map((filter) => (
            <Badge
              key={filter}
              variant={currentFilter === filter ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskHeader;
