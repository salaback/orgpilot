import React, { useState } from 'react';
import { OrgNode } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, UserIcon } from 'lucide-react';
import axios from 'axios';

interface OrgListViewProps {
  rootNode: OrgNode;
  initialReports: OrgNode[];
  onViewProfile?: (node: OrgNode) => void;
  onAddDirectReport?: (managerId: number) => void;
}

export function OrgListView({
  rootNode,
  initialReports,
  onViewProfile,
  onAddDirectReport
}: OrgListViewProps) {
  const getInitials = useInitials();
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({ [rootNode.id]: true });
  const [nodeDirectReports, setNodeDirectReports] = useState<Record<number, OrgNode[]>>({
    [rootNode.id]: initialReports
  });
  const [loadingNodes, setLoadingNodes] = useState<Record<number, boolean>>({});

  // Toggle the expanded state of a node
  const toggleNodeExpansion = async (nodeId: number) => {
    // If we're expanding a node and don't have its direct reports yet, fetch them
    if (!expandedNodes[nodeId] && (!nodeDirectReports[nodeId] || nodeDirectReports[nodeId].length === 0)) {
      await fetchDirectReports(nodeId);
    }

    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Fetch direct reports for a node
  const fetchDirectReports = async (nodeId: number) => {
    // Don't fetch if we're already loading or have the data
    if (loadingNodes[nodeId] || (nodeDirectReports[nodeId] && nodeDirectReports[nodeId].length > 0)) {
      return;
    }

    setLoadingNodes(prev => ({ ...prev, [nodeId]: true }));

    try {
      const response = await axios.get(`/organisation/person/${nodeId}/direct-reports`);
      const reports = response.data.directReports || [];

      setNodeDirectReports(prev => ({
        ...prev,
        [nodeId]: reports
      }));
    } catch (error) {
      console.error('Error fetching direct reports:', error);
    } finally {
      setLoadingNodes(prev => ({ ...prev, [nodeId]: false }));
    }
  };

  // Render a single node in the list
  const renderNode = (node: OrgNode, level = 0) => {
    const hasDirectReports = (node.direct_reports_count ?? 0) > 0;
    const isExpanded = expandedNodes[node.id] || false;
    const directReports = nodeDirectReports[node.id] || [];
    const isLoading = loadingNodes[node.id] || false;

    return (
      <React.Fragment key={node.id}>
        <div
          className={`
            flex items-center py-1.5 px-3 hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors ${level > 0 ? 'border-l-2 border-gray-200 dark:border-gray-700' : ''}
          `}
          style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
        >
          {/* Expand/collapse button or spacer */}
          {hasDirectReports ? (
            <Button
              variant="ghost"
              size="icon"
              className="mr-1.5 h-5 w-5 p-0"
              onClick={() => toggleNodeExpansion(node.id)}
            >
              {isLoading ? (
                <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-primary"></div>
              ) : isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-5 mr-1.5"></div>
          )}

          {/* Avatar */}
          <Avatar className="h-6 w-6 mr-2">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(node.full_name)}
            </AvatarFallback>
          </Avatar>

          {/* Person info */}
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-sm font-medium">{node.full_name}</span>
              {(node.direct_reports_count ?? 0) > 0 && (
                <span className="text-xs text-muted-foreground ml-2">({node.direct_reports_count})</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{node.title}</div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-1.5 mr-1.5">
            {node.status !== 'active' && (
              <Badge variant={node.status === 'open' ? 'outline' : 'secondary'} className="text-xs px-1.5 py-0.5">
                {node.status === 'open' ? 'Open Position' : 'Former'}
              </Badge>
            )}
            {node.node_type === 'placeholder' && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">Placeholder</Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onViewProfile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewProfile(node)}
                className="h-6 w-6"
                title="View Profile"
              >
                <UserIcon className="h-3 w-3" />
              </Button>
            )}
            {onAddDirectReport && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddDirectReport(node.id)}
                className="h-6 w-6"
                title="Add Direct Report"
              >
                <span className="text-sm font-bold">+</span>
              </Button>
            )}
          </div>
        </div>

        {/* Render children if expanded */}
        {isExpanded && directReports.length > 0 && (
          <div>
            {directReports.map(report => renderNode(report, level + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-900 py-2 px-4 border-b font-medium">
        Organization Structure
      </div>
      <div>
        {/* Root node (manager) with direct reports nested inside */}
        <div className="py-1.5 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center">
          {/* Expand/collapse button */}
          {initialReports.length > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="mr-1.5 h-5 w-5 p-0"
              onClick={() => toggleNodeExpansion(rootNode.id)}
            >
              {expandedNodes[rootNode.id] ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-5 mr-1.5"></div>
          )}

          {/* Root node information */}
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-sm font-semibold">{rootNode.full_name}</span>
              {(rootNode.direct_reports_count ?? 0) > 0 && (
                <span className="text-xs text-muted-foreground ml-2">({rootNode.direct_reports_count})</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{rootNode.title}</div>
          </div>

          {/* Add direct report button */}
          {onAddDirectReport && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddDirectReport(rootNode.id)}
              className="h-6 w-6"
              title="Add Direct Report"
            >
              <span className="text-sm font-bold">+</span>
            </Button>
          )}
        </div>

        {/* Direct reports */}
        {expandedNodes[rootNode.id] && initialReports.map(report => (
          renderNode(report, 1)
        ))}
      </div>
    </div>
  );
}
