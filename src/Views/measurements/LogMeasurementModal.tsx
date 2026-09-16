import React, { useState, useMemo } from 'react';
import { Modal } from '../../Components/ui/Modal';
import { FormInput } from '../../Components/ui/FormInput';
import { Button } from '../../Components/ui/Button';
import { measurementService, calculateBmi } from '../../services/measurementService';
import {
  Scale,
  Ruler,
  Percent,
  Calendar,
  HeartPulse,
  FileText,
  Activity,
  Sparkles,
  Check,
  Info,
} from 'lucide-react';

interface LogMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName?: string;
  onSuccess: () => void;
}

export const LogMeasurementModal: React.FC<LogMeasurementModalProps> = ({
  isOpen,
  onClose,
  memberId,
  memberName,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: '',
    heightCm: '175',
    bodyFatPercentage: '',
    chestCm: '',
    waistCm: '',
    hipsCm: '',
    armsCm: '',
    thighsCm: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live BMI calculation
  const liveBmi = useMemo(() => {
    const weight = parseFloat(formData.weightKg);
    const height = parseFloat(formData.heightCm);
    if (!weight || !height || weight <= 0 || height <= 0) return null;
    return calculateBmi(weight, height);
  }, [formData.weightKg, formData.heightCm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const weight = parseFloat(formData.weightKg);
    const height = parseFloat(formData.heightCm);

    if (!formData.date) errs.date = 'Date is required';
    if (!formData.weightKg || isNaN(weight) || weight <= 20 || weight > 350) {
      errs.weightKg = 'Enter valid weight in kg (20 - 350 kg)';
    }
    if (!formData.heightCm || isNaN(height) || height <= 80 || height > 260) {
      errs.heightCm = 'Enter valid height in cm (80 - 260 cm)';
    }
    if (formData.bodyFatPercentage) {
      const fat = parseFloat(formData.bodyFatPercentage);
      if (isNaN(fat) || fat < 2 || fat > 70) {
        errs.bodyFatPercentage = 'Body fat % must be between 2% and 70%';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const weight = parseFloat(formData.weightKg);
      const height = parseFloat(formData.heightCm);
      const bmiResult = calculateBmi(weight, height);

      await measurementService.create({
        memberId: memberId || 'mem-101',
        date: formData.date,
        weightKg: weight,
        heightCm: height,
        bodyFatPercentage: formData.bodyFatPercentage ? parseFloat(formData.bodyFatPercentage) : undefined,
        chestCm: formData.chestCm ? parseFloat(formData.chestCm) : undefined,
        waistCm: formData.waistCm ? parseFloat(formData.waistCm) : undefined,
        hipsCm: formData.hipsCm ? parseFloat(formData.hipsCm) : undefined,
        armsCm: formData.armsCm ? parseFloat(formData.armsCm) : undefined,
        thighsCm: formData.thighsCm ? parseFloat(formData.thighsCm) : undefined,
        bmi: bmiResult.bmi,
        bmiCategory: bmiResult.category,
        notes: formData.notes.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to record measurement session' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBmiBadge = (category: string) => {
    switch (category) {
      case 'underweight':
        return { label: 'Underweight', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'normal':
        return { label: 'Healthy Weight', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'overweight':
        return { label: 'Overweight', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'obese':
        return { label: 'Obesity Range', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' };
      default:
        return { label: 'Normal', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Body Composition & Metrics"
      subtitle={memberName ? `Recording physical fitness session for ${memberName}` : 'Record weight, body fat %, and circumferences'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Note Box */}
        <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle flex items-start gap-2.5 text-xs text-text-muted">
          <Info className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
          <span>
            <strong>Assessment Note:</strong> Enter weight & height to automatically compute <strong>BMI and health category</strong>. InBody body fat % and muscle circumferences are optional for tracking body recomposition.
          </span>
        </div>
        {/* Date & Core Biometrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormInput
            label="Assessment Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <FormInput
            label="Weight (kg)"
            name="weightKg"
            type="number"
            step="0.1"
            placeholder="78.5"
            value={formData.weightKg}
            onChange={handleChange}
            error={errors.weightKg}
            leftIcon={<Scale className="w-4 h-4" />}
            autoFocus
          />

          <FormInput
            label="Height (cm)"
            name="heightCm"
            type="number"
            step="0.5"
            placeholder="178"
            value={formData.heightCm}
            onChange={handleChange}
            error={errors.heightCm}
            leftIcon={<Ruler className="w-4 h-4" />}
          />
        </div>

        {/* Live BMI Calculator Card */}
        {liveBmi && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-surface-elevated via-surface-card to-surface-card border border-border-subtle flex items-center justify-between text-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/15 text-brand-primary flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <span className="text-text-muted text-[10px] block uppercase font-semibold">Calculated BMI</span>
                <span className="text-base font-black text-text-main font-mono">
                  {liveBmi.bmi}{' '}
                  <span className="text-[10px] text-text-muted font-normal">kg/m²</span>
                </span>
              </div>
            </div>

            <div>
              {(() => {
                const badge = getBmiBadge(liveBmi.category);
                return (
                  <span className={`px-2.5 py-1 rounded-full border text-[11px] font-extrabold uppercase ${badge.bg} ${badge.text} ${badge.border}`}>
                    {badge.label}
                  </span>
                );
              })()}
            </div>
          </div>
        )}

        {/* InBody & Body Fat Section */}
        <div className="p-4 rounded-xl bg-surface-card border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-main">
                InBody & Circumference Measurements
              </span>
            </div>
            <span className="text-[10px] text-text-muted">Optional</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FormInput
              label="Body Fat (%)"
              name="bodyFatPercentage"
              type="number"
              step="0.1"
              placeholder="18.5"
              value={formData.bodyFatPercentage}
              onChange={handleChange}
              error={errors.bodyFatPercentage}
              leftIcon={<Percent className="w-4 h-4" />}
            />

            <FormInput
              label="Chest (cm)"
              name="chestCm"
              type="number"
              step="0.5"
              placeholder="102"
              value={formData.chestCm}
              onChange={handleChange}
            />

            <FormInput
              label="Waist (cm)"
              name="waistCm"
              type="number"
              step="0.5"
              placeholder="82"
              value={formData.waistCm}
              onChange={handleChange}
            />

            <FormInput
              label="Hips (cm)"
              name="hipsCm"
              type="number"
              step="0.5"
              placeholder="96"
              value={formData.hipsCm}
              onChange={handleChange}
            />

            <FormInput
              label="Arms / Biceps (cm)"
              name="armsCm"
              type="number"
              step="0.5"
              placeholder="36"
              value={formData.armsCm}
              onChange={handleChange}
            />

            <FormInput
              label="Thighs (cm)"
              name="thighsCm"
              type="number"
              step="0.5"
              placeholder="56.5"
              value={formData.thighsCm}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Trainer Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-text-muted" />
            Trainer Observations & Next Goals
          </label>
          <textarea
            name="notes"
            rows={2}
            placeholder="e.g. Lost 1.5kg body fat, maintained strength levels. Recommended focus on high-protein diet..."
            value={formData.notes}
            onChange={handleChange}
            className="w-full rounded-lg bg-surface-card border border-border-subtle focus:border-brand-primary focus:ring-brand-primary/40 text-text-main placeholder-text-subtle px-4 py-2 text-xs sm:text-sm transition-all focus:outline-none focus:ring-2"
          />
        </div>

        {errors.submit && (
          <p className="text-xs text-rose-400 font-medium">{errors.submit}</p>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 font-bold shadow-md shadow-brand-primary/20"
            isLoading={isSubmitting}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Measurement
          </Button>
        </div>
      </form>
    </Modal>
  );
};
