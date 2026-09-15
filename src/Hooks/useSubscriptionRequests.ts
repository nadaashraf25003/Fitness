import { useState, useEffect, useCallback } from 'react';
import { SubscriptionRequest } from '../types/subscription.types';
import { subscriptionService } from '../services/subscriptionService';

export function useSubscriptionRequests(branchId: number = 1) {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionService.fetchRequests(branchId);
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscription requests');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const approveRequest = async (id: string) => {
    setActionLoading(id);
    setError(null);
    setSuccessMessage(null);
    try {
      await subscriptionService.approveRequest(id);
      await fetchRequests();
      setSuccessMessage('Subscription request approved & member successfully provisioned!');
    } catch (err: any) {
      setError(err.message || 'Failed to approve request');
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const rejectRequest = async (id: string) => {
    setActionLoading(id);
    setError(null);
    setSuccessMessage(null);
    try {
      await subscriptionService.rejectRequest(id);
      await fetchRequests();
      setSuccessMessage('Subscription request rejected.');
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return {
    requests,
    loading,
    actionLoading,
    error,
    successMessage,
    refreshRequests: fetchRequests,
    approveRequest,
    rejectRequest,
    clearMessages,
  };
}

export default useSubscriptionRequests;
