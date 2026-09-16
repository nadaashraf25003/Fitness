import { apiClient } from './apiClient';
import { DashboardStats, TopMemberItem, BranchInfo } from '../types/dashboard.types';
import { AttendanceStats, CheckInEntry } from '../types/attendance.types';
import { PaymentRecord } from '../types/subscription.types';
import { getStoredItem, setStoredItem } from '../utils/storageUtils';

const DASHBOARD_CACHE_KEY = 'gym_dashboard_cache';

/**
 * Default/fallback stats used when the backend is unreachable.
 * Matches the flat API shape:
 * { members, active_subscriptions, pending_requests,
 *   today_subscriptions, today_attendance, today_income }
 */
const defaultStats: DashboardStats = {
  members: 0,
  active_subscriptions: 0,
  pending_requests: 0,
  today_subscriptions: 0,
  today_attendance: 0,
  today_income: 0,
};

export const dashboardService = {
  /**
   * Fetch flat summary statistics for a branch.
   * Endpoint: GET /fitness/admin/dashboard/{branchId}
   *
   * Returns:
   * {
   *   members, active_subscriptions, pending_requests,
   *   today_subscriptions, today_attendance, today_income
   * }
   */
  async getDashboard(branchId: number = 1): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<DashboardStats>(
        `/fitness/admin/dashboard/${branchId}`
      );
      if (response.data) {
        setStoredItem(`${DASHBOARD_CACHE_KEY}_${branchId}`, response.data);
        return response.data;
      }
    } catch (error) {
      console.warn(
        `[dashboardService] GET /fitness/admin/dashboard/${branchId} failed, using cache:`,
        error
      );
    }
    return getStoredItem<DashboardStats>(`${DASHBOARD_CACHE_KEY}_${branchId}`, defaultStats);
  },

  /**
   * Fetch live visitor metrics (checked-in today, currently inside, monthly total).
   * Endpoint: GET /fitness/attendance/stats?branch_id={branchId}
   */
  async getAttendanceStats(branchId?: number): Promise<AttendanceStats> {
    try {
      const url = branchId
        ? `/fitness/attendance/stats?branch_id=${branchId}`
        : '/fitness/attendance/stats';
      const response = await apiClient.get<AttendanceStats>(url);
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('[dashboardService] GET /fitness/attendance/stats failed, using fallback:', error);
    }
    return {
      checkedInToday: 0,
      totalMonthlyCheckIns: 0,
      activeNow: 0,
    };
  },

  /**
   * Fetch today's check-in activity log (recent 5 entries shown on dashboard).
   * Endpoint: GET /fitness/attendance/today?branch_id={branchId}
   */
  async getTodayAttendance(branchId?: number): Promise<CheckInEntry[]> {
    try {
      const url = branchId
        ? `/fitness/attendance/today?branch_id=${branchId}`
        : '/fitness/attendance/today';
      const response = await apiClient.get<CheckInEntry[]>(url);
      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error) {
      console.warn('[dashboardService] GET /fitness/attendance/today failed, using empty list:', error);
    }
    return [];
  },

  /**
   * Fetch top 5 members by attendance count.
   * Endpoint: GET /fitness/admin/report/top-members/{branchId}
   */
  async getTopMembers(branchId: number = 1): Promise<TopMemberItem[]> {
    try {
      const response = await apiClient.get<TopMemberItem[]>(
        `/fitness/admin/report/top-members/${branchId}`
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.slice(0, 5);
      }
    } catch (error) {
      console.warn('[dashboardService] GET /fitness/admin/report/top-members failed:', error);
    }
    return [];
  },

  /**
   * Fetch branch details.
   * Endpoint: GET /fitness/user/branch/{branchId}
   */
  async getBranchInfo(branchId: number = 1): Promise<BranchInfo | null> {
    try {
      const response = await apiClient.get<{ branch: BranchInfo }>(
        `/fitness/user/branch/${branchId}`
      );
      if (response.data?.branch) {
        return response.data.branch;
      }
    } catch (error) {
      console.warn(`[dashboardService] GET /fitness/user/branch/${branchId} failed:`, error);
    }
    return {
      id: branchId,
      name: branchId === 1 ? 'Main Branch' : 'Downtown Branch',
      location: branchId === 1 ? 'Khanqah' : 'City Center',
    };
  },

  /**
   * Compute monthly revenue trend for the last 6 months from payment records.
   * Endpoint: GET /fitness/payments?branch_id={branchId}
   */
  async getRevenueTrend(branchId: number = 1): Promise<{ label: string; value: number }[]> {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months: { key: string; label: string; value: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: monthNames[d.getMonth()],
        value: 0,
      });
    }

    try {
      const response = await apiClient.get<PaymentRecord[]>(
        `/fitness/payments?branch_id=${branchId}`
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        response.data.forEach((p) => {
          if (p.date) {
            const ym = p.date.substring(0, 7);
            const slot = last6Months.find((m) => m.key === ym);
            if (slot) slot.value += Number(p.amount) || 0;
          }
        });
        return last6Months.map((m) => ({ label: m.label, value: Math.round(m.value) }));
      }
    } catch (error) {
      console.warn('[dashboardService] GET /fitness/payments failed, revenue trend unavailable:', error);
    }

    // Return zeros for all 6 months when backend is unavailable
    return last6Months.map((m) => ({ label: m.label, value: 0 }));
  },
};
