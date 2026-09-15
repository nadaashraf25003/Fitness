import { useState, useEffect, useCallback } from 'react';

const BRANCH_STORAGE_KEY = 'gym_selected_branch';
const BRANCH_CHANGE_EVENT = 'gym_branch_changed';

export interface GymBranch {
  id: number;
  name: string;
  location: string;
  code: string;
}

export const GYM_BRANCHES: GymBranch[] = [
  { id: 1, name: 'Main Branch', location: 'Khanqah', code: 'BR-1' },
  { id: 2, name: 'Downtown Branch', location: 'City Center', code: 'BR-2' },
];

export function getStoredBranch(): number {
  try {
    const raw = localStorage.getItem(BRANCH_STORAGE_KEY);
    if (raw) {
      const parsed = Number(raw);
      if (parsed === 1 || parsed === 2) return parsed;
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return 1;
}

export function setStoredBranch(branchId: number): void {
  try {
    localStorage.setItem(BRANCH_STORAGE_KEY, String(branchId));
    window.dispatchEvent(new CustomEvent(BRANCH_CHANGE_EVENT, { detail: branchId }));
  } catch (e) {
    // Ignore storage write errors
  }
}

export function useBranch() {
  const [selectedBranch, setSelectedBranchState] = useState<number>(() => getStoredBranch());

  useEffect(() => {
    const handleBranchChange = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (customEvent.detail) {
        setSelectedBranchState(customEvent.detail);
      } else {
        setSelectedBranchState(getStoredBranch());
      }
    };

    window.addEventListener(BRANCH_CHANGE_EVENT, handleBranchChange);
    window.addEventListener('storage', handleBranchChange);

    return () => {
      window.removeEventListener(BRANCH_CHANGE_EVENT, handleBranchChange);
      window.removeEventListener('storage', handleBranchChange);
    };
  }, []);

  const changeBranch = useCallback((id: number) => {
    setSelectedBranchState(id);
    setStoredBranch(id);
  }, []);

  const currentBranch = GYM_BRANCHES.find((b) => b.id === selectedBranch) || GYM_BRANCHES[0];

  return {
    selectedBranch,
    setSelectedBranch: changeBranch,
    branchName: currentBranch.name,
    branchLocation: currentBranch.location,
    branchCode: currentBranch.code,
    branches: GYM_BRANCHES,
  };
}

export default useBranch;
