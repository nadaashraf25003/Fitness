import { SubscriptionRequest, RequestStatus } from '../types/subscription.types';
import { getStoredItem, setStoredItem } from '../utils/storageUtils';

const STORAGE_KEY = 'gym_subscription_requests';

const initialRequests: SubscriptionRequest[] = [
  {
    id: 'req-101',
    fullName: 'James Wilson',
    email: 'james.w@example.com',
    phone: '01000000001',
    planId: 'plan-pro',
    planName: 'Pro 3-Month',
    requestedStartDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: 'Preferred morning time slot',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req-102',
    fullName: 'Sophia Chen',
    email: 'sophia.c@example.com',
    phone: '01000000002',
    planId: 'plan-vip',
    planName: 'VIP Annual',
    requestedStartDate: new Date().toISOString().split('T')[0],
    status: 'approved',
    notes: 'Corporate discount applied',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const subscriptionService = {
  getRequests(): SubscriptionRequest[] {
    return getStoredItem<SubscriptionRequest[]>(STORAGE_KEY, initialRequests);
  },

  submitRequest(
    data: Omit<SubscriptionRequest, 'id' | 'createdAt' | 'status'>
  ): SubscriptionRequest {
    const requests = this.getRequests();
    const newRequest: SubscriptionRequest = {
      ...data,
      id: `req-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    requests.unshift(newRequest);
    setStoredItem(STORAGE_KEY, requests);
    return newRequest;
  },

  updateRequestStatus(id: string, status: RequestStatus): SubscriptionRequest | null {
    const requests = this.getRequests();
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) return null;
    requests[index].status = status;
    setStoredItem(STORAGE_KEY, requests);
    return requests[index];
  },
};

export default subscriptionService;
