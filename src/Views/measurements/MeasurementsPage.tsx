import React, { useState, useEffect } from 'react';
import { LineChart } from '../../Components/charts/LineChart';
import { Button } from '../../Components/ui/Button';
import {
  Plus,
  Activity,
  Scale,
  Percent,
  HeartPulse,
  User,
  Trash2,
  Calendar,
  Info,
} from 'lucide-react';
import { StatCard } from '../../Components/ui/StatCard';
import { useMeasurements } from '../../Hooks/useMeasurements';
import { useAuth } from '../../Hooks/useAuth';
import { Spinner } from '../../Components/ui/Spinner';
import { LogMeasurementModal } from './LogMeasurementModal';
import { memberService } from '../../services/memberService';
import { measurementService } from '../../services/measurementService';
import { Member } from '../../types/member.types';

export const MeasurementsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(user?.id || 'mem-101');
  const [members, setMembers] = useState<Member[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch available gym members for selector
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const list = await memberService.getAll();
        setMembers(list);
        if (list.length > 0 && !selectedMemberId) {
          setSelectedMemberId(list[0].id);
        }
      } catch (err) {
        console.warn('Failed to load members for selector:', err);
      }
    };
    loadMembers();
  }, []);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const { measurements, loading, error, refresh } = useMeasurements(selectedMemberId);

  // Sort chronologically for charts (Oldest -> Newest)
  const sortedChronological = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Sort reverse-chronological for history table (Newest -> Oldest)
  const sortedReverse = [...measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const chartData = sortedChronological.map((m, index) => ({
    label: m.date ? new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Session ${index + 1}`,
    value: m.weightKg,
  }));

  // Calculate stats from measurements
  const latestMeasurement = sortedReverse[0];
  const oldestMeasurement = sortedReverse[sortedReverse.length - 1];

  const weightDelta =
    latestMeasurement && oldestMeasurement && sortedReverse.length > 1
      ? parseFloat((latestMeasurement.weightKg - oldestMeasurement.weightKg).toFixed(1))
      : 0;

  const isWeightLoss = weightDelta <= 0;

  const bodyFatChange =
    latestMeasurement?.bodyFatPercentage !== undefined &&
    oldestMeasurement?.bodyFatPercentage !== undefined &&
    sortedReverse.length > 1
      ? parseFloat((latestMeasurement.bodyFatPercentage - oldestMeasurement.bodyFatPercentage).toFixed(1))
      : null;

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this measurement entry?')) {
      await measurementService.delete(id);
      refresh();
    }
  };

  const getBmiBadge = (category: string) => {
    switch (category) {
      case 'underweight':
        return { label: 'Underweight', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'normal':
        return { label: 'Healthy Normal', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'overweight':
        return { label: 'Overweight', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'obese':
        return { label: 'Obese', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' };
      default:
        return { label: 'Normal', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Member Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-main flex items-center gap-3">
            <Activity className="w-7 h-7 text-brand-primary" />
            Body Composition & Progress Metrics
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Track weight, body fat %, circumferences, automated BMI calculator, and progression over time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Member Switcher Dropdown */}
          {members.length > 0 && (
            <div className="flex items-center gap-2 bg-surface-card border border-border-subtle rounded-xl px-3 py-1.5 text-xs">
              <User className="w-4 h-4 text-brand-primary" />
              <span className="text-text-muted font-medium hidden sm:inline">Member:</span>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="bg-transparent text-text-main font-bold focus:outline-none cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-surface text-text-main">
                    {m.fullName} ({m.planName || 'Member'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowModal(true)}
            className="font-bold shadow-md shadow-brand-primary/20"
          >
            Log Measurement Session
          </Button>
        </div>
      </div>

      {/* Page Purpose & Guide Note Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-primary/10 via-surface-card to-surface-card border border-brand-primary/25 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/15 text-brand-primary flex items-center justify-center flex-shrink-0 border border-brand-primary/30 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-text-main font-heading">
                What is this page for?
              </span>
              <span className="px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary font-bold text-[10px]">
                InBody & Physical Assessment Log
              </span>
            </div>
            <p className="text-text-muted leading-relaxed">
              This module is the member's <strong>digital body transformation journal</strong>. Gym trainers and staff record weekly weigh-ins, body fat percentage, and muscle circumferences (arms, chest, waist). The system automatically calculates <strong>BMI & Category status</strong> and generates <strong>visual progression charts</strong> so members can track their weight loss or muscle gain over time.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-80">
          <Spinner />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          Failed to load measurements: {error}
        </div>
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Latest Weight"
              value={latestMeasurement ? `${latestMeasurement.weightKg} kg` : 'N/A'}
              subtitle={latestMeasurement ? `Recorded on ${latestMeasurement.date}` : 'No records yet'}
              icon={<Scale className="w-5 h-5" />}
            />

            <StatCard
              title="Total Weight Progress"
              value={
                sortedReverse.length > 1
                  ? `${Math.abs(weightDelta)} kg ${isWeightLoss ? 'Loss' : 'Gain'}`
                  : latestMeasurement
                  ? 'Baseline Established'
                  : 'No Data'
              }
              subtitle={
                sortedReverse.length > 1
                  ? `From ${oldestMeasurement.weightKg} kg baseline`
                  : 'Log more sessions to view delta'
              }
              icon={<Activity className="w-5 h-5" />}
              trend={
                sortedReverse.length > 1
                  ? {
                      value: `${weightDelta > 0 ? '+' : ''}${weightDelta} kg`,
                      isPositive: isWeightLoss,
                    }
                  : undefined
              }
            />

            <StatCard
              title="Body Fat (%)"
              value={latestMeasurement?.bodyFatPercentage ? `${latestMeasurement.bodyFatPercentage}%` : 'N/A'}
              subtitle={
                bodyFatChange !== null
                  ? `${bodyFatChange > 0 ? '+' : ''}${bodyFatChange}% overall change`
                  : 'InBody composition'
              }
              icon={<Percent className="w-5 h-5" />}
              trend={
                bodyFatChange !== null
                  ? {
                      value: `${bodyFatChange > 0 ? '+' : ''}${bodyFatChange}%`,
                      isPositive: bodyFatChange <= 0,
                    }
                  : undefined
              }
            />

            <StatCard
              title="Current BMI Status"
              value={latestMeasurement ? `${latestMeasurement.bmi} BMI` : 'N/A'}
              subtitle={
                latestMeasurement
                  ? getBmiBadge(latestMeasurement.bmiCategory).label
                  : 'Auto-calculated'
              }
              icon={<HeartPulse className="w-5 h-5" />}
              trend={
                latestMeasurement
                  ? {
                      value: latestMeasurement.bmiCategory.toUpperCase(),
                      isPositive: latestMeasurement.bmiCategory === 'normal',
                    }
                  : undefined
              }
            />
          </div>

          {/* Progress Chart */}
          {chartData.length > 0 ? (
            <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-main font-heading">
                    Weight Progression Over Time (kg)
                  </h3>
                  <p className="text-xs text-text-muted">
                    Historical weight checkpoints for {selectedMember?.fullName || 'Selected Member'}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-brand-primary px-2.5 py-1 rounded-full bg-brand-primary/10">
                  {chartData.length} Session{chartData.length > 1 ? 's' : ''} Logged
                </span>
              </div>
              <LineChart
                title=""
                data={chartData}
                primaryLabel="Weight (kg)"
                height={230}
              />
            </div>
          ) : (
            <div className="bg-surface-card rounded-2xl border border-border-subtle p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-primary/15 text-brand-primary mx-auto flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-text-main">No Measurements Recorded Yet</h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Start tracking weight, body fat %, and circumferences for this member to generate progress graphs and BMI trends.
              </p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowModal(true)}
              >
                Log First Session
              </Button>
            </div>
          )}

          {/* Detailed Measurement History Table */}
          {sortedReverse.length > 0 && (
            <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-base font-bold text-text-main font-heading">
                    Historical Assessment Logs
                  </h3>
                </div>
                <span className="text-xs text-text-muted">
                  Showing {sortedReverse.length} checkpoint{sortedReverse.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border-subtle">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-elevated text-text-muted uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Weight (kg)</th>
                      <th className="py-3 px-4">Height (cm)</th>
                      <th className="py-3 px-4">BMI & Category</th>
                      <th className="py-3 px-4">Body Fat %</th>
                      <th className="py-3 px-4">Circumferences</th>
                      <th className="py-3 px-4">Trainer Notes</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {sortedReverse.map((item) => {
                      const badge = getBmiBadge(item.bmiCategory);
                      return (
                        <tr key={item.id} className="hover:bg-surface-hover/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-text-main whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-brand-primary text-sm">
                            {item.weightKg} kg
                          </td>
                          <td className="py-3 px-4 text-text-muted">
                            {item.heightCm} cm
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-text-main">{item.bmi}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold uppercase ${badge.bg} ${badge.text} ${badge.border}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-text-main">
                            {item.bodyFatPercentage !== undefined ? `${item.bodyFatPercentage}%` : '—'}
                          </td>
                          <td className="py-3 px-4 text-text-muted">
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px]">
                              {item.waistCm && <span>Waist: <strong className="text-text-main">{item.waistCm}cm</strong></span>}
                              {item.chestCm && <span>Chest: <strong className="text-text-main">{item.chestCm}cm</strong></span>}
                              {item.armsCm && <span>Arms: <strong className="text-text-main">{item.armsCm}cm</strong></span>}
                              {item.thighsCm && <span>Thighs: <strong className="text-text-main">{item.thighsCm}cm</strong></span>}
                              {!item.waistCm && !item.chestCm && !item.armsCm && !item.thighsCm && <span>—</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-text-muted max-w-xs truncate" title={item.notes}>
                            {item.notes || '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                              title="Delete measurement entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Log Measurement Session Modal */}
      <LogMeasurementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        memberId={selectedMemberId}
        memberName={selectedMember?.fullName}
        onSuccess={() => refresh()}
      />
    </div>
  );
};
