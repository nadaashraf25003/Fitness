import { useState, useEffect } from 'react';
import { SubscriptionRequest } from '../types/subscription.types';
import { subscriptionService } from '../services/subscriptionService';

export function useSubscriptionRequests() {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshRequests = () => {
    setLoading(true);
    const data = subscriptionService.getRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshRequests();
  }, []);

  const approveRequest = (id: string) => {
    subscriptionService.updateRequestStatus(id, 'approved');
    refreshRequests();
  };

  const rejectRequest = (id: string) => {
    subscriptionService.updateRequestStatus(id, 'rejected');
    refreshRequests();
  };

  return {
    requests,
    loading,
    refreshRequests,
    approveRequest,
    rejectRequest,
  };
}
