import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Plan, SubscriptionRequest } from '../../types/subscription.types';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import { subscriptionService } from '../../services/subscriptionService';
import { CheckCircle2, User, Mail, Phone, Calendar } from 'lucide-react';
import { isValidEmail, isValidPhone } from '../../utils/validationUtils';

interface SubscriptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
}

export const SubscriptionRequestModal: React.FC<SubscriptionRequestModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    requestedStartDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRequest, setSubmittedRequest] = useState<SubscriptionRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      errs.email = 'Valid email address is required';
    }
    if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
      errs.phone = 'Valid phone number is required';
    }
    if (!formData.requestedStartDate) {
      errs.requestedStartDate = 'Start date is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedPlan) return;

    setIsSubmitting(true);
    try {
      const created = subscriptionService.submitRequest({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        requestedStartDate: formData.requestedStartDate,
        notes: formData.notes,
      });
      setSubmittedRequest(created);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedRequest(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      requestedStartDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={submittedRequest ? 'Subscription Requested!' : `Subscribe to GEM — ${selectedPlan?.name || 'Plan'}`}
      subtitle={
        submittedRequest
          ? 'Your request has been received by our reception team.'
          : 'Complete the inquiry form to start your membership onboarding.'
      }
      maxWidth="md"
    >
      {submittedRequest ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-text-main font-heading">
              Welcome, {submittedRequest.fullName}!
            </h4>
            <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
              Your request for the <strong>{submittedRequest.planName}</strong> plan has been queued with ID:
              <span className="font-mono text-brand-primary block mt-1">{submittedRequest.id}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-border-subtle text-left text-xs space-y-2 text-text-muted">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-amber-400 font-semibold uppercase">Pending Staff Approval</span>
            </div>
            <div className="flex justify-between">
              <span>Target Start Date:</span>
              <span className="text-text-main font-medium">{submittedRequest.requestedStartDate}</span>
            </div>
          </div>

          <Button variant="primary" className="w-full mt-4" onClick={handleResetAndClose}>
            Back to Website
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border-subtle flex justify-between items-center text-xs">
            <span className="text-text-muted">Selected Tier:</span>
            <span className="font-bold text-brand-primary font-heading text-sm">
              {selectedPlan?.name} (${selectedPlan?.price}/mo)
            </span>
          </div>

          <FormInput
            label="Full Name"
            name="fullName"
            placeholder="Alex Morgan"
            value={formData.fullName}
            onChange={handleInputChange}
            error={errors.fullName}
            leftIcon={<User className="w-4 h-4" />}
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="alex@example.com"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <FormInput
            label="Phone Number"
            name="phone"
            placeholder="+1 (555) 000-1234"
            value={formData.phone}
            onChange={handleInputChange}
            error={errors.phone}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <FormInput
            label="Preferred Start Date"
            name="requestedStartDate"
            type="date"
            value={formData.requestedStartDate}
            onChange={handleInputChange}
            error={errors.requestedStartDate}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Fitness Goals / Notes (Optional)
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="e.g., Strength training, weight loss, interested in personal trainer..."
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full rounded-lg bg-surface-card border border-border-subtle focus:border-brand-primary focus:ring-brand-primary/40 text-text-main placeholder-text-subtle px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              Submit Membership Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
