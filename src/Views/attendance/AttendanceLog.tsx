import React from 'react';
import { Table, Column } from '../../Components/ui/Table';
import { Badge } from '../../Components/ui/Badge';
import { CheckInEntry } from '../../types/attendance.types';
import { formatAttendanceTime } from '../../utils/dateUtils';
import { User, Clock } from 'lucide-react';

interface AttendanceLogProps {
  entries: CheckInEntry[];
  onCheckOut?: (id: string) => void;
  actionLoading?: boolean;
}

export const AttendanceLog: React.FC<AttendanceLogProps> = ({
  entries,
  onCheckOut,
  actionLoading,
}) => {
  const columns: Column<CheckInEntry>[] = [
    {
      key: 'memberName',
      header: 'Member',
      render: (e) => (
        <div className="flex items-center gap-3">
          {e.photoUrl ? (
            <img
              src={e.photoUrl}
              alt={e.memberName}
              className="w-9 h-9 rounded-full object-cover border border-border-subtle"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-surface-card border border-border-subtle flex items-center justify-center text-text-muted font-bold text-xs">
              {e.memberName ? e.memberName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
          )}
          <div>
            <div className="font-semibold text-text-main text-sm">{e.memberName}</div>
            <div className="text-[11px] text-text-muted font-mono">{e.memberId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'checkInTime',
      header: 'Check-In',
      render: (e) => (
        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
          <Clock className="w-3.5 h-3.5 opacity-80" />
          <span>{formatAttendanceTime(e.checkInTime, e.date)}</span>
        </div>
      ),
    },
    {
      key: 'checkOutTime',
      header: 'Check-Out',
      render: (e) => (
        <span className="text-xs font-mono text-text-muted">
          {e.checkOutTime ? formatAttendanceTime(e.checkOutTime) : '--:--'}
        </span>
      ),
    },
    {
      key: 'trainerName',
      header: 'Trainer Session',
      render: (e) =>
        e.trainerName ? (
          <span className="text-xs px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            {e.trainerName}
          </span>
        ) : (
          <span className="text-xs text-text-muted">General Access</span>
        ),
    },
    {
      key: 'status',
      header: 'Facility Status',
      render: (e) =>
        e.checkOutTime ? (
          <Badge variant="default" size="sm">
            Checked Out
          </Badge>
        ) : (
          <Badge variant="active" size="sm">
            Inside Facility
          </Badge>
        ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={entries}
      keyExtractor={(e) => e.id}
      emptyMessage="No attendance records found."
    />
  );
};
