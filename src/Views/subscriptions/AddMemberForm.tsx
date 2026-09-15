import React, { useState, useEffect } from 'react';
import { FormInput } from '../../Components/ui/FormInput';
import { Select } from '../../Components/ui/Select';
import { Button } from '../../Components/ui/Button';
import { memberService } from '../../services/memberService';
import { subscriptionService } from '../../services/subscriptionService';
import { Plan } from '../../types/subscription.types';
import { isValidEmail, isValidPhone } from '../../utils/validationUtils';
import { AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

interface AddMemberFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialBranchId?: number;
}

export const AddMemberForm: React.FC<AddMemberFormProps> = ({ onSuccess, onCancel, initialBranchId = 1 }) => {
  const [plans, setPlans] = useState<Plan[]>(() => subscriptionService.getPlans());
  const [loadingPlans, setLoadingPlans] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false);
  const [emailCheckResult, setEmailCheckResult] = useState<{
    checked: boolean;
    exists: boolean;
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dateOfBirth: '1995-01-01',
    joinDate: new Date().toISOString().split('T')[0],
    subscriptionId: 'sub-pro',
    planName: 'Pro 3-Month',
    status: 'active' as const,
    branchId: initialBranchId,
    photoUrl: '',
    note: '',
  });

  useEffect(() => {
    async function loadPlans() {
      setLoadingPlans(true);
      try {
        const fetched = await subscriptionService.fetchPlans();
        if (fetched && fetched.length > 0) {
          setPlans(fetched);
          if (!formData.planName && fetched[0]) {
            setFormData((prev) => ({
              ...prev,
              planName: fetched[0].name,
              subscriptionId: `sub-${fetched[0].id}`,
            }));
          }
        }
      } catch (err) {
        console.warn('Could not fetch plans dynamically:', err);
      } finally {
        setLoadingPlans(false);
      }
    }
    loadPlans();
  }, []);

  // Debounced email existence check
  useEffect(() => {
    const rawEmail = formData.email.trim();
    if (!rawEmail || !isValidEmail(rawEmail)) {
      setEmailCheckResult(null);
      setIsCheckingEmail(false);
      return;
    }

    let isMounted = true;
    setIsCheckingEmail(true);

    const timer = setTimeout(async () => {
      try {
        const res = await subscriptionService.checkEmail(rawEmail);
        if (!isMounted) return;

        setEmailCheckResult({
          checked: true,
          exists: res.exists,
          message: res.message,
        });

        if (res.exists) {
          setFormError(res.message || 'A member with this email already exists.');
        } else {
          setFormError((prev) => (prev?.includes('already exists') ? null : prev));
        }
      } catch (err) {
        console.warn('Error checking email in AddMemberForm:', err);
      } finally {
        if (isMounted) setIsCheckingEmail(false);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [formData.email]);

  const handlePlanChange = (planName: string) => {
    const selected = plans.find((p) => p.name === planName);
    setFormData((prev) => ({
      ...prev,
      planName,
      subscriptionId: selected ? `sub-${selected.id}` : prev.subscriptionId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName.trim()) {
      setFormError('Member name is required');
      return;
    }
    if (!isValidEmail(formData.email.trim())) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!formData.phone.trim() || !isValidPhone(formData.phone.trim())) {
      setFormError('Please enter a valid phone number (e.g. 01000000001)');
      return;
    }

    // Check email existence before create
    setIsSubmitting(true);
    try {
      const emailRes = await subscriptionService.checkEmail(formData.email.trim());
      if (emailRes.exists) {
        setFormError(emailRes.message || 'A member with this email already exists.');
        setIsSubmitting(false);
        return;
      }

      await memberService.create({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        joinDate: formData.joinDate,
        subscriptionId: formData.subscriptionId,
        planName: formData.planName,
        status: formData.status,
        branchId: Number(formData.branchId) || 1,
        photoUrl: formData.photoUrl.trim() || undefined,
        note: formData.note.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const planOptions = plans.map((p) => ({
    value: p.name,
    label: `${p.name} ($${p.price}/${p.durationMonths === 1 ? 'mo' : `${p.durationMonths} mos`})`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Full Name"
          placeholder="e.g. Michael Thorne"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />

        <Select
          label="Registered Gym Branch"
          value={String(formData.branchId)}
          onChange={(e) => setFormData({ ...formData, branchId: Number(e.target.value) })}
          options={[
            { value: '1', label: 'Branch 1 - Main Branch (Khanqah)' },
            { value: '2', label: 'Branch 2 - Downtown Branch (City Center)' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Email Address"
          type="email"
          placeholder="michael.t@example.com"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            setEmailCheckResult(null);
          }}
          required
          rightIcon={
            isCheckingEmail ? (
              <RotateCw className="w-4 h-4 text-brand-primary animate-spin" />
            ) : emailCheckResult?.checked && !emailCheckResult.exists ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : emailCheckResult?.checked && emailCheckResult.exists ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : null
          }
          helperText={
            emailCheckResult?.checked && !emailCheckResult.exists
              ? '✓ Email address is available'
              : undefined
          }
        />

        <FormInput
          label="Phone Number"
          type="tel"
          placeholder="01012345678"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Membership Package"
          value={formData.planName}
          onChange={(e) => handlePlanChange(e.target.value)}
          options={
            planOptions.length > 0
              ? planOptions
              : [
                  { value: 'Basic Monthly', label: 'Basic Monthly ($29.99/mo)' },
                  { value: 'Pro 3-Month', label: 'Pro 3-Month ($79.99/3 mos)' },
                  { value: 'VIP Annual', label: 'VIP Annual ($249.99/yr)' },
                ]
          }
          disabled={loadingPlans}
        />

        <Select
          label="Gender"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other / Non-Binary' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          required
        />

        <FormInput
          label="Membership Start Date"
          type="date"
          value={formData.joinDate}
          onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
          required
        />
      </div>

      <FormInput
        label="Avatar / Photo URL (Optional)"
        type="url"
        placeholder="https://images.unsplash.com/..."
        value={formData.photoUrl}
        onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
      />

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Staff Notes / Preferences (Optional)
        </label>
        <textarea
          rows={2}
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="Special medical conditions, fitness goals, or locker preferences..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-text-main text-xs focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register Member'}
        </Button>
      </div>
    </form>
  );
};

export default AddMemberForm;
