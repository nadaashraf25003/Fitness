import { BodyMeasurement } from '../types/measurement.types';
import { apiClient } from './apiClient';
import { getStoredItem, setStoredItem } from '../utils/storageUtils';

const STORAGE_KEY = 'gym_body_measurements';

export const calculateBmi = (weightKg: number, heightCm: number): { bmi: number; category: BodyMeasurement['bmiCategory'] } => {
  const heightM = heightCm / 100;
  if (heightM <= 0 || weightKg <= 0) return { bmi: 0, category: 'normal' };
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  let category: BodyMeasurement['bmiCategory'] = 'normal';
  if (bmi < 18.5) category = 'underweight';
  else if (bmi < 25.0) category = 'normal';
  else if (bmi < 30.0) category = 'overweight';
  else category = 'obese';
  return { bmi, category };
};

const initialMeasurements: BodyMeasurement[] = [
  {
    id: 'meas-101-1',
    memberId: 'mem-101',
    date: new Date(Date.now() - 42 * 86400000).toISOString().split('T')[0], // 6 weeks ago
    weightKg: 84.5,
    heightCm: 178,
    bodyFatPercentage: 22.4,
    chestCm: 104,
    waistCm: 88,
    hipsCm: 99,
    armsCm: 34.5,
    thighsCm: 58,
    bmi: 26.7,
    bmiCategory: 'overweight',
    notes: 'Initial fitness baseline assessment. Goal: reach 78kg & sub-18% body fat.',
  },
  {
    id: 'meas-101-2',
    memberId: 'mem-101',
    date: new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0], // 4 weeks ago
    weightKg: 82.8,
    heightCm: 178,
    bodyFatPercentage: 21.1,
    chestCm: 103,
    waistCm: 86,
    hipsCm: 98,
    armsCm: 35.0,
    thighsCm: 57.5,
    bmi: 26.1,
    bmiCategory: 'overweight',
    notes: 'Great adherence to cardio and strength routine. Waist down 2cm.',
  },
  {
    id: 'meas-101-3',
    memberId: 'mem-101',
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], // 2 weeks ago
    weightKg: 80.6,
    heightCm: 178,
    bodyFatPercentage: 19.5,
    chestCm: 102.5,
    waistCm: 83.5,
    hipsCm: 97,
    armsCm: 35.5,
    thighsCm: 57.0,
    bmi: 25.4,
    bmiCategory: 'overweight',
    notes: 'Noticeable upper body definition and endurance improvement.',
  },
  {
    id: 'meas-101-4',
    memberId: 'mem-101',
    date: new Date().toISOString().split('T')[0], // Today
    weightKg: 78.9,
    heightCm: 178,
    bodyFatPercentage: 18.1,
    chestCm: 102,
    waistCm: 81.5,
    hipsCm: 96,
    armsCm: 36.0,
    thighsCm: 56.5,
    bmi: 24.9,
    bmiCategory: 'normal',
    notes: 'Achieved Healthy Normal BMI status! Down 5.6kg total with visible muscle growth.',
  },
];

export const measurementService = {
  async getByMemberId(memberId: string): Promise<BodyMeasurement[]> {
    const cached = getStoredItem<BodyMeasurement[]>(STORAGE_KEY, initialMeasurements);
    const memberFiltered = cached.filter((m) => m.memberId === memberId || (!memberId && m.memberId === 'mem-101'));

    try {
      const response = await apiClient.get(`/fitness/measurements/member/${memberId}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const mapped: BodyMeasurement[] = response.data.map((item: any) => ({
          id: String(item.id || item.measurement_id || `meas-${Date.now()}`),
          memberId: String(item.member_id || memberId),
          date: item.date || new Date().toISOString().split('T')[0],
          weightKg: Number(item.weight_kg || item.weightKg || 0),
          heightCm: Number(item.height_cm || item.heightCm || 175),
          bodyFatPercentage: item.body_fat_percentage !== undefined ? Number(item.body_fat_percentage) : item.bodyFatPercentage,
          chestCm: item.chest_cm !== undefined ? Number(item.chest_cm) : item.chestCm,
          waistCm: item.waist_cm !== undefined ? Number(item.waist_cm) : item.waistCm,
          hipsCm: item.hips_cm !== undefined ? Number(item.hips_cm) : item.hipsCm,
          armsCm: item.arms_cm !== undefined ? Number(item.arms_cm) : item.armsCm,
          thighsCm: item.thighs_cm !== undefined ? Number(item.thighs_cm) : item.thighsCm,
          bmi: Number(item.bmi || calculateBmi(item.weight_kg || item.weightKg || 0, item.height_cm || item.heightCm || 175).bmi),
          bmiCategory: item.bmi_category || item.bmiCategory || calculateBmi(item.weight_kg || item.weightKg || 0, item.height_cm || item.heightCm || 175).category,
          notes: item.notes || '',
        }));

        // Merge with local storage
        const allLocal = getStoredItem<BodyMeasurement[]>(STORAGE_KEY, initialMeasurements);
        const otherMembers = allLocal.filter((m) => m.memberId !== memberId);
        setStoredItem(STORAGE_KEY, [...mapped, ...otherMembers]);
        return mapped;
      }
    } catch (error: any) {
      console.warn('Backend /fitness/measurements API unavailable, using local cache:', error);
    }

    return memberFiltered.length > 0 ? memberFiltered : (memberId === 'mem-101' ? initialMeasurements : []);
  },

  async create(measurement: Omit<BodyMeasurement, 'id'>): Promise<BodyMeasurement> {
    const { bmi, category } = calculateBmi(measurement.weightKg, measurement.heightCm);
    const newEntry: BodyMeasurement = {
      ...measurement,
      id: `meas-${Date.now()}`,
      bmi: measurement.bmi || bmi,
      bmiCategory: measurement.bmiCategory || category,
    };

    const all = getStoredItem<BodyMeasurement[]>(STORAGE_KEY, initialMeasurements);
    all.unshift(newEntry);
    setStoredItem(STORAGE_KEY, all);

    try {
      await apiClient.post('/fitness/measurements', {
        member_id: measurement.memberId,
        date: measurement.date,
        weight_kg: measurement.weightKg,
        height_cm: measurement.heightCm,
        body_fat_percentage: measurement.bodyFatPercentage,
        chest_cm: measurement.chestCm,
        waist_cm: measurement.waistCm,
        hips_cm: measurement.hipsCm,
        arms_cm: measurement.armsCm,
        thighs_cm: measurement.thighsCm,
        notes: measurement.notes,
      });
    } catch (error: any) {
      console.warn('Backend POST /fitness/measurements error, saved to local cache:', error);
    }

    return newEntry;
  },

  async delete(measurementId: string): Promise<boolean> {
    const all = getStoredItem<BodyMeasurement[]>(STORAGE_KEY, initialMeasurements);
    const filtered = all.filter((m) => m.id !== measurementId);
    setStoredItem(STORAGE_KEY, filtered);

    try {
      await apiClient.delete(`/fitness/measurements/${measurementId}`);
    } catch (error: any) {
      console.warn(`Backend DELETE /fitness/measurements/${measurementId} error:`, error);
    }

    return true;
  },
};
