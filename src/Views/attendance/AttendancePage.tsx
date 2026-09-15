import React, { useState, useMemo } from 'react';
import { Table, Column } from '../../Components/ui/Table';
import { Button } from '../../Components/ui/Button';
import { FormInput } from '../../Components/ui/FormInput';
import { StatCard } from '../../Components/ui/StatCard';
import { Badge } from '../../Components/ui/Badge';
import { Spinner } from '../../Components/ui/Spinner';
import {
  ClipboardCheck,
  Users,
  Search,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Clock,
  Dumbbell,
  User,
  Filter,
  Building2,
} from 'lucide-react';
import { CheckInEntry } from '../../types/attendance.types';
import { useAttendance } from '../../Hooks/useAttendance';
import { useBranch } from '../../Hooks/useBranch';
import { formatAttendanceTime } from '../../utils/dateUtils';

export const AttendancePage: React.FC = () => {
  const { selectedBranch, setSelectedBranch, branchName, branchLocation, branches } = useBranch();
  const {
    entries,
    stats,
    loading,
    actionLoading,
    error,
    successMessage,
    checkIn,
    checkOut,
    refresh,
    clearMessages,
  } = useAttendance(selectedBranch);

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'inside' | 'checked-out'>('all');
  const [newMemberInput, setNewMemberInput] = useState('');
  const [trainerInput, setTrainerInput] = useState('');
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);

  // Fast Check-In Form Submission
  const handleFastCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = newMemberInput.trim();
    if (!cleanInput) return;

    try {
      await checkIn(cleanInput, trainerInput.trim() || undefined);
      setNewMemberInput('');
      setTrainerInput('');
    } catch {
      // Error handled by hook
    }
  };

  // Individual Check-Out Action
  const handleCheckOut = async (id: string) => {
    try {
      setCheckingOutId(id);
      await checkOut(id);
    } catch {
      // Error handled by hook
    } finally {
      setCheckingOutId(null);
    }
  };

  // Filtered attendance entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Filter by tab
      if (filterTab === 'inside' && entry.checkOutTime) return false;
      if (filterTab === 'checked-out' && !entry.checkOutTime) return false;

      // Filter by search query
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        entry.memberName.toLowerCase().includes(q) ||
        entry.memberId.toLowerCase().includes(q) ||
        (entry.trainerName && entry.trainerName.toLowerCase().includes(q))
      );
    });
  }, [entries, filterTab, search]);

  const insideCount = useMemo(() => entries.filter((e) => !e.checkOutTime).length, [entries]);
  const checkedOutCount = useMemo(() => entries.filter((e) => !!e.checkOutTime).length, [entries]);

  const columns: Column<CheckInEntry>[] = [
    {
      key: 'memberName',
      header: 'Member Name',
      render: (entry) => (
        <div className="flex items-center gap-3">
          {entry.photoUrl ? (
            <img
              src={entry.photoUrl}
              alt={entry.memberName}
              className="w-10 h-10 rounded-full object-cover border border-border-subtle shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface-card border border-border-subtle flex items-center justify-center text-text-muted font-bold text-sm shrink-0">
              {entry.memberName ? entry.memberName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
          )}
          <div className="overflow-hidden">
            <div className="font-semibold text-text-main text-sm truncate">{entry.memberName}</div>
            <div className="text-xs text-text-muted font-mono truncate">{entry.memberId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'checkInTime',
      header: 'Check-In Time',
      render: (entry) => (
        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
          <Clock className="w-3.5 h-3.5 opacity-80 shrink-0" />
          <span>{formatAttendanceTime(entry.checkInTime, entry.date)}</span>
        </div>
      ),
    },
    {
      key: 'trainerName',
      header: 'Session / Trainer',
      render: (entry) =>
        entry.trainerName ? (
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            <span className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
              {entry.trainerName}
            </span>
          </div>
        ) : (
          <span className="text-xs text-text-muted">General Facility</span>
        ),
    },
    {
      key: 'checkOutTime',
      header: 'Facility Status',
      render: (entry) =>
        entry.checkOutTime ? (
          <div className="space-y-0.5">
            <Badge variant="default" size="sm">
              Checked Out
            </Badge>
            <div className="text-[11px] text-text-muted font-mono">
              at {formatAttendanceTime(entry.checkOutTime)}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Badge variant="active" size="sm">
              Inside Facility
            </Badge>
          </div>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (entry) =>
        !entry.checkOutTime ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCheckOut(entry.id)}
            disabled={actionLoading && checkingOutId === entry.id}
            isLoading={actionLoading && checkingOutId === entry.id}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Check Out
          </Button>
        ) : (
          <span className="text-xs text-text-subtle">Completed</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-main flex items-center gap-3">
            <ClipboardCheck className="w-7 h-7 text-brand-primary" />
            Attendance & Front Desk Check-In
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Real-time facility visitor counter, fast front desk check-in, and member attendance logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Branch Selector Pill */}
          <div className="flex items-center gap-1 bg-surface-card border border-border-subtle p-1 rounded-xl">
            {branches.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBranch(b.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedBranch === b.id
                    ? 'bg-brand-primary text-black shadow-sm'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Branch {b.id}: {b.location}</span>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-start justify-between gap-3 text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearMessages}
            className="text-rose-400 hover:text-rose-200 text-xs font-semibold px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-start justify-between gap-3 text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={clearMessages}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-semibold px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Visitors Inside Now"
          value={stats?.activeNow ?? insideCount}
          subtitle="Currently working out"
          icon={<Users className="w-5 h-5" />}
          trend={{
            value: `${stats?.activeNow ?? insideCount} active`,
            isPositive: true,
          }}
        />
        <StatCard
          title="Total Check-Ins Today"
          value={stats?.checkedInToday ?? entries.length}
          subtitle="Today's total visits"
          icon={<ClipboardCheck className="w-5 h-5" />}
        />
        <StatCard
          title="Monthly Facility Visits"
          value={stats?.totalMonthlyCheckIns ?? entries.length}
          subtitle="All recorded check-ins"
          icon={<UserCheck className="w-5 h-5 text-brand-primary" />}
        />
      </div>

      {/* Fast Front-Desk Check-In Form */}
      <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
            1-Click Front Desk Member Check-In
          </h4>
        </div>

        <form onSubmit={handleFastCheckIn} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <FormInput
              placeholder="Scan Barcode, enter Member ID, Code, Phone, or Full Name..."
              value={newMemberInput}
              onChange={(e) => {
                setNewMemberInput(e.target.value);
                if (error || successMessage) clearMessages();
              }}
              required
            />
          </div>
          <div className="md:w-64">
            <FormInput
              placeholder="Assigned Trainer (optional)..."
              value={trainerInput}
              onChange={(e) => setTrainerInput(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={actionLoading && !checkingOutId}
            leftIcon={<ClipboardCheck className="w-4 h-4" />}
            className="shrink-0"
          >
            Check In Member
          </Button>
        </form>
        <p className="text-[11px] text-text-subtle mt-2">
          Tip: Supports Member Code (e.g. 101), Member ID (mem-101), Phone number, Barcode scanner, or full name.
        </p>
      </div>

      {/* Table Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-card rounded-xl border border-border-subtle">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'all'
                ? 'bg-brand-primary text-black shadow-sm'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            All Today ({entries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('inside')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'inside'
                ? 'bg-brand-primary text-black shadow-sm'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Inside Facility ({insideCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('checked-out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'checked-out'
                ? 'bg-brand-primary text-black shadow-sm'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Checked Out ({checkedOutCount})
          </button>
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search today's entries..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-border-subtle rounded-xl text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Attendance Log Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-surface rounded-2xl border border-border-subtle">
          <Spinner />
        </div>
      ) : (
        <Table
          columns={columns}
          data={filteredEntries}
          keyExtractor={(e) => e.id}
          emptyMessage={
            search.trim()
              ? `No attendance records match "${search}".`
              : filterTab === 'inside'
              ? 'No visitors currently inside the facility.'
              : filterTab === 'checked-out'
              ? 'No members have checked out yet today.'
              : 'No attendance logs recorded yet today. Use the check-in box above to record a visit.'
          }
        />
      )}
    </div>
  );
};
