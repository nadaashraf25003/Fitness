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
  planId?: string;
  planName?: string;
  requestedStartDate?: string;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
  requestType?: 'new' | 'renew' | 'extend' | 'cancel' | string;
  paidAmount?: number;
  paymentMethod?: string;
  duration?: number;
  branchId?: number;
  memberCode?: string | number;
  memberId?: string | number;
  /** Local checkout simulation only; no bank transaction is made. */
  simulatePayment?: boolean;
}

export interface AdminPendingRequest {
  requestId: string | number;
  memberName: string;
  memberCode: string | number;
  requestType: string;
  duration: number;
  paidAmount: number;
  paymentMethod: string;
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  subscriptionId: string;
  amount: number;
  date: string;
  method: 'cash' | 'visa';
  status: 'paid' | 'partial' | 'unpaid';
}
