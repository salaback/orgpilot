import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';

interface SheetPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function SheetPanel({ open, onClose, title, description, children, footer, className }: SheetPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className={className || 'w-full sm:max-w-md overflow-y-auto p-6'}>
        <SheetHeader className="mb-6">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        {children}
        {footer && <SheetFooter className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}

