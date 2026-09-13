export type SubscriptionStatus = 'active' | 'expiring' | 'expired';
export type Gender = 'male' | 'female' | 'other';

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string;
  joinDate: string;
  subscriptionId: string;
  planName: string;
  status: SubscriptionStatus;
  trainerId?: string;
  photoUrl?: string | null;
}
