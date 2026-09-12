import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border-subtle bg-surface/30 ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center text-brand-primary mb-4 border border-border-subtle">
          {icon}
        </div>
      )}
      <h4 className="text-lg font-bold text-text-main font-heading mb-1">{title}</h4>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
