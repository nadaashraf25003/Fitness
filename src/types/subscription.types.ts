export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
}

export interface SubscriptionRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  planId: string;
  planName: string;
  requestedStartDate: string;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  subscriptionId: string;
  amount: number;
  date: string;
  method: 'cash' | 'card' | 'transfer' | 'online';
  status: 'paid' | 'partial' | 'unpaid';
}
