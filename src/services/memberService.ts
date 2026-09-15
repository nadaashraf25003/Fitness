import { Member } from '../types/member.types';
import { apiClient } from './apiClient';
import { getStoredItem, setStoredItem } from '../utils/storageUtils';

const STORAGE_KEY = 'gym_members';

const initialMembers: Member[] = [
  {
    id: 'mem-15',
    memberCode: '15',
    barcode: '123456789',
    branchId: 1,
    fullName: 'Ahmed',
    email: 'ahmed@example.com',
    phone: '01012345678',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    gender: 'male',
    dateOfBirth: '1995-03-10',
    joinDate: new Date().toISOString().split('T')[0],
    subscriptionId: 'sub-32',
    planName: 'Monthly Standard',
    status: 'active',
  },
  {
    id: 'mem-101',
    memberCode: '101',
    barcode: '101010101',
    branchId: 1,
    fullName: 'James Wilson',
    email: 'james.w@example.com',
    phone: '01000000001',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    gender: 'male',
    dateOfBirth: '1992-05-14',
    joinDate: new Date().toISOString().split('T')[0],
    subscriptionId: 'sub-pro',
    planName: 'Pro 3-Month',
    status: 'active',
  },
  {
    id: 'mem-102',
    memberCode: '102',
    barcode: '102020202',
    branchId: 1,
    fullName: 'Sophia Chen',
    email: 'sophia.c@example.com',
    phone: '01000000002',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    gender: 'female',
    dateOfBirth: '1996-08-22',
    joinDate: new Date().toISOString().split('T')[0],
    subscriptionId: 'sub-vip',
    planName: 'VIP Annual',
    status: 'active',
  },
  {
    id: 'mem-103',
    memberCode: '103',
    barcode: '103030303',
    branchId: 1,
    fullName: 'Ahmed Ali',
    email: 'ahmed.ali@example.com',
    phone: '01000000003',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    gender: 'male',
    dateOfBirth: '1990-11-05',
    joinDate: '2026-07-15',
    subscriptionId: 'sub-basic',
    planName: 'Basic Monthly',
    status: 'expired',
  },
];

export const memberService = {
  /**
   * Synchronous get for immediate offline/component initial state
   */
  getAll(params?: { search?: string; status?: string }): Member[] {
    const cached = getStoredItem<Member[]>(STORAGE_KEY, initialMembers);
    this.fetchMembers(params).catch(() => {});

    let list = cached;
    if (params?.status) {
      list = list.filter((m) => m.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.toLowerCase().includes(q)
      );
    }
    return list;
  },

  /**
   * Fetch all members from backend API
   */
  async fetchMembers(params?: { search?: string; status?: string }): Promise<Member[]> {
    try {
      const response = await apiClient.get<Member[]>('/fitness/members', { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        setStoredItem(STORAGE_KEY, response.data);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API /fitness/members unavailable, using cached members:', error);
    }

    let list = getStoredItem<Member[]>(STORAGE_KEY, initialMembers);
    if (params?.status) {
      list = list.filter((m) => m.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.toLowerCase().includes(q)
      );
    }
    return list;
  },

  /**
   * Get single member by ID
   */
  async getById(id: string): Promise<Member | null> {
    try {
      const response = await apiClient.get<Member>(`/fitness/members/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend API /fitness/members/${id} unavailable, checking local storage:`, error);
      const list = getStoredItem<Member[]>(STORAGE_KEY, initialMembers);
      return list.find((m) => m.id === id) || null;
    }
  },

  /**
   * Create a new member
   */
  async create(member: Omit<Member, 'id'>): Promise<Member> {
    try {
      const response = await apiClient.post<Member>('/fitness/members', member);
      if (response.data && response.data.id) {
        const list = getStoredItem<Member[]>(STORAGE_KEY, initialMembers);
        list.unshift(response.data);
        setStoredItem(STORAGE_KEY, list);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API POST /fitness/members failed, persisting locally:', error);
    }

    const list = getStoredItem<Member[]>(STORAGE_KEY, initialMembers);
    const newMember: Member = {
      ...member,
      id: `mem-${Date.now()}`,
      memberCode: String(Math.floor(100 + Math.random() * 900)),
      barcode: String(Math.floor(100000000 + Math.random() * 900000000)),
    };
    list.unshift(newMember);
    setStoredItem(STORAGE_KEY, list);
    return newMember;
  },

  /**
   * Update an existing member
   */
  async update(id: string, updates: Partial<Member>): Promise<Member | null> {
    try {
      const response = await apiClient.put<Member>(`/fitness/members/${id}`, updates);
      if (response.data) {
        const list = getStoredItem<Member[]>(STORAGE_KEY, initialMembers);
        const idx = list.findIndex((m) => m.id === id);
        if (idx !== -1) {
          list[idx] = response.data;
          setStoredItem(STORAGE_KEY, list);
        }
        return response.data;
      }
    } catch (error) {
      console.warn(`Backend API PUT /fitness/members/${id} failed, updating locally:`, error);
    }

    const list = getStoredItem<Member[]>(STORAGE_KEY, initialMembers);
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStoredItem(STORAGE_KEY, list);
    return list[idx];
  },

  /**
   * Delete a member
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/fitness/members/${id}`);
    } catch (error) {
      console.warn(`Backend API DELETE /fitness/members/${id} failed, removing locally:`, error);
    }

    const list = getStoredItem<Member[]>(STORAGE_KEY, initialMembers);
    const filtered = list.filter((m) => m.id !== id);
    setStoredItem(STORAGE_KEY, filtered);
    return true;
  },
};

export default memberService;
