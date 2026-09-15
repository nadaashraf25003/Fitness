import { useState, useEffect, useCallback } from 'react';
import { SubscriptionRequest } from '../types/subscription.types';
import { subscriptionService } from '../services/subscriptionService';

export function useSubscriptionRequests(branchId: number = 1) {
  const [requests, setRequests] = useState<SubscriptionRequest[]>(() =>
    subscriptionService.getRequests()
  );
  const [loading, setLoading] = useState<boolean>(false);
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

  // Keep the inbox in sync with new requests submitted from the public site.
  // The backend remains the source of truth; this simply avoids requiring the
  // administrator to press Refresh before seeing a new payment request.
  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchRequests();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [fetchRequests]);

  const approveRequest = async (id: string) => {
    setActionLoading(id);
    setError(null);
    setSuccessMessage(null);
    try {
      await subscriptionService.approveRequest(id);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r))
      );
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
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r))
      );
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
