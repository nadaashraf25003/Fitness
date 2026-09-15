import { CheckInEntry, AttendanceStats } from '../types/attendance.types';
import { apiClient } from './apiClient';

export interface AttendanceFilterParams {
  date?: string;
  memberId?: string;
  branchId?: number;
}

export const attendanceService = {
  /**
   * Fetch today's check-in logs
   */
  async getToday(branchId?: number): Promise<CheckInEntry[]> {
    try {
      const response = await apiClient.get<CheckInEntry[]>('/fitness/attendance/today', {
        params: branchId ? { branch_id: branchId } : undefined,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to fetch today attendance';
      console.error('Failed to fetch today attendance:', message);
      throw new Error(message);
    }
  },

  /**
   * Fetch attendance logs with optional filters
   */
  async getAll(params?: AttendanceFilterParams): Promise<CheckInEntry[]> {
    try {
      const response = await apiClient.get<CheckInEntry[]>('/fitness/attendance', { params });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to fetch attendance history';
      console.error('Failed to fetch attendance:', message);
      throw new Error(message);
    }
  },

  /**
   * Fetch high-level facility visitor statistics
   */
  async getStats(branchId?: number): Promise<AttendanceStats> {
    try {
      const response = await apiClient.get<AttendanceStats>('/fitness/attendance/stats', {
        params: branchId ? { branch_id: branchId } : undefined,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to fetch attendance stats';
      console.error('Failed to fetch attendance stats:', message);
      throw new Error(message);
    }
  },

  /**
   * Record member check-in timestamp
   */
  async checkIn(memberId: string, trainerName?: string, branchId?: number): Promise<CheckInEntry> {
    try {
      const response = await apiClient.post<CheckInEntry>('/fitness/attendance/check-in', {
        memberId,
        trainerName: trainerName?.trim() || undefined,
        branchId: branchId || 1,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to check in member';
      console.error('Failed to check in:', message);
      throw new Error(message);
    }
  },

  /**
   * Record member check-out timestamp
   */
  async checkOut(attendanceId?: string, memberId?: string): Promise<CheckInEntry> {
    try {
      const response = await apiClient.post<CheckInEntry>('/fitness/attendance/check-out', {
        attendanceId,
        memberId,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to check out member';
      console.error('Failed to check out:', message);
      throw new Error(message);
    }
  },

  /**
   * Fetch attendance history for a specific member
   */
  async getMemberHistory(memberId: string): Promise<CheckInEntry[]> {
    try {
      const response = await apiClient.get<CheckInEntry[]>(`/fitness/attendance/member/${memberId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to fetch member attendance history';
      console.error('Failed to fetch member attendance history:', message);
      throw new Error(message);
    }
  },
};
