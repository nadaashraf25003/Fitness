import { Trainer, ClassSchedule } from '../types/trainer.types';
import { apiClient } from './apiClient';
import { getStoredItem, setStoredItem } from '../utils/storageUtils';

const STORAGE_KEY = 'gym_trainers';
const SCHEDULES_KEY = 'gym_class_schedules';

const initialTrainers: Trainer[] = [
  {
    id: 'trn-1',
    fullName: 'Alex Rivera',
    specialty: 'Strength & Hypertrophy',
    bio: 'Certified CSCS coach with 8+ years experience helping clients build muscle, increase functional strength, and master compound lifts.',
    hourlyRate: 45.0,
    phone: '+1 555-0192',
    email: 'alex.rivera@gym.com',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    isAvailable: true,
    assignedMembersCount: 12,
  },
  {
    id: 'trn-2',
    fullName: 'Sarah Jenkins',
    specialty: 'HIIT & Weight Loss',
    bio: 'Former collegiate athlete specializing in high-intensity conditioning, metabolic conditioning, and sustainable body transformation.',
    hourlyRate: 40.0,
    phone: '+1 555-0193',
    email: 'sarah.jenkins@gym.com',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
    isAvailable: true,
    assignedMembersCount: 16,
  },
  {
    id: 'trn-3',
    fullName: 'Dmitri Petrov',
    specialty: 'Olympic Weightlifting & Mobility',
    bio: 'USAW Level 2 sports performance specialist dedicated to clean & jerk, snatch technique, and advanced joint mobility.',
    hourlyRate: 55.0,
    phone: '+1 555-0194',
    email: 'dmitri.p@gym.com',
    photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300',
    isAvailable: true,
    assignedMembersCount: 9,
  },
];

const initialSchedules: ClassSchedule[] = [
  {
    id: 'cls-1',
    name: 'Strength Foundations & Barbell Tech',
    trainerId: 'trn-1',
    trainerName: 'Alex Rivera',
    dayOfWeek: 'Monday',
    startTime: '08:00',
    endTime: '09:30',
    capacity: 15,
    enrolled: 12,
  },
  {
    id: 'cls-2',
    name: 'High Octane HIIT & Metabolic Burn',
    trainerId: 'trn-2',
    trainerName: 'Sarah Jenkins',
    dayOfWeek: 'Tuesday',
    startTime: '10:00',
    endTime: '11:15',
    capacity: 20,
    enrolled: 18,
  },
  {
    id: 'cls-3',
    name: 'Power Clean & Snatch Clinic',
    trainerId: 'trn-3',
    trainerName: 'Dmitri Petrov',
    dayOfWeek: 'Wednesday',
    startTime: '16:00',
    endTime: '17:30',
    capacity: 10,
    enrolled: 8,
  },
  {
    id: 'cls-4',
    name: 'Hypertrophy Upper Body Hyper-Drive',
    trainerId: 'trn-1',
    trainerName: 'Alex Rivera',
    dayOfWeek: 'Thursday',
    startTime: '17:30',
    endTime: '19:00',
    capacity: 16,
    enrolled: 14,
  },
  {
    id: 'cls-5',
    name: 'Cardio Kickboxing & Core Sculpt',
    trainerId: 'trn-2',
    trainerName: 'Sarah Jenkins',
    dayOfWeek: 'Friday',
    startTime: '18:00',
    endTime: '19:15',
    capacity: 22,
    enrolled: 21,
  },
  {
    id: 'cls-6',
    name: 'Full Body Mobility & Kinetic Recovery',
    trainerId: 'trn-3',
    trainerName: 'Dmitri Petrov',
    dayOfWeek: 'Saturday',
    startTime: '11:00',
    endTime: '12:30',
    capacity: 15,
    enrolled: 11,
  },
];

export const trainerService = {
  /**
   * Synchronous get for immediate render
   */
  getAll(): Trainer[] {
    const cached = getStoredItem<Trainer[]>(STORAGE_KEY, initialTrainers);
    this.fetchTrainers().catch(() => {});
    return cached;
  },

  /**
   * Async fetch from backend API /fitness/trainers
   */
  async fetchTrainers(): Promise<Trainer[]> {
    try {
      const response = await apiClient.get<Trainer[]>('/fitness/trainers');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setStoredItem(STORAGE_KEY, response.data);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API /fitness/trainers unavailable, using local cache:', error);
    }
    return getStoredItem<Trainer[]>(STORAGE_KEY, initialTrainers);
  },

  /**
   * Get trainer by ID
   */
  async getById(id: string): Promise<Trainer | null> {
    try {
      const response = await apiClient.get<Trainer>(`/fitness/trainers/${id}`);
      return response.data;
    } catch (error) {
      const list = this.getAll();
      return list.find((t) => t.id === id) || null;
    }
  },

  /**
   * Create new trainer
   */
  async create(trainer: Omit<Trainer, 'id'>): Promise<Trainer> {
    try {
      const response = await apiClient.post<Trainer>('/fitness/trainers', trainer);
      if (response.data && response.data.id) {
        const list = getStoredItem<Trainer[]>(STORAGE_KEY, initialTrainers);
        list.unshift(response.data);
        setStoredItem(STORAGE_KEY, list);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API POST /fitness/trainers failed, saving locally:', error);
    }

    const list = getStoredItem<Trainer[]>(STORAGE_KEY, initialTrainers);
    const newTrainer: Trainer = {
      ...trainer,
      id: `trn-${Date.now()}`,
    };
    list.unshift(newTrainer);
    setStoredItem(STORAGE_KEY, list);
    return newTrainer;
  },

  /**
   * Update trainer profile
   */
  async update(id: string, updates: Partial<Trainer>): Promise<Trainer | null> {
    try {
      const response = await apiClient.put<Trainer>(`/fitness/trainers/${id}`, updates);
      if (response.data) {
        const list = getStoredItem<Trainer[]>(STORAGE_KEY, initialTrainers);
        const idx = list.findIndex((t) => t.id === id);
        if (idx !== -1) {
          list[idx] = response.data;
          setStoredItem(STORAGE_KEY, list);
        }
        return response.data;
      }
    } catch (error) {
      console.warn(`Backend API PUT /fitness/trainers/${id} failed, updating locally:`, error);
    }

    const list = getStoredItem<Trainer[]>(STORAGE_KEY, initialTrainers);
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStoredItem(STORAGE_KEY, list);
    return list[idx];
  },

  /**
   * Delete trainer
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/fitness/trainers/${id}`);
    } catch (error) {
      console.warn(`Backend API DELETE /fitness/trainers/${id} failed, removing locally:`, error);
    }

    const list = getStoredItem<Trainer[]>(STORAGE_KEY, initialTrainers);
    const filtered = list.filter((t) => t.id !== id);
    setStoredItem(STORAGE_KEY, filtered);
    return true;
  },

  // ==========================================
  // SCHEDULES & SESSIONS
  // ==========================================

  getSchedules(trainerId?: string): ClassSchedule[] {
    const list = getStoredItem<ClassSchedule[]>(SCHEDULES_KEY, initialSchedules);
    if (trainerId) {
      return list.filter((s) => s.trainerId === trainerId);
    }
    return list;
  },

  createSchedule(schedule: Omit<ClassSchedule, 'id'>): ClassSchedule {
    const list = getStoredItem<ClassSchedule[]>(SCHEDULES_KEY, initialSchedules);
    const newSchedule: ClassSchedule = {
      ...schedule,
      id: `cls-${Date.now()}`,
    };
    list.push(newSchedule);
    setStoredItem(SCHEDULES_KEY, list);
    return newSchedule;
  },
};

export default trainerService;
