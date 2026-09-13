import { BodyMeasurement } from '../types/measurement.types';
import { apiClient } from './apiClient';

export const measurementService = {
  async getByMemberId(memberId: string): Promise<BodyMeasurement[]> {
    try {
      const response = await apiClient.get(`/measurements/member/${memberId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch measurements:', error);
      throw error;
    }
  },

  async create(measurement: Omit<BodyMeasurement, 'id'>): Promise<BodyMeasurement> {
    try {
      const response = await apiClient.post('/measurements', measurement);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create measurement:', error);
      throw error;
    }
  },
};
