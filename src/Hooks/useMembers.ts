import { useState, useEffect, useCallback } from 'react';
import { Member, SubscriptionStatus } from '../types/member.types';
import { memberService } from '../services/memberService';

export function useMembers(branchId?: number) {
  const [members, setMembers] = useState<Member[]>(() => memberService.getAll({ branch_id: branchId }));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams: { search?: string; status?: string; branch_id?: number } = {};
      if (branchId) filterParams.branch_id = branchId;
      if (search.trim()) filterParams.search = search.trim();
      if (statusFilter !== 'all') filterParams.status = statusFilter;

      const data = await memberService.fetchMembers(filterParams);
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [branchId, search, statusFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (member: Omit<Member, 'id'>): Promise<Member> => {
    try {
      const created = await memberService.create(member);
      setMembers((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
      throw err;
    }
  };

  const updateMember = async (id: string, updates: Partial<Member>): Promise<Member | null> => {
    try {
      const updated = await memberService.update(id, updates);
      if (updated) {
        setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
        if (selectedMember?.id === id) {
          setSelectedMember(updated);
        }
      }
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update member');
      throw err;
    }
  };

  const deleteMember = async (id: string): Promise<boolean> => {
    try {
      const success = await memberService.delete(id);
      if (success) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        if (selectedMember?.id === id) {
          setSelectedMember(null);
        }
      }
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to delete member');
      throw err;
    }
  };

  return {
    members,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    selectedMember,
    setSelectedMember,
    addMember,
    updateMember,
    deleteMember,
    refresh: fetchMembers,
  };
}

export default useMembers;
