export interface TodaySubscriptions {
  new: number;
  renew: number;
  extend: number;
  cancel: number;
}

export interface TodayIncome {
  cash: number;
  visa: number;
  transfer: number;
  total: number;
}

export interface DashboardStats {
  members: number;
  active_subscriptions: number;
  pending_requests: number;
  today_subscriptions: TodaySubscriptions;
  today_attendance: number;
  today_income: TodayIncome;
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
