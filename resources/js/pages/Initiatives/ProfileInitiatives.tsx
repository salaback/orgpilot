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

interface Initiative {
  id: number;
  title: string;
  description: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  assignees: Array<{
    id: number;
    first_name: string;
    last_name: string;
  }>;
  tags: Array<{ id: number; name: string }>;
}

interface Employee {
  id: number;
  full_name: string;
  title: string;
  email: string;
  status: string;
}

interface ProfileInitiativesProps {
  employee: Employee;
  initiatives: {
    data: Initiative[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    status?: string;
    search?: string;
  };
}

const ProfileInitiatives: React.FC<ProfileInitiativesProps> = ({ employee, initiatives, filters }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({
    status: filters.status || '',
  });

  // Status color mapping
  const statusColors: Record<string, string> = {
    'planned': 'bg-gray-200 text-gray-800',
    'in-progress': 'bg-blue-200 text-blue-800',
    'complete': 'bg-green-200 text-green-800',
    'on-hold': 'bg-yellow-200 text-yellow-800',
    'cancelled': 'bg-red-200 text-red-800',
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Apply filters
  const applyFilters = () => {
    router.get(
      route('organisation.profile.initiatives', employee.id),
      { ...filterValues, search: searchTerm },
      { preserveState: true }
    );
  };

  // Clear filters
  const clearFilters = () => {
    setFilterValues({ status: '' });
    setSearchTerm('');
    router.get(
      route('organisation.profile.initiatives', employee.id),
      {},
      { preserveState: true }
    );
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // Handle page navigation
  const navigatePage = (url: string | null) => {
    if (url) {
      router.visit(url);
    }
  };

  return (
    <AppLayout>
      <Head title={`${employee.full_name} - Initiatives`} />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <Link href={route('organisation.profile', employee.id)}>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Profile
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{employee.full_name}'s Initiatives</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {employee.title}
              <span className="text-sm ml-2 text-gray-500">
                ({initiatives.total} {initiatives.total === 1 ? 'initiative' : 'initiatives'})
              </span>
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <Card className="mb-6 p-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search initiatives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>

          {showFilters && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select
                    value={filterValues.status}
                    onValueChange={(value) => setFilterValues({ ...filterValues, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Status</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
                <Button size="sm" onClick={applyFilters} className="gap-1">
                  <Filter className="h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Initiatives table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Initiative</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initiatives.data.length > 0 ? (
                initiatives.data.map((initiative) => (
                  <TableRow key={initiative.id}>
                    <TableCell>
                      <Link
                        href={`/initiatives/${initiative.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {initiative.title}
                      </Link>
                      {initiative.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">{initiative.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[initiative.status]}>
                        {initiative.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(initiative.end_date)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {initiative.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {initiative.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{initiative.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                    No initiatives found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {initiatives.data.length > 0 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500">
                Showing {initiatives.from} to {initiatives.to} of {initiatives.total} initiatives
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigatePage(initiatives.links[0]?.url)}
                  disabled={initiatives.current_page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigatePage(initiatives.links[initiatives.links.length - 1]?.url)}
                  disabled={initiatives.current_page === initiatives.last_page}
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

export default ProfileInitiatives;
