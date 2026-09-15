import { Plan, RequestStatus, SubscriptionRequest } from '../types/subscription.types';
import { getStoredItem, setStoredItem } from '../utils/storageUtils';

const REQUESTS_KEY = 'subscription_requests';

type NewRequest = Omit<SubscriptionRequest, 'id' | 'status' | 'createdAt'>;

export const subscriptionService = {
  getRequests(): SubscriptionRequest[] {
    return getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, []);
  },

  submitRequest(request: NewRequest): SubscriptionRequest {
    const created: SubscriptionRequest = {
      ...request,
      id: `req-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setStoredItem(REQUESTS_KEY, [created, ...this.getRequests()]);
    return created;
  },

  updateRequestStatus(id: string, status: RequestStatus): void {
    setStoredItem(
      REQUESTS_KEY,
      this.getRequests().map((request) => (request.id === id ? { ...request, status } : request)),
    );
  },
};
