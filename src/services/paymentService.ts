import { PaymentRecord } from '../types/subscription.types';
import { apiClient } from './apiClient';

export const paymentService = {
  async getAll(branchId: number = 1): Promise<PaymentRecord[]> {
    try {
      const response = await apiClient.get(`/payments?branch_id=${branchId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch payments:', error);
      throw error;
    }
  },

  async getByMemberId(memberId: string): Promise<PaymentRecord[]> {
    try {
      const response = await apiClient.get(`/payments/member/${memberId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch member payments:', error);
      throw error;
    }
  },

  async getIncomeReport(branchId: number = 1): Promise<any> {
    try {
      const response = await apiClient.get(`/admin/report/income/${branchId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch income report:', error);
      throw error;
    }
  },

  async getSubscriptionReport(branchId: number = 1): Promise<any> {
    try {
      const response = await apiClient.get(`/admin/report/subscriptions/${branchId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch subscription report:', error);
      throw error;
    }
  },

  async getTopMembers(branchId: number = 1): Promise<any> {
    try {
      const response = await apiClient.get(`/admin/report/top-members/${branchId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch top members:', error);
      throw error;
    }
  },

  async getExpiredSubscriptions(branchId: number = 1): Promise<any> {
    try {
      const response = await apiClient.get(`/admin/report/expired-subscriptions/${branchId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch expired subscriptions:', error);
      throw error;
    }
  },

  async create(payment: Omit<PaymentRecord, 'id'>): Promise<PaymentRecord> {
    try {
      const response = await apiClient.post('/payments', payment);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create payment:', error);
      throw error;
    }
  },
};
