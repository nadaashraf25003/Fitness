import React from 'react';
import { Modal } from '../../Components/ui/Modal';
import { FormInput } from '../../Components/ui/FormInput';
import { Button } from '../../Components/ui/Button';
import { useForm } from '../../Hooks/useForm';
import { BodyMeasurement } from '../../types/measurement.types';

type FormValues = {
  date: string;
  weightKg: number | '';
  heightCm: number | '';
  bodyFatPercentage: number | '';
  notes: string;
};

const initialValues: FormValues = {
  date: new Date().toISOString().slice(0, 10),
  weightKg: '',
  heightCm: '',
  bodyFatPercentage: '',
  notes: '',
};

interface Props {
  isOpen: boolean;
  memberId: string;
  onClose: () => void;
  onSubmit: (measurement: Omit<BodyMeasurement, 'id' | 'bmi' | 'bmiCategory'>) => Promise<BodyMeasurement | void>;
}

export const RecordMeasurementModal: React.FC<Props> = ({ isOpen, memberId, onClose, onSubmit }) => {
  const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm } = useForm<FormValues>({
    initialValues,
    validate: (value) => {
      const errors: Partial<Record<keyof FormValues, string>> = {};
      if (!value.date) errors.date = 'Date is required';
      if (!value.weightKg || value.weightKg <= 0) errors.weightKg = 'Enter a valid weight';
      if (!value.heightCm || value.heightCm <= 0) errors.heightCm = 'Enter a valid height';
      return errors;
    },
    onSubmit: async (value) => {
      await onSubmit({
        memberId,
        date: value.date,
        weightKg: Number(value.weightKg),
        heightCm: Number(value.heightCm),
        bodyFatPercentage: value.bodyFatPercentage === '' ? undefined : Number(value.bodyFatPercentage),
        notes: value.notes.trim() || undefined,
      });
      resetForm();
      onClose();
    },
  });

  const close = () => { resetForm(); onClose(); };

  return <Modal isOpen={isOpen} onClose={close} title="Log New Measurement" subtitle="BMI and its category are calculated automatically." maxWidth="md">
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Date" name="date" type="date" value={values.date} onChange={handleChange} error={errors.date} />
        <FormInput label="Weight (kg)" name="weightKg" type="number" min="1" step="0.1" value={values.weightKg} onChange={handleChange} error={errors.weightKg} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Height (cm)" name="heightCm" type="number" min="1" step="0.1" value={values.heightCm} onChange={handleChange} error={errors.heightCm} />
        <FormInput label="Body fat (%)" name="bodyFatPercentage" type="number" min="0" max="100" step="0.1" value={values.bodyFatPercentage} onChange={handleChange} />
      </div>
      <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">Notes</label><textarea name="notes" rows={3} value={values.notes} onChange={handleChange} className="w-full rounded-lg border border-border-subtle bg-surface-card px-4 py-2.5 text-sm text-text-main" /></div>
      <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>Cancel</Button><Button type="submit" isLoading={isSubmitting}>Save measurement</Button></div>
    </form>
  </Modal>;
};
