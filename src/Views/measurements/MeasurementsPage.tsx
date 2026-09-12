import React from 'react';
import { LineChart } from '../../Components/charts/LineChart';
import { Button } from '../../Components/ui/Button';
import { Plus, Activity, Scale, Percent, HeartPulse } from 'lucide-react';
import { StatCard } from '../../Components/ui/StatCard';

export const MeasurementsPage: React.FC = () => {
  const sampleProgress = [
    { label: 'Week 1', value: 88 },
    { label: 'Week 3', value: 86.5 },
    { label: 'Week 5', value: 85 },
    { label: 'Week 7', value: 83.2 },
    { label: 'Week 9', value: 82 },
    { label: 'Week 12', value: 80.5 },
  ];

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

        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Log Measurement Session
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Average Member Weight Loss"
          value="-4.2 kg"
          subtitle="90-day average trend"
          icon={<Scale className="w-5 h-5" />}
          trend={{ value: 'Target Met', isPositive: true }}
        />
        <StatCard
          title="Average Body Fat Reduction"
          value="-3.8%"
          subtitle="Active training cohorts"
          icon={<Percent className="w-5 h-5" />}
          trend={{ value: 'Improving', isPositive: true }}
        />
        <StatCard
          title="Healthy BMI Percentage"
          value="82%"
          subtitle="WHO Standard Classification"
          icon={<HeartPulse className="w-5 h-5" />}
        />
      </div>

      {/* Progress Chart */}
      <LineChart
        title="Member Weight Progression Sample (kg over 12 Weeks)"
        data={sampleProgress}
        primaryLabel="Weight (kg)"
        height={220}
      />
    </div>
  );
};
