import { useState, useEffect, useCallback } from 'react';
import { CheckInEntry, AttendanceStats } from '../types/attendance.types';
import { attendanceService } from '../services/attendanceService';

export function useAttendance() {
  const [entries, setEntries] = useState<CheckInEntry[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [todayEntries, currentStats] = await Promise.all([
        attendanceService.getToday(),
        attendanceService.getStats().catch(() => null),
      ]);
      setEntries(todayEntries);
      if (currentStats) {
        setStats(currentStats);
      } else {
        // Fallback computed stats if stats endpoint fails
        setStats({
          checkedInToday: todayEntries.length,
          activeNow: todayEntries.filter((e) => !e.checkOutTime).length,
          totalMonthlyCheckIns: todayEntries.length,
        });
      }
    } catch (err: any) {
      console.error('Error loading attendance:', err);
      setError(err.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const checkIn = async (memberId: string, trainerName?: string): Promise<CheckInEntry> => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const newEntry = await attendanceService.checkIn(memberId, trainerName);
      setEntries((prev) => [newEntry, ...prev.filter((e) => e.id !== newEntry.id)]);
      setStats((prev) =>
        prev
          ? {
              ...prev,
              checkedInToday: prev.checkedInToday + 1,
              activeNow: prev.activeNow + 1,
              totalMonthlyCheckIns: prev.totalMonthlyCheckIns + 1,
            }
          : null
      );
      setSuccessMessage(`Checked in ${newEntry.memberName} successfully!`);
      return newEntry;
    } catch (err: any) {
      const msg = err.message || 'Check-in failed';
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const checkOut = async (attendanceId: string): Promise<CheckInEntry> => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updatedEntry = await attendanceService.checkOut(attendanceId);
      setEntries((prev) =>
        prev.map((item) => (item.id === updatedEntry.id ? updatedEntry : item))
      );
      setStats((prev) =>
        prev
          ? {
              ...prev,
              activeNow: Math.max(0, prev.activeNow - 1),
            }
          : null
      );
      setSuccessMessage(`Checked out ${updatedEntry.memberName} successfully.`);
      return updatedEntry;
    } catch (err: any) {
      const msg = err.message || 'Check-out failed';
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return {
    entries,
    stats,
    loading,
    actionLoading,
    error,
    successMessage,
    checkIn,
    checkOut,
    refresh: fetchAttendanceData,
    clearMessages,
  };
}
