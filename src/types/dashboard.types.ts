/**
 * Flat dashboard statistics returned by GET /fitness/admin/dashboard/{branch_id}
 *
 * Shape:
 * {
 *   "members": 0,
 *   "active_subscriptions": 0,
 *   "pending_requests": 0,
 *   "today_subscriptions": 0,
 *   "today_attendance": 0,
 *   "today_income": 0
 * }
 */
export interface DashboardStats {
  members: number;
  active_subscriptions: number;
  pending_requests: number;
  /** Total count of approved subscriptions that started today */
  today_subscriptions: number;
  today_attendance: number;
  /** Total income collected today (all payment methods combined) */
  today_income: number;
}

export interface TopMemberItem {
  member_id: string | number;
  member_code: string | number;
  name: string;
  attendance_count: number;
}

export interface BranchInfo {
  id: number;
  name: string;
  location: string;
  phone?: string;
  price_per_month?: number;
  offers?: string;
}
