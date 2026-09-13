import { useState, useEffect } from 'react';
import { BodyMeasurement } from '../types/measurement.types';
import { measurementService } from '../services/measurementService';

export function useMeasurements(memberId: string) {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await measurementService.getByMemberId(memberId);
      setMeasurements(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch measurements');
      console.error('Error fetching measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchMeasurements();
    }
  }, [memberId]);

  const addMeasurement = async (measurement: Omit<BodyMeasurement, 'id'>) => {
    try {
      const newMeasurement = await measurementService.create(measurement);
      setMeasurements((prev) => [newMeasurement, ...prev]);
      return newMeasurement;
    } catch (err: any) {
      setError(err.message || 'Failed to create measurement');
      throw err;
    }
  };

  const refresh = () => {
    fetchMeasurements();
  };

  return {
    measurements,
    loading,
    error,
    addMeasurement,
    refresh,
  };
}
