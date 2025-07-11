import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import React from 'react';

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
            <SheetContent className={className || 'w-full overflow-y-auto p-6 sm:max-w-md'}>
                <SheetHeader className="mb-6">
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                {children}
                {footer && <SheetFooter className="mt-8 border-t border-gray-200 pt-4 dark:border-gray-700">{footer}</SheetFooter>}
            </SheetContent>
        </Sheet>
    );
}
