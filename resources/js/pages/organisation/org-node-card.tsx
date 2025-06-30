import React, { useState } from 'react';
import { OrgNode } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon, UserIcon, ChevronRightIcon } from 'lucide-react';

interface OrgNodeCardProps {
  node: OrgNode;
  onAddDirectReport?: (managerId: number) => void;
  showAddButton?: boolean;
  onFocus?: (node: OrgNode) => void;
  onViewProfile?: (node: OrgNode) => void;
}

export function OrgNodeCard({
  node,
  onAddDirectReport,
  showAddButton = true,
  onFocus,
  onViewProfile
}: OrgNodeCardProps) {
  const getInitials = useInitials();
  const [isHovering, setIsHovering] = useState(false);

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
      className={`w-[280px] ${onFocus ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} relative group`}
      onClick={onFocus ? handleCardClick : undefined}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials(node.full_name)}
            </AvatarFallback>
          </Avatar>

          <h3 className="text-lg font-medium">
            {node.full_name}
            {node.direct_reports_count > 0 && (
              <span className="text-muted-foreground"> ({node.direct_reports_count})</span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{node.title}</p>

          {node.email && (
            <p className="text-sm text-muted-foreground mb-4">{node.email}</p>
          )}

          {node.status !== 'active' && (
            <Badge variant={node.status === 'open' ? 'outline' : 'secondary'} className="mt-2">
              {node.status === 'open' ? 'Open Position' : 'Former'}
            </Badge>
          )}

          {node.node_type === 'placeholder' && (
            <Badge variant="outline" className="mt-2">Placeholder</Badge>
          )}
        </div>
      </CardContent>

      {/* Hover actions overlay */}
      <div className={`absolute inset-0 bg-black/5 dark:bg-white/5 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg ${isHovering ? 'z-10' : '-z-10'}`}>
        <div className="flex flex-col gap-2 w-[70%]">
          <Button
            variant="outline"
            size="sm"
            className="bg-white dark:bg-gray-800 flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleViewProfile}
          >
            <UserIcon className="h-4 w-4" />
            <span>View Profile</span>
          </Button>

          {showAddButton && onAddDirectReport && (
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-800 flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
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
              className="bg-white dark:bg-gray-800 flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleCardClick}
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
