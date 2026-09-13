import React from 'react';

export type BadgeVariant =
  | 'active'
  | 'expiring'
  | 'expired'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'admin'
  | 'staff'
  | 'info'
  | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  const variantStyles: Record<BadgeVariant, string> = {
    active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    expiring: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse',
    expired: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    rejected: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    admin: 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30',
    staff: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    info: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    default: 'bg-surface-elevated text-text-muted border border-border-subtle',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full uppercase tracking-wider font-semibold ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
