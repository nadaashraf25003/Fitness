import { useState, useEffect, useCallback } from 'react';
import { Plan } from '../types/subscription.types';
import { subscriptionService } from '../services/subscriptionService';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>(() => subscriptionService.getPlans());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionService.fetchPlans();
      setPlans(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch membership plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const addPlan = async (plan: Omit<Plan, 'id'>): Promise<Plan> => {
    try {
      const created = await subscriptionService.createPlan(plan);
      setPlans((prev) => [...prev, created]);
      return created;
    } catch (err: any) {
      setError(err.message || 'Failed to create plan');
      throw err;
    }
  };

  const updatePlan = async (id: string, updates: Partial<Plan>): Promise<Plan | null> => {
    try {
      const updated = await subscriptionService.updatePlan(id, updates);
      if (updated) {
        setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update plan');
      throw err;
    }
  };

  const deletePlan = async (id: string): Promise<boolean> => {
    try {
      const success = await subscriptionService.deletePlan(id);
      if (success) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
      }
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to delete plan');
      throw err;
    }
  };

  return {
    plans,
    loading,
    error,
    addPlan,
    updatePlan,
    deletePlan,
    refresh: fetchPlans,
  };
}

export default usePlans;
