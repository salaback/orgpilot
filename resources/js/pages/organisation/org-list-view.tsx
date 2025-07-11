import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { Employee } from '@/types';
import axios from 'axios';
import { ChevronDown, ChevronRight, UserIcon } from 'lucide-react';
import React, { useState } from 'react';

interface EmployeeListViewProps {
    rootEmployee: Employee;
    initialReports: Employee[];
    onViewProfile?: (employee: Employee) => void;
    onAddDirectReport?: (managerId: number) => void;
}

export function EmployeeListView({ rootEmployee, initialReports, onViewProfile, onAddDirectReport }: EmployeeListViewProps) {
    const getInitials = useInitials();
    const [expandedEmployees, setExpandedEmployees] = useState<Record<number, boolean>>({ [rootEmployee.id]: true });
    const [employeeDirectReports, setEmployeeDirectReports] = useState<Record<number, Employee[]>>({
        [rootEmployee.id]: initialReports,
    });
    const [loadingEmployees, setLoadingEmployees] = useState<Record<number, boolean>>({});

    // Toggle the expanded state of a node
    const toggleEmployeeExpansion = async (employeeId: number) => {
        // If we're expanding a node and don't have its direct reports yet, fetch them
        if (!expandedEmployees[employeeId] && (!employeeDirectReports[employeeId] || employeeDirectReports[employeeId].length === 0)) {
            await fetchDirectReports(employeeId);
        }

        setExpandedEmployees((prev) => ({
            ...prev,
            [employeeId]: !prev[employeeId],
        }));
    };

    // Fetch direct reports for a node
    const fetchDirectReports = async (employeeId: number) => {
        // Don't fetch if we're already loading or have the data
        if (loadingEmployees[employeeId] || (employeeDirectReports[employeeId] && employeeDirectReports[employeeId].length > 0)) {
            return;
        }

        setLoadingEmployees((prev) => ({ ...prev, [employeeId]: true }));

        try {
            const response = await axios.get(`/organisation/person/${employeeId}/direct-reports`);
            const reports = response.data.directReports || [];

            setEmployeeDirectReports((prev) => ({
                ...prev,
                [employeeId]: reports,
            }));
        } catch (error) {
            console.error('Error fetching direct reports:', error);
        } finally {
            setLoadingEmployees((prev) => ({ ...prev, [employeeId]: false }));
        }
    };

    // Render a single node in the list
    const renderEmployee = (employee: Employee, level = 0) => {
        const hasDirectReports = (employee.direct_reports_count ?? 0) > 0;
        const isExpanded = expandedEmployees[employee.id] || false;
        const directReports = employeeDirectReports[employee.id] || [];
        const isLoading = loadingEmployees[employee.id] || false;

        return (
            <React.Fragment key={employee.id}>
                <div
                    className={`flex items-center px-3 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${level > 0 ? 'border-l-2 border-gray-200 dark:border-gray-700' : ''} `}
                    style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
                >
                    {/* Expand/collapse button or spacer */}
                    {hasDirectReports ? (
                        <Button variant="ghost" size="icon" className="mr-1.5 h-5 w-5 p-0" onClick={() => toggleEmployeeExpansion(employee.id)}>
                            {isLoading ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-primary"></div>
                            ) : isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                        </Button>
                    ) : (
                        <div className="mr-1.5 w-5"></div>
                    )}

                    {/* Avatar */}
                    <Avatar className="mr-2 h-6 w-6">
                        <AvatarFallback className="bg-primary text-xs text-primary-foreground">{getInitials(employee.full_name)}</AvatarFallback>
                    </Avatar>

                    {/* Person info */}
                    <div className="flex-1">
                        <div className="flex items-center">
                            <span className="text-sm font-medium">{employee.full_name}</span>
                            {(employee.direct_reports_count ?? 0) > 0 && (
                                <span className="ml-2 text-xs text-muted-foreground">({employee.direct_reports_count})</span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">{employee.title}</div>
                    </div>

                    {/* Status badges */}
                    <div className="mr-1.5 flex items-center gap-1.5">
                        {employee.status !== 'active' && (
                            <Badge variant={employee.status === 'open' ? 'outline' : 'secondary'} className="px-1.5 py-0.5 text-xs">
                                {employee.status === 'open' ? 'Open Position' : 'Former'}
                            </Badge>
                        )}
                        {employee.node_type === 'placeholder' && (
                            <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                                Placeholder
                            </Badge>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {onViewProfile && (
                            <Button variant="ghost" size="icon" onClick={() => onViewProfile(employee)} className="h-6 w-6" title="View Profile">
                                <UserIcon className="h-3 w-3" />
                            </Button>
                        )}
                        {onAddDirectReport && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onAddDirectReport(employee.id)}
                                className="h-6 w-6"
                                title="Add Direct Report"
                            >
                                <span className="text-sm font-bold">+</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Render children if expanded */}
                {isExpanded && directReports.length > 0 && <div>{directReports.map((report) => renderEmployee(report, level + 1))}</div>}
            </React.Fragment>
        );
    };

    return (
        <div className="overflow-hidden rounded-md border">
            <div className="border-b bg-gray-50 px-4 py-2 font-medium dark:bg-gray-900">Organization Structure</div>
            <div>
                {/* Root node (manager) with direct reports nested inside */}
                <div className="flex items-center px-3 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                    {/* Expand/collapse button */}
                    {initialReports.length > 0 ? (
                        <Button variant="ghost" size="icon" className="mr-1.5 h-5 w-5 p-0" onClick={() => toggleEmployeeExpansion(rootEmployee.id)}>
                            {expandedEmployees[rootEmployee.id] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                    ) : (
                        <div className="mr-1.5 w-5"></div>
                    )}

                    {/* Root node information */}
                    <div className="flex-1">
                        <div className="flex items-center">
                            <span className="text-sm font-semibold">{rootEmployee.full_name}</span>
                            {(rootEmployee.direct_reports_count ?? 0) > 0 && (
                                <span className="ml-2 text-xs text-muted-foreground">({rootEmployee.direct_reports_count})</span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">{rootEmployee.title}</div>
                    </div>

                    {/* Add direct report button */}
                    {onAddDirectReport && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onAddDirectReport(rootEmployee.id)}
                            className="h-6 w-6"
                            title="Add Direct Report"
                        >
                            <span className="text-sm font-bold">+</span>
                        </Button>
                    )}
                </div>

                {/* Direct reports */}
                {expandedEmployees[rootEmployee.id] && initialReports.map((report) => renderEmployee(report, 1))}
            </div>
        </div>
    );
}
