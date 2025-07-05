import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  /**
   * The text label for the button
   */
  label: string;

  /**
   * Optional icon component to display before the label
   */
  icon?: LucideIcon;

  /**
   * Function to call when the button is clicked
   */
  onClick?: () => void;

  /**
   * Optional additional CSS classes
   */
  className?: string;

  /**
   * Optional variant - defaults to "action" which is styled as black background
   */
  variant?: "action" | "outline" | "secondary";

  /**
   * Button size - defaults to "sm"
   */
  size?: "sm" | "default" | "lg" | "icon";

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
}

/**
 * ActionButton component for standardized action buttons across the application.
 * Primarily used for "New X" buttons with consistent styling.
 */
export function ActionButton({
  label,
  icon: Icon,
  onClick,
  className = "",
  variant = "action",
  size = "sm",
  disabled = false
}: ActionButtonProps) {
  // Define the appropriate variant class based on the variant prop
  const variantClass = variant === "action"
    ? "bg-black hover:bg-gray-800 text-white"
    : "";

  return (
    <Button
      variant={variant === "action" ? "default" : variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 ${variantClass} ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{label}</span>
    </Button>
  );
}

export default ActionButton;
