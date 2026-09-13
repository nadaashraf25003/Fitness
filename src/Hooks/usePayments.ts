import { useState, useEffect } from 'react';
import { PaymentRecord } from '../types/subscription.types';
import { paymentService } from '../services/paymentService';

export function usePayments(branchId: number = 1) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getAll(branchId);
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [branchId]);

  const addPayment = async (payment: Omit<PaymentRecord, 'id'>) => {
    try {
      const newPayment = await paymentService.create(payment);
      setPayments((prev) => [newPayment, ...prev]);
      return newPayment;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment');
      throw err;
    }
  };

  const refresh = () => {
    fetchPayments();
  };

  return {
    payments,
    loading,
    error,
    addPayment,
    refresh,
  };
}
