import React from 'react';
import { OrgNode } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon } from 'lucide-react';

interface OrgNodeCardProps {
  node: OrgNode;
  onAddDirectReport?: (managerId: number) => void;
  showAddButton?: boolean;
  onFocus?: (node: OrgNode) => void; // New prop for focusing on a node
}

export function OrgNodeCard({
  node,
  onAddDirectReport,
  showAddButton = true,
  onFocus
}: OrgNodeCardProps) {
  const getInitials = useInitials();

  // Handler for clicking on the card content
  const handleCardClick = () => {
    if (onFocus) {
      onFocus(node);
    }
  };

  return (
    <Card
      className={`w-[280px] ${onFocus ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onFocus ? handleCardClick : undefined}
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

      {showAddButton && onAddDirectReport && (
        <CardFooter className="pt-0 pb-4 px-6">
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click from triggering
              onAddDirectReport(node.id);
            }}
          >
            <PlusCircleIcon className="h-4 w-4" />
            <span>Add Direct Report</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
