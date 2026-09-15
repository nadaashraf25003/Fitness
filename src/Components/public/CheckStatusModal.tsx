import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SubscriptionRequest } from '../../types/subscription.types';
import { PATHS } from '../../Routing/routePaths';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { memberService } from '../../services/memberService';
import { subscriptionService } from '../../services/subscriptionService';

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMember?: (member: SubscriptionRequest) => void;
}

export const CheckStatusModal: React.FC<CheckStatusModalProps> = ({
  isOpen,
  onClose,
  onSelectMember,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundRequest, setFoundRequest] = useState<SubscriptionRequest | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const cleanQuery = query.toLowerCase().trim();
    const queryNumOnly = cleanQuery.replace(/[^0-9]/g, '');

    // 1. Search database members first
    const allMembers = memberService.getAll();
    const matchedMember = allMembers.find((m) => {
      const idExactMatch = m.id.toLowerCase() === cleanQuery;
      const idCleanMatch = m.id.toLowerCase().replace('mem-', '') === cleanQuery.replace('mem-', '');
      const emailMatch = m.email.toLowerCase() === cleanQuery;
      const phoneMatch = queryNumOnly.length >= 7 && m.phone.replace(/[^0-9]/g, '') === queryNumOnly;
      const nameMatch = m.fullName.toLowerCase() === cleanQuery;
      const codeMatch = m.memberCode === cleanQuery;
      return idExactMatch || idCleanMatch || emailMatch || phoneMatch || nameMatch || codeMatch;
    });

    if (matchedMember) {
      setFoundRequest({
        id: matchedMember.id, // e.g. "mem-498a5bf3"
        fullName: matchedMember.fullName,
        email: matchedMember.email,
        phone: matchedMember.phone,
        planId: matchedMember.subscriptionId || 'plan-pro',
        planName: matchedMember.planName || 'Pro 3-Month',
        requestedStartDate: matchedMember.joinDate || new Date().toISOString().split('T')[0],
        status: matchedMember.status === 'expired' ? 'rejected' : 'approved',
        notes: matchedMember.note,
        createdAt: matchedMember.joinDate,
        memberCode: matchedMember.memberCode,
        duration: 3,
        paidAmount: 79.99,
        paymentMethod: 'Visa',
      });
      setSearched(true);
      return;
    }

    // 2. Search subscription requests
    const allRequests = subscriptionService.getRequests();
    const match = allRequests.find((r: any) => {
      const emailMatch = r.email?.toLowerCase() === cleanQuery;
      const idExactMatch = r.id?.toLowerCase() === cleanQuery;
      const idCleanMatch = r.id?.replace('req-', '').toLowerCase() === cleanQuery.replace('req-', '');
      const phoneMatch = queryNumOnly.length >= 7 && r.phone?.replace(/[^0-9]/g, '') === queryNumOnly;
      const nameMatch = r.fullName?.toLowerCase() === cleanQuery;
      return emailMatch || idExactMatch || idCleanMatch || phoneMatch || nameMatch;
    });

    if (match) {
      // Check if this request has a corresponding DB member
      const correspondingDb = allMembers.find(
        (m) =>
          m.email.toLowerCase() === match.email.toLowerCase() ||
          (m.phone && match.phone && m.phone.replace(/[^0-9]/g, '') === match.phone.replace(/[^0-9]/g, ''))
      );

      setFoundRequest(
        correspondingDb
          ? {
              ...match,
              id: correspondingDb.id, // "mem-498a5bf3"
              status: 'approved',
            }
          : match
      );
    } else {
      setFoundRequest(null);
    }
    setSearched(true);
  };

  const handleOpenProfile = (req: SubscriptionRequest) => {
    try {
      localStorage.setItem('gym_verified_public_member', JSON.stringify(req));
    } catch (e) {
      console.warn('Error saving verified member:', e);
    }

    if (onSelectMember) {
      onSelectMember(req);
    }
    onClose();
    navigate(PATHS.PROFILE);
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
      subtitle="Enter your email address, phone, or Member ID to view your profile and keycard."
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <FormInput
            label="Email, Phone, or Member ID"
            placeholder="e.g. sara.ahmed@example.com or mem-498a5bf3"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (searched) setSearched(false);
            }}
            required
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Button type="submit" variant="primary" className="w-full font-bold">
            Track Application Status
          </Button>
        </form>

        {/* Results */}
        {searched && (
          <div className="pt-2">
            {foundRequest ? (
              <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-4 shadow-sm">
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
                    <span className="text-text-muted">
                      {foundRequest.status === 'approved' ? 'Member ID:' : 'Tracking ID:'}
                    </span>
                    <span className="font-mono text-brand-primary font-bold">
                      {foundRequest.id}
                    </span>
                  </div>
                </div>

                {/* Status Callout Box */}
                {foundRequest.status === 'approved' ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Congratulations! Membership Approved!</strong>
                      <p className="mt-0.5 opacity-90">
                        Your gym pass is active. Click below to open your full profile and digital keycard pass.
                      </p>
                    </div>
                  </div>
                ) : foundRequest.status === 'pending' ? (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-3">
                    <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <strong className="block font-semibold">Under Staff Review</strong>
                      <p className="mt-0.5 opacity-90">
                        Your inquiry is in the review queue. You can view your application profile below.
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

                {/* Open Member Profile Direct Page Action */}
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full font-bold shadow-md shadow-brand-primary/20"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => handleOpenProfile(foundRequest)}
                  >
                    Go to /profile & View Keycard →
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-surface-card border border-dashed border-border-subtle text-center text-xs text-text-muted space-y-1">
                <p className="font-semibold text-text-main">No application found for "{query}"</p>
                <p>Please double check the email address, phone, or Request ID you used when submitting.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
