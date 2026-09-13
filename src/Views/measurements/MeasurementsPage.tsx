import React, { useState } from 'react';
import { LineChart } from '../../Components/charts/LineChart';
import { Button } from '../../Components/ui/Button';
import { Plus, Activity, Scale, Percent, HeartPulse } from 'lucide-react';
import { StatCard } from '../../Components/ui/StatCard';
import { useMeasurements } from '../../Hooks/useMeasurements';
import { useAuth } from '../../Hooks/useAuth';
import { Spinner } from '../../Components/ui/Spinner';

export const MeasurementsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedMemberId] = useState<string>(user?.id || 'mem-101');
  const [showModal, setShowModal] = useState(false);
  
  const { measurements, loading, error } = useMeasurements(selectedMemberId);

  // Prepare chart data from measurements - create a sorted copy without mutation
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const chartData = sortedMeasurements.map((m, index) => ({
    label: `Week ${(index + 1) * 2}`,
    value: m.weightKg,
  }));

  // Calculate stats from measurements
  const latestMeasurement = measurements[0];
  const oldestMeasurement = measurements[measurements.length - 1];
  
  const weightChange = latestMeasurement && oldestMeasurement 
    ? -(oldestMeasurement.weightKg - latestMeasurement.weightKg).toFixed(1)
    : '0';
  
  // Handle optional bodyFatPercentage
  const bodyFatChange = 
    latestMeasurement?.bodyFatPercentage !== undefined && 
    oldestMeasurement?.bodyFatPercentage !== undefined
      ? -(oldestMeasurement.bodyFatPercentage - latestMeasurement.bodyFatPercentage).toFixed(1)
      : null;
  
  const healthyBMIPercentage = measurements.filter(m => 
    m.bmiCategory === 'normal' || m.bmiCategory === 'underweight'
  ).length > 0 ? '100' : '0';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        <p>Failed to load measurements: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-main flex items-center gap-3">
            <Activity className="w-7 h-7 text-brand-primary" />
            Body Composition & Progress Metrics
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Track weight, body fat %, circumferences, automated BMI calculator, and Before/After progression.
          </p>
        </div>

        <Button 
          variant="primary" 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowModal(true)}
        >
          Log Measurement Session
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Weight Change"
          value={`${weightChange} kg`}
          subtitle="From baseline to latest"
          icon={<Scale className="w-5 h-5" />}
          trend={{ value: weightChange > '0' ? 'Weight Loss!' : 'Gaining', isPositive: parseFloat(weightChange) < 0 }}
        />
        <StatCard
          title="Body Fat Reduction"
          value={bodyFatChange ? `${bodyFatChange}%` : 'No Data'}
          subtitle={bodyFatChange ? 'Progress in muscle definition' : 'Not recorded in this period'}
          icon={<Percent className="w-5 h-5" />}
          trend={bodyFatChange ? { value: parseFloat(bodyFatChange) < 0 ? 'Improving' : 'Increasing', isPositive: parseFloat(bodyFatChange) < 0 } : undefined}
        />
        <StatCard
          title="Healthy BMI Status"
          value={healthyBMIPercentage === '100' ? 'Yes' : 'In Progress'}
          subtitle="Current BMI category"
          icon={<HeartPulse className="w-5 h-5" />}
          trend={{ value: healthyBMIPercentage === '100' ? 'Target Met' : 'Working on it', isPositive: healthyBMIPercentage === '100' }}
        />
      </div>

      {/* Progress Chart */}
      {chartData.length > 0 ? (
        <LineChart
          title="Member Weight Progression (kg)"
          data={chartData}
          primaryLabel="Weight (kg)"
          height={220}
        />
      ) : (
        <div className="bg-surface rounded-lg p-8 text-center text-text-muted">
          <p>No measurements recorded yet. Start tracking to see progress!</p>
        </div>
      )}

      {/* Measurement Modal Placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Log New Measurement</h3>
            <p className="text-text-muted mb-4">Measurement form will be implemented here</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
