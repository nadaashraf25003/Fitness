import React from 'react';
import { RequestStatus } from '../../types/subscription.types';

interface BadgeProps {
  variant: RequestStatus;
  children: React.ReactNode;
}

const styles: Record<RequestStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${styles[variant]}`}>
    {children}
  </span>
);
