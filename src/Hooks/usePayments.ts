import { useState, useEffect } from 'react';
import { PaymentRecord } from '../types/subscription.types';
import { paymentService } from '../services/paymentService';

export function usePayments(branchId: number = 1) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [incomeReport, setIncomeReport] = useState<any>(null);
  const [subscriptionReport, setSubscriptionReport] = useState<any>(null);
  const [topMembers, setTopMembers] = useState<any>(null);
  const [expiredSubscriptions, setExpiredSubscriptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all reports in parallel
      const [payments, income, subscriptions, topMems, expired] = await Promise.all([
        paymentService.getAll(),
        paymentService.getIncomeReport(branchId),
        paymentService.getSubscriptionReport(branchId),
        paymentService.getTopMembers(branchId),
        paymentService.getExpiredSubscriptions(branchId),
      ]);

      setPayments(payments);
      setIncomeReport(income);
      setSubscriptionReport(subscriptions);
      setTopMembers(topMems);
      setExpiredSubscriptions(expired);
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
    incomeReport,
    subscriptionReport,
    topMembers,
    expiredSubscriptions,
    loading,
    error,
    addPayment,
    refresh,
  };
}
