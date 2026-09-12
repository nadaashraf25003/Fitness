import { BodyMeasurement } from '../types/measurement.types';
import { getStoredItem, setStoredItem } from '../utils/storageUtils';
import measurementsSeed from '../data/measurements.json';

const STORAGE_KEY = 'gym_measurements';

export const measurementService = {
  getAll(): BodyMeasurement[] {
    return getStoredItem<BodyMeasurement[]>(STORAGE_KEY, measurementsSeed as BodyMeasurement[]);
  },

  getByMemberId(memberId: string): BodyMeasurement[] {
    return this.getAll().filter((m) => m.memberId === memberId);
  },

  create(measurement: Omit<BodyMeasurement, 'id'>): BodyMeasurement {
    const list = this.getAll();
    const newEntry: BodyMeasurement = {
      ...measurement,
      id: `meas-${Date.now()}`,
    };
    list.unshift(newEntry);
    setStoredItem(STORAGE_KEY, list);
    return newEntry;
  },
};
