import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Hooks/useAuth';
import { StatCard } from '../../Components/ui/StatCard';
import { BarChart } from '../../Components/charts/BarChart';
import { DonutChart } from '../../Components/charts/DonutChart';
import {
  Users,
  ClipboardCheck,
  DollarSign,
  Inbox,
  ArrowUpRight,
  Activity,
  RefreshCw,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Wallet,
  Landmark,
  Trophy,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../Routing/routePaths';
import { dashboardService } from '../../services/dashboardService';
import { DashboardStats, TopMemberItem } from '../../types/dashboard.types';
import { AttendanceStats, CheckInEntry } from '../../types/attendance.types';

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // State management
  const [selectedBranch, setSelectedBranch] = useState<number>(1);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInEntry[]>([]);
  const [topMembers, setTopMembers] = useState<TopMemberItem[]>([]);
  const [revenueData, setRevenueData] = useState<{ label: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Data fetching
  const loadDashboardData = useCallback(async (branchId: number, isSilentRefresh = false) => {
    if (!isSilentRefresh) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const [
        dashStats,
        attStats,
        todayAtt,
        topMems,
        revTrend,
      ] = await Promise.all([
        dashboardService.getDashboard(branchId),
        dashboardService.getAttendanceStats(branchId),
        dashboardService.getTodayAttendance(branchId),
        dashboardService.getTopMembers(branchId),
        dashboardService.getRevenueTrend(branchId),
      ]);

      setStats(dashStats);
      setAttendanceStats(attStats);
      setRecentCheckIns(todayAtt.slice(0, 5));
      setTopMembers(topMems);
      setRevenueData(revTrend);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err?.message || 'Failed to synchronize with backend server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(selectedBranch);
  }, [selectedBranch, loadDashboardData]);

  // Derived Donut Chart data from backend stats
  const activeSubs = stats?.active_subscriptions || 0;
  const pendingReqs = stats?.pending_requests || 0;
  const totalMems = stats?.members || 0;
  const otherOrExpired = Math.max(totalMems - activeSubs - pendingReqs, 0);

  const membershipDonutData = [
    { label: 'Active', value: activeSubs, color: '#22C55E' },
    { label: 'Pending', value: pendingReqs, color: '#F59E0B' },
    { label: 'Expired / Other', value: otherOrExpired, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with Branch Selector & Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-brand-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Backend Connected
            </span>
            <span className="text-[11px] text-text-subtle hidden sm:inline">
              Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-main mt-2">
            Welcome back, {user?.name || 'Administrator'} 👋
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Real-time gym operations, membership statistics, and facility analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* Branch Switcher */}
          <div className="flex items-center bg-surface-card border border-border-subtle rounded-xl p-1 shadow-inner">
            <Building2 className="w-4 h-4 text-brand-primary ml-2.5 mr-1.5" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(Number(e.target.value))}
              aria-label="Gym Branch Location"
              className="bg-transparent text-xs sm:text-sm font-semibold text-text-main focus:outline-none pr-3 py-1.5 cursor-pointer"
            >
              <option value={1} className="bg-surface text-text-main">Branch 1: Main Branch (Khanqah)</option>
              <option value={2} className="bg-surface text-text-main">Branch 2: Downtown Branch (City Center)</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadDashboardData(selectedBranch, true)}
            disabled={isRefreshing || isLoading}
            aria-label="Refresh Dashboard Data"
            className="p-2.5 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary/50 text-text-muted hover:text-brand-primary transition-all disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-primary' : ''}`} />
          </button>

          {/* Quick Check-In CTA */}
          <Link
            to={PATHS.ATTENDANCE}
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-black font-semibold text-xs sm:text-sm shadow-md hover:bg-brand-primary-hover active:scale-95 transition-all flex items-center gap-2"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Quick Check-In</span>
          </Link>
        </div>
      </div>

      {/* Error notification banner if any */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-400 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadDashboardData(selectedBranch)}
            className="underline font-semibold hover:text-rose-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading && !stats ? (
          // Skeleton loaders
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface p-6 rounded-2xl border border-border-subtle animate-pulse space-y-4">
              <div className="h-4 bg-surface-card rounded w-24" />
              <div className="h-8 bg-surface-card rounded w-16" />
              <div className="h-3 bg-surface-card rounded w-32" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Total Active Members"
              value={stats?.active_subscriptions ?? 0}
              subtitle={`${stats?.members ?? 0} registered in branch`}
              icon={<Users className="w-5 h-5" />}
              trend={{
                value: `${Math.round(((stats?.active_subscriptions || 0) / Math.max(stats?.members || 1, 1)) * 100)}% active`,
                isPositive: true,
              }}
            />
            <StatCard
              title="Today's Check-Ins"
              value={stats?.today_attendance ?? attendanceStats?.checkedInToday ?? 0}
              subtitle={`Currently inside: ${attendanceStats?.activeNow ?? 0}`}
              icon={<ClipboardCheck className="w-5 h-5" />}
              trend={{
                value: `${attendanceStats?.totalMonthlyCheckIns ?? 0} this month`,
                isPositive: true,
              }}
            />
            <StatCard
              title="Pending Inquiries"
              value={stats?.pending_requests ?? 0}
              subtitle="Public membership requests"
              icon={<Inbox className="w-5 h-5" />}
              trend={
                (stats?.pending_requests ?? 0) > 0
                  ? { value: `${stats?.pending_requests} need review`, isPositive: false }
                  : { value: 'All caught up', isPositive: true }
              }
            />
            <StatCard
              title="Today's Revenue"
              value={`$${(stats?.today_income?.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`Cash: $${stats?.today_income?.cash ?? 0} | Visa: $${stats?.today_income?.visa ?? 0}`}
              icon={<DollarSign className="w-5 h-5" />}
              trend={{
                value: `+$${stats?.today_income?.transfer ?? 0} transfer`,
                isPositive: true,
              }}
            />
          </>
        )}
      </div>

      {/* Today's Income & Subscription Breakdown Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] font-medium text-text-subtle uppercase block">Cash Collected</span>
            <span className="text-base font-bold text-text-main">
              ${(stats?.today_income?.cash ?? 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] font-medium text-text-subtle uppercase block">Visa / POS</span>
            <span className="text-base font-bold text-text-main">
              ${(stats?.today_income?.visa ?? 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] font-medium text-text-subtle uppercase block">Bank Transfer</span>
            <span className="text-base font-bold text-text-main">
              ${(stats?.today_income?.transfer ?? 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] font-medium text-text-subtle uppercase block">Today's Plans</span>
            <span className="text-base font-bold text-text-main">
              +{(stats?.today_subscriptions?.new ?? 0) + (stats?.today_subscriptions?.renew ?? 0)} Renewed
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChart
            title={`Monthly Revenue Trend ($ USD) — Branch ${selectedBranch}`}
            data={revenueData}
            barColor="bg-brand-primary"
            height={220}
          />
        </div>
        <div>
          <DonutChart
            title="Subscription Health Breakdown"
            data={membershipDonutData}
            totalLabel="Members"
          />
        </div>
      </div>

      {/* Live Activity Feed & Frequent Attendees Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Check-ins Today */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-bold font-heading text-text-main">
                  Live Attendance Feed (Today)
                </h3>
              </div>
              <Link
                to={PATHS.ATTENDANCE}
                className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-medium"
              >
                View Full Log <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentCheckIns.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No check-ins recorded yet for today.
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckIns.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt={item.memberName}
                          className="w-9 h-9 rounded-full object-cover border border-border-subtle"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center border border-brand-primary/20">
                          {item.memberName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-semibold text-text-main">{item.memberName}</div>
                        <div className="text-[11px] text-text-subtle">
                          ID: #{item.memberId.replace('mem-', '')}
                          {item.trainerName && ` • Coach ${item.trainerName}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-subtle">
            <span>Currently Active: <strong className="text-emerald-400">{attendanceStats?.activeNow ?? 0}</strong></span>
            <span>Total Today: <strong className="text-text-main">{stats?.today_attendance ?? 0}</strong></span>
          </div>
        </div>

        {/* Top Attendees Leaderboard */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold font-heading text-text-main">
                  Top Members Attendance Leaderboard
                </h3>
              </div>
              <span className="text-[11px] text-text-subtle">Branch {selectedBranch}</span>
            </div>

            {topMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No attendance statistics available.
              </div>
            ) : (
              <div className="space-y-3">
                {topMembers.map((member, index) => {
                  const medalColors = [
                    'bg-amber-400/20 text-amber-400 border-amber-400/30',
                    'bg-slate-300/20 text-slate-200 border-slate-300/30',
                    'bg-amber-700/20 text-amber-600 border-amber-700/30',
                  ];
                  const rankClass = index < 3 ? medalColors[index] : 'bg-surface-card text-text-subtle border-border-subtle';

                  return (
                    <div
                      key={String(member.member_id)}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border ${rankClass}`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-text-main">{member.name}</div>
                          <div className="text-[11px] text-text-subtle">
                            Member #{member.member_code}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-text-main font-mono">
                          {member.attendance_count}{' '}
                          <span className="text-[10px] font-normal text-text-subtle">visits</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-subtle">
            <span>Ranking metric: Check-in frequency</span>
            <Link to={PATHS.PAYMENTS} className="text-brand-primary hover:underline flex items-center gap-1">
              View reports <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Navigation & Team Modules Container */}
      <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold font-heading text-text-main flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-primary" />
            Operational Quick Navigation
          </h3>
          <span className="text-xs text-text-subtle">Staff & Management Quicklinks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            to={PATHS.ATTENDANCE}
            className="p-4 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary/50 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                Attendance Log
              </div>
              <div className="text-xs text-text-muted mt-0.5">Check in/out and visitor count</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-subtle group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            to={PATHS.TRAINERS}
            className="p-4 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary/50 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                Trainers & Schedules
              </div>
              <div className="text-xs text-text-muted mt-0.5">Coach profiles & class bookings</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-subtle group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            to={PATHS.MEASUREMENTS}
            className="p-4 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary/50 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                Body Measurements
              </div>
              <div className="text-xs text-text-muted mt-0.5">Weight, body fat %, and BMI</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-subtle group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          {isAdmin && (
            <>
              <Link
                to={PATHS.SUBSCRIPTIONS}
                className="p-4 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                    Subscriptions & Members
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">Member CRUD & plan assignment</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-subtle group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>

              <Link
                to={PATHS.SUBSCRIPTION_REQUESTS}
                className="p-4 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                    Requests Inbox
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">1-click approve inquiries</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-subtle group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>

              <Link
                to={PATHS.PAYMENTS}
                className="p-4 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                    Payments & Billing
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">Transaction ledgers & receipts</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-subtle group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
