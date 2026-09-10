import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionRequest } from '../../types/subscription.types';
import { Search, CheckCircle2, Clock, XCircle, Mail, Hash, User } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckStatusModal: React.FC<CheckStatusModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundRequest, setFoundRequest] = useState<SubscriptionRequest | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const allRequests = subscriptionService.getRequests();
    const cleanQuery = query.toLowerCase().trim();

    const match = allRequests.find(
      (r) =>
        r.email.toLowerCase() === cleanQuery ||
        r.id.toLowerCase() === cleanQuery ||
        r.phone.replace(/[^0-9]/g, '') === cleanQuery.replace(/[^0-9]/g, '')
    );

    setFoundRequest(match || null);
    setSearched(true);
  };

  const handleReset = () => {
    setQuery('');
    setSearched(false);
    setFoundRequest(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Check Membership Request Status"
      subtitle="Enter your email address or Request ID to check if your application is approved."
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <FormInput
            label="Email or Request ID"
            placeholder="e.g. alex@example.com or req-1001"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (searched) setSearched(false);
            }}
            required
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Button type="submit" variant="primary" className="w-full">
            Track Application Status
          </Button>
        </form>

        {/* Results */}
        {searched && (
          <div className="pt-2">
            {foundRequest ? (
              <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-primary" />
                    <span className="font-semibold text-text-main text-sm">
                      {foundRequest.fullName}
                    </span>
                  </div>
                  <Badge variant={foundRequest.status}>{foundRequest.status}</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Requested Plan:</span>
                    <span className="font-bold text-brand-primary">{foundRequest.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Target Start Date:</span>
                    <span className="text-text-main">{formatDate(foundRequest.requestedStartDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Tracking ID:</span>
                    <span className="font-mono text-text-subtle">{foundRequest.id}</span>
                  </div>
                </div>

                {/* Status Callout Box */}
                {foundRequest.status === 'approved' ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Congratulations! You are Accepted!</strong>
                      <p className="mt-0.5 opacity-90">
                        Your membership has been approved by the front desk. Visit the facility on {formatDate(foundRequest.requestedStartDate)} with your photo ID to collect your keycard.
                      </p>
                    </div>
                  </div>
                ) : foundRequest.status === 'pending' ? (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-3">
                    <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <strong className="block font-semibold">Under Staff Review</strong>
                      <p className="mt-0.5 opacity-90">
                        Your inquiry is currently in the review queue. Our reception team typically processes requests within 2 hours.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-3">
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Application Declined</strong>
                      <p className="mt-0.5 opacity-90">
                        Please contact reception at +1 (555) 800-4363 for additional information.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-surface-card border border-dashed border-border-subtle text-center text-xs text-text-muted space-y-1">
                <p className="font-semibold text-text-main">No application found for "{query}"</p>
                <p>Please double check the email address or Request ID you used when submitting.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
