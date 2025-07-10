import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  X,
  ArrowLeft,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  percentage_complete: number;
  assignedTo?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  initiative?: {
    id: number;
    title: string;
  };
  tags: Array<{ id: number; name: string }>;
}

interface Initiative {
  id: number;
  title: string;
}

interface Employee {
  id: number;
  full_name: string;
  title: string;
  email: string;
  status: string;
}

interface ProfileTasksProps {
  employee: Employee;
  tasks: {
    data: Task[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    status?: string;
    priority?: string;
    search?: string;
  };
  initiatives: Initiative[];
}

const ProfileTasks: React.FC<ProfileTasksProps> = ({ employee, tasks, filters, initiatives }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({
    status: filters.status || '',
    priority: filters.priority || '',
  });

  // Status color mapping
  const statusColors: Record<string, string> = {
    not_started: 'bg-gray-200 text-gray-800',
    in_progress: 'bg-blue-200 text-blue-800',
    completed: 'bg-green-200 text-green-800',
    on_hold: 'bg-yellow-200 text-yellow-800',
    cancelled: 'bg-red-200 text-red-800',
  };

  // Profile status color mapping
  const profileStatusColors: Record<string, string> = {
    active: 'bg-green-500',
    open: 'bg-blue-500',
    former: 'bg-gray-500',
  };

  // Priority color mapping
  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  // Handle search
  const handleSearch = () => {
    router.get(
      route('organisation.profile.tasks', employee.id),
      { search: searchTerm, ...filterValues },
      { preserveState: true, replace: true }
    );
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);

    router.get(
      route('organisation.profile.tasks', employee.id),
      { ...newFilters, search: searchTerm },
      { preserveState: true, replace: true }
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterValues({
      status: '',
      priority: '',
    });

    router.get(
      route('organisation.profile.tasks', employee.id),
      {},
      { preserveState: true, replace: true }
    );
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      searchTerm !== '' ||
      filterValues.status !== '' ||
      filterValues.priority !== ''
    );
  };

  return (
    <AppLayout>
      <Head title={`${employee.full_name}'s Tasks`} />

      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <Card className="mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <Link
                  href={route('organisation.profile', employee.id)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mr-3"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{employee.full_name}'s Tasks</h1>
                  <div className="flex items-center mt-1">
                    <span className={`inline-block h-2 w-2 rounded-full ${profileStatusColors[employee.status] || 'bg-gray-500'} mr-2`}></span>
                    <span className="text-gray-600 dark:text-gray-400">{employee.title}</span>
                  </div>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href={route('tasks.create', { assigned_to: employee.id })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                {hasActiveFilters() && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Status
                  </label>
                  <Select
                    value={filterValues.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Priority
                  </label>
                  <Select
                    value={filterValues.priority}
                    onValueChange={(value) => handleFilterChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.data.length > 0 ? (
                  tasks.data.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Link
                          href={route('tasks.show', task.id)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {task.title}
                        </Link>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag.id} variant="secondary" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))}
                            {task.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{task.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(task.due_date)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          className={statusColors[task.status] || 'bg-gray-200 text-gray-800'}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          className={priorityColors[task.priority] || 'bg-gray-100 text-gray-800'}
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No tasks found. {hasActiveFilters() && "Try adjusting your filters."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {tasks.last_page > 1 && (
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {tasks.from} to {tasks.to} of {tasks.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(tasks.links[0].url || '', {}, { preserveState: true })}
                  disabled={tasks.current_page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(tasks.links[tasks.links.length - 1].url || '', {}, { preserveState: true })}
                  disabled={tasks.current_page === tasks.last_page}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfileTasks;
