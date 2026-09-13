export interface CheckInEntry {
  id: string;
  memberId: string;
  memberName: string;
  photoUrl?: string | null;
  checkInTime: string;
  checkOutTime?: string | null;
  trainerName?: string;
  date: string;
}

export interface AttendanceStats {
  checkedInToday: number;
  totalMonthlyCheckIns: number;
  activeNow: number;
}
