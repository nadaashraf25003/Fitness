import React from 'react';
import { Modal } from '../../Components/ui/Modal';
import { FormInput } from '../../Components/ui/FormInput';
import { Select } from '../../Components/ui/Select';
import { Button } from '../../Components/ui/Button';
import { useForm } from '../../Hooks/useForm';
import { PaymentRecord } from '../../types/subscription.types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payment: Omit<PaymentRecord, 'id'>) => Promise<PaymentRecord | void>;
}

interface PaymentFormValues {
  memberId: string;
  memberName: string;
  subscriptionId: string;
  amount: number | '';
  date: string;
  method: PaymentRecord['method'];
  status: PaymentRecord['status'];
}

const todayStr = () => new Date().toISOString().split('T')[0];

const initialValues: PaymentFormValues = {
  memberId: '',
  memberName: '',
  subscriptionId: '',
  amount: '',
  date: todayStr(),
  method: 'cash',
  status: 'paid',
};

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm } =
    useForm<PaymentFormValues>({
      initialValues,
      validate: (v) => {
        const errs: Partial<Record<keyof PaymentFormValues, string>> = {};
        if (!v.memberId.trim()) errs.memberId = 'Member ID is required';
        if (!v.memberName.trim()) errs.memberName = 'Member name is required';
        if (!v.subscriptionId.trim()) errs.subscriptionId = 'Subscription ID is required';
        if (!v.amount || Number(v.amount) <= 0) errs.amount = 'Enter a valid amount';
        if (!v.date) errs.date = 'Date is required';
        return errs;
      },
      onSubmit: async (v) => {
        await onSubmit({
          memberId: v.memberId.trim(),
          memberName: v.memberName.trim(),
          subscriptionId: v.subscriptionId.trim(),
          amount: Number(v.amount),
          date: v.date,
          method: v.method,
          status: v.status,
        });
        resetForm();
        onClose();
      },
    });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Transaction"
      subtitle="Log a new payment for a member"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Member ID"
          name="memberId"
          value={values.memberId}
          onChange={handleChange}
          error={errors.memberId}
          placeholder="mem-101"
        />
        <FormInput
          label="Member Name"
          name="memberName"
          value={values.memberName}
          onChange={handleChange}
          error={errors.memberName}
          placeholder="Jane Doe"
        />
        <FormInput
          label="Subscription ID"
          name="subscriptionId"
          value={values.subscriptionId}
          onChange={handleChange}
          error={errors.subscriptionId}
          placeholder="sub-201"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={handleChange}
            error={errors.amount}
          />
          <FormInput
            label="Date"
            name="date"
            type="date"
            value={values.date}
            onChange={handleChange}
            error={errors.date}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Method"
            name="method"
            value={values.method}
            onChange={handleChange}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'visa', label: 'Visa' },
            ]}
          />
          <Select
            label="Status"
            name="status"
            value={values.status}
            onChange={handleChange}
            options={[
              { value: 'paid', label: 'Paid' },
              { value: 'partial', label: 'Partial' },
              { value: 'unpaid', label: 'Unpaid' },
            ]}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
