import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInitials } from '@/hooks/use-initials';
import { Employee } from '@/types';
import { ChevronRightIcon, PlusCircleIcon, UserIcon } from 'lucide-react';
import React from 'react';

interface EmployeeCardProps {
    node: Employee;
    onAddDirectReport?: (managerId: number) => void;
    showAddButton?: boolean;
    onFocus?: (node: Employee) => void;
    onViewProfile?: (node: Employee) => void;
}

export function EmployeeCard({ node, onAddDirectReport, showAddButton = true, onFocus, onViewProfile }: EmployeeCardProps) {
    const getInitials = useInitials();
    // Remove unused isHovering
    // const [isHovering, setIsHovering] = useState(false);

    // Handler for clicking on the card content
    const handleCardClick = () => {
        if (onFocus) {
            onFocus(node);
        }
    };

    // Handler for view profile
    const handleViewProfile = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click from triggering
        if (onViewProfile) {
            onViewProfile(node);
        }
    };

    return (
        <Card
            className={`w-[280px] ${onFocus ? 'cursor-pointer transition-shadow hover:shadow-md' : ''} group relative`}
            onClick={onFocus ? handleCardClick : undefined}
            onMouseEnter={() => {/* setIsHovering(true) */}}
            onMouseLeave={() => {/* setIsHovering(false) */}}
        >
            <CardContent className="p-6">
                <div className="flex flex-col items-center">
                    <Avatar className="mb-4 h-20 w-20">
                        <AvatarFallback className="bg-primary text-lg text-primary-foreground">{getInitials(node.full_name)}</AvatarFallback>
                    </Avatar>

                    <h3 className="text-lg font-medium">
                        {node.full_name}
                        {node.direct_reports_count > 0 && <span className="text-muted-foreground"> ({node.direct_reports_count})</span>}
                    </h3>
                    <p className="mb-2 text-sm text-muted-foreground">{node.title}</p>

                    {node.email ? <p className="mb-4 text-sm text-muted-foreground">{node.email}</p> : null}

                    {node.status !== 'active' && (
                        <Badge variant={node.status === 'open' ? 'outline' : 'secondary'} className="mt-2">
                            {node.status === 'open' ? 'Open Position' : 'Former'}
                        </Badge>
                    )}

                    {node.node_type === 'placeholder' && (
                        <Badge variant="outline" className="mt-2">
                            Placeholder
                        </Badge>
                    )}
                </div>
            </CardContent>

            {/* Hover actions overlay */}
            <div
                className={`pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/5 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 dark:bg-white/5`}
            >
                <div className="pointer-events-auto flex w-[70%] flex-col gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex cursor-pointer items-center justify-center gap-2 bg-white shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                        onClick={handleViewProfile}
                    >
                        <UserIcon className="h-4 w-4" />
                        <span>View Profile</span>
                    </Button>

                    {showAddButton && onAddDirectReport && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex cursor-pointer items-center justify-center gap-2 bg-white shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click from triggering
                                onAddDirectReport(node.id);
                            }}
                        >
                            <PlusCircleIcon className="h-4 w-4" />
                            <span>Add Direct Report</span>
                        </Button>
                    )}

                    {/* Only show View Team button if the person has direct reports */}
                    {onFocus && node.direct_reports_count > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex cursor-pointer items-center justify-center gap-2 bg-white shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click from triggering
                                handleCardClick();
                            }}
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                            <span>View Team</span>
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
