import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ViewHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const ViewHeader: React.FC<ViewHeaderProps> = ({ title, description, children }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
};

export default ViewHeader;
