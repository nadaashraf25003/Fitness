import { useState, useEffect, useCallback } from 'react';
import { Trainer, ClassSchedule } from '../types/trainer.types';
import { trainerService } from '../services/trainerService';

export function useTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>(() => trainerService.getAll());
  const [schedules, setSchedules] = useState<ClassSchedule[]>(() => trainerService.getSchedules());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainerService.fetchTrainers();
      setTrainers(data);
      setSchedules(trainerService.getSchedules());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trainers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const addTrainer = async (trainer: Omit<Trainer, 'id'>): Promise<Trainer> => {
    try {
      const created = await trainerService.create(trainer);
      setTrainers((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      setError(err.message || 'Failed to add trainer');
      throw err;
    }
  };

  const updateTrainer = async (id: string, updates: Partial<Trainer>): Promise<Trainer | null> => {
    try {
      const updated = await trainerService.update(id, updates);
      if (updated) {
        setTrainers((prev) => prev.map((t) => (t.id === id ? updated : t)));
        if (selectedTrainer?.id === id) {
          setSelectedTrainer(updated);
        }
      }
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update trainer');
      throw err;
    }
  };

  const deleteTrainer = async (id: string): Promise<boolean> => {
    try {
      const success = await trainerService.delete(id);
      if (success) {
        setTrainers((prev) => prev.filter((t) => t.id !== id));
        if (selectedTrainer?.id === id) {
          setSelectedTrainer(null);
        }
      }
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to delete trainer');
      throw err;
    }
  };

  const addSchedule = (schedule: Omit<ClassSchedule, 'id'>): ClassSchedule => {
    const created = trainerService.createSchedule(schedule);
    setSchedules((prev) => [...prev, created]);
    return created;
  };

  return {
    trainers,
    schedules,
    loading,
    error,
    selectedTrainer,
    setSelectedTrainer,
    addTrainer,
    updateTrainer,
    deleteTrainer,
    addSchedule,
    refresh: fetchTrainers,
  };
}

export default useTrainers;
