import { BodyMeasurement } from '../types/measurement.types';
import { apiClient } from './apiClient';

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

export const measurementService = {
  /**
   * Fetch measurements for a member directly from backend API
   */
  async getByMemberId(memberId: string): Promise<BodyMeasurement[]> {
    if (!memberId) return [];

    try {
      const response = await apiClient.get(`/fitness/measurements/member/${memberId}`);
      if (Array.isArray(response.data)) {
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
        return mapped;
      }
    } catch (error: any) {
      console.error('Backend /fitness/measurements API error:', error);
      throw error;
    }

    return [];
  },

  /**
   * Record a new measurement session directly in backend API
   */
  async create(measurement: Omit<BodyMeasurement, 'id'>): Promise<BodyMeasurement> {
    const { bmi, category } = calculateBmi(measurement.weightKg, measurement.heightCm);

    try {
      const response = await apiClient.post('/fitness/measurements', {
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

      if (response.data) {
        const item = response.data;
        return {
          id: String(item.id || item.measurement_id || `meas-${Date.now()}`),
          memberId: String(item.member_id || measurement.memberId),
          date: item.date || measurement.date,
          weightKg: Number(item.weight_kg || measurement.weightKg),
          heightCm: Number(item.height_cm || measurement.heightCm),
          bodyFatPercentage: item.body_fat_percentage !== undefined ? Number(item.body_fat_percentage) : measurement.bodyFatPercentage,
          chestCm: item.chest_cm !== undefined ? Number(item.chest_cm) : measurement.chestCm,
          waistCm: item.waist_cm !== undefined ? Number(item.waist_cm) : measurement.waistCm,
          hipsCm: item.hips_cm !== undefined ? Number(item.hips_cm) : measurement.hipsCm,
          armsCm: item.arms_cm !== undefined ? Number(item.arms_cm) : measurement.armsCm,
          thighsCm: item.thighs_cm !== undefined ? Number(item.thighs_cm) : measurement.thighsCm,
          bmi: Number(item.bmi || bmi),
          bmiCategory: item.bmi_category || category,
          notes: item.notes || measurement.notes || '',
        };
      }
    } catch (error: any) {
      console.error('Backend POST /fitness/measurements error:', error);
      throw error;
    }

    return {
      ...measurement,
      id: `meas-${Date.now()}`,
      bmi,
      bmiCategory: category,
    };
  },

  /**
   * Delete a measurement record directly in backend API
   */
  async delete(measurementId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/fitness/measurements/${measurementId}`);
      return true;
    } catch (error: any) {
      console.error(`Backend DELETE /fitness/measurements/${measurementId} error:`, error);
      throw error;
    }
  },
};

export default measurementService;
