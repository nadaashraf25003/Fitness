import { Trainer, ClassSchedule } from '../types/trainer.types';
import { apiClient } from './apiClient';

export const trainerService = {
  /**
   * Synchronous helper for initial render state (empty array before backend fetch)
   */
  getAll(): Trainer[] {
    return [];
  },

  /**
   * Async fetch from backend API /fitness/trainers directly
   */
  async fetchTrainers(): Promise<Trainer[]> {
    try {
      const response = await apiClient.get<Trainer[]>('/fitness/trainers');
      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error: any) {
      console.error('Backend API /fitness/trainers error:', error);
      throw error;
    }
    return [];
  },

  /**
   * Get trainer by ID directly from backend API
   */
  async getById(id: string): Promise<Trainer | null> {
    try {
      const response = await apiClient.get<Trainer>(`/fitness/trainers/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Backend API /fitness/trainers/${id} error:`, error);
      return null;
    }
  },

  /**
   * Create new trainer directly in backend API
   */
  async create(trainer: Omit<Trainer, 'id'>): Promise<Trainer> {
    try {
      const payload: any = {
        full_name: trainer.fullName,
        specialty: trainer.specialty,
        bio: trainer.bio,
        hourly_rate: trainer.hourlyRate,
        phone: trainer.phone,
        email: trainer.email,
        photo_url: trainer.photoUrl || null,
        is_available: trainer.isAvailable,
        assigned_members_count: trainer.assignedMembersCount || 0,
        branch_id: trainer.branchId || 1,
      };
      const response = await apiClient.post<Trainer>('/fitness/trainers', payload);
      return response.data;
    } catch (error: any) {
      console.error('Backend API POST /fitness/trainers failed:', error);
      throw error;
    }
  },

  /**
   * Update trainer profile directly in backend API
   */
  async update(id: string, updates: Partial<Trainer>): Promise<Trainer | null> {
    try {
      const payload: any = {};
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.specialty !== undefined) payload.specialty = updates.specialty;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.hourlyRate !== undefined) payload.hourly_rate = updates.hourlyRate;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;
      if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;
      if (updates.assignedMembersCount !== undefined) payload.assigned_members_count = updates.assignedMembersCount;
      if (updates.branchId !== undefined) payload.branch_id = updates.branchId;

      const response = await apiClient.put<Trainer>(`/fitness/trainers/${id}`, payload);
      return response.data;
    } catch (error: any) {
      console.error(`Backend API PUT /fitness/trainers/${id} failed:`, error);
      throw error;
    }
  },

  /**
   * Delete trainer directly in backend API
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/fitness/trainers/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Backend API DELETE /fitness/trainers/${id} failed:`, error);
      throw error;
    }
  },

  // ==========================================
  // SCHEDULES & SESSIONS (IN-MEMORY API)
  // ==========================================

  getSchedules(_trainerId?: string): ClassSchedule[] {
    return [];
  },

  createSchedule(schedule: Omit<ClassSchedule, 'id'>): ClassSchedule {
    return {
      ...schedule,
      id: `cls-${Date.now()}`,
    };
  },
};

export default trainerService;
