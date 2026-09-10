import { SubscriptionStatus } from '../types/member.types';
import { getDaysRemaining } from './dateUtils';

export function getSubscriptionStatus(endDateString: string): SubscriptionStatus {
  if (!endDateString) return 'expired';
  const days = getDaysRemaining(endDateString);
  if (days < 0) return 'expired';
  if (days <= 7) return 'expiring';
  return 'active';
}

export function getStatusColorClass(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'expiring':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'expired':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
}
