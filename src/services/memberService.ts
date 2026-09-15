import { Member } from '../types/member.types';
import { apiClient } from './apiClient';

export const memberService = {
  /**
   * Synchronous helper for initial render state (empty array before backend fetch)
   */
  getAll(_params?: { search?: string; status?: string; branch_id?: number; branchId?: number }): Member[] {
    return [];
  },

  /**
   * Fetch all members from backend API directly
   */
  async fetchMembers(params?: { search?: string; status?: string; branch_id?: number; branchId?: number }): Promise<Member[]> {
    try {
      const apiParams: any = {};
      if (params?.search?.trim()) apiParams.search = params.search.trim();
      if (params?.status && params.status !== 'all') apiParams.status = params.status;
      const targetBranch = params?.branch_id || params?.branchId;
      if (targetBranch) apiParams.branch_id = targetBranch;

      const response = await apiClient.get<Member[]>('/fitness/members', { params: apiParams });
      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error: any) {
      console.error('Backend API /fitness/members error:', error);
      throw error;
    }
    return [];
  },

  /**
   * Get single member by ID directly from backend API
   */
  async getById(id: string): Promise<Member | null> {
    try {
      const response = await apiClient.get<Member>(`/fitness/members/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Backend API /fitness/members/${id} error:`, error);
      return null;
    }
  },

  /**
   * Create a new member directly in backend API
   */
  async create(member: Omit<Member, 'id'>): Promise<Member> {
    try {
      const payload: any = {
        full_name: member.fullName,
        email: member.email,
        phone: member.phone,
        gender: member.gender,
        date_of_birth: member.dateOfBirth,
        join_date: member.joinDate,
        subscription_id: member.subscriptionId,
        plan_name: member.planName,
        status: member.status,
        branch_id: member.branchId || 1,
        photo_url: member.photoUrl || null,
        trainer_id: member.trainerId || null,
      };
      const response = await apiClient.post<Member>('/fitness/members', payload);
      return response.data;
    } catch (error: any) {
      console.error('Backend API POST /fitness/members failed:', error);
      throw error;
    }
  },

  /**
   * Update an existing member directly in backend API
   */
  async update(id: string, updates: Partial<Member>): Promise<Member | null> {
    try {
      const payload: any = {};
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.gender !== undefined) payload.gender = updates.gender;
      if (updates.dateOfBirth !== undefined) payload.date_of_birth = updates.dateOfBirth;
      if (updates.joinDate !== undefined) payload.join_date = updates.joinDate;
      if (updates.subscriptionId !== undefined) payload.subscription_id = updates.subscriptionId;
      if (updates.planName !== undefined) payload.plan_name = updates.planName;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.branchId !== undefined) payload.branch_id = updates.branchId;
      if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;
      if (updates.trainerId !== undefined) payload.trainer_id = updates.trainerId;

      const response = await apiClient.put<Member>(`/fitness/members/${id}`, payload);
      return response.data;
    } catch (error: any) {
      console.error(`Backend API PUT /fitness/members/${id} failed:`, error);
      throw error;
    }
  },

  /**
   * Delete a member directly in backend API
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/fitness/members/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Backend API DELETE /fitness/members/${id} failed:`, error);
      throw error;
    }
  },
};

export default memberService;
