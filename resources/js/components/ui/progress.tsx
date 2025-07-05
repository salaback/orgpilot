import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
  max?: number;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className,
  max = 100
}) => {
  const percentage = Math.min(Math.max(value, 0), max);

  return (
    <div className={cn("w-full bg-gray-200 rounded-full dark:bg-gray-700", className)}>
      <div
        className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${(percentage / max) * 100}%` }}
      />
    </div>
  );
};
