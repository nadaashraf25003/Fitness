export interface Trainer {
  id: string;
  fullName: string;
  specialty: string;
  bio: string;
  hourlyRate: number;
  phone: string;
  email: string;
  photoUrl?: string;
  isAvailable: boolean;
  assignedMembersCount: number;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  className: string;
  trainerId: string;
  trainerName: string;
}

export interface ClassSchedule {
  id: string;
  name: string;
  trainerId: string;
  trainerName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolled: number;
}
