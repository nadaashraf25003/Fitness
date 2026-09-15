import React, { useState, useEffect } from 'react';
import { Logo } from '../../Components/ui/Logo';
import { ThemeToggle } from '../../Components/ui/ThemeToggle';
import { Button } from '../../Components/ui/Button';
import { FormInput } from '../../Components/ui/FormInput';
import { Avatar } from '../../Components/ui/Avatar';
import { memberService } from '../../services/memberService';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionRequest } from '../../types/subscription.types';
import { Member } from '../../types/member.types';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import {
  User,
  QrCode,
  CheckCircle2,
  Printer,
  ArrowLeft,
  Search,
  Clock,
  XCircle,
} from 'lucide-react';

const VERIFIED_STORAGE_KEY = 'gym_verified_public_member';

export const ProfilePage: React.FC = () => {
  const [member, setMember] = useState<SubscriptionRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  // Helper to map DB member to profile representation
  const mapMemberToProfile = (dbMember: Member): SubscriptionRequest => ({
    id: dbMember.id, // e.g. "mem-498a5bf3"
    fullName: dbMember.fullName,
    email: dbMember.email,
    phone: dbMember.phone,
    planId: dbMember.subscriptionId || 'plan-pro',
    planName: dbMember.planName || 'Pro 3-Month',
    requestedStartDate: dbMember.joinDate || new Date().toISOString().split('T')[0],
    status: dbMember.status === 'expired' ? 'rejected' : 'approved',
    notes: dbMember.note,
    createdAt: dbMember.joinDate,
    requestType: 'new',
    duration: 3,
    paidAmount: 79.99,
    paymentMethod: 'Visa',
    branchId: dbMember.branchId || 1,
    memberCode: dbMember.memberCode,
  });

  // Load verified member from localStorage or active members in DB
  useEffect(() => {
    const loadCurrentMember = async () => {
      try {
        const stored = localStorage.getItem(VERIFIED_STORAGE_KEY);
        if (stored) {
          const parsed: SubscriptionRequest = JSON.parse(stored);
          // Check if there is an official database member record
          const allMembers = memberService.getAll();
          const matchedDbMember = allMembers.find(
            (m) =>
              m.id.toLowerCase() === parsed.id.toLowerCase() ||
              m.email.toLowerCase() === parsed.email.toLowerCase() ||
              (m.phone && parsed.phone && m.phone.replace(/[^0-9]/g, '') === parsed.phone.replace(/[^0-9]/g, ''))
          );

          if (matchedDbMember) {
            const mapped = mapMemberToProfile(matchedDbMember);
            setMember(mapped);
            localStorage.setItem(VERIFIED_STORAGE_KEY, JSON.stringify(mapped));
            return;
          }

          setMember(parsed);
          return;
        }

        // Fallback: look in memberService database first
        const allDbMembers = memberService.getAll();
        if (allDbMembers.length > 0) {
          const firstDb = allDbMembers[0];
          const mapped = mapMemberToProfile(firstDb);
          setMember(mapped);
          localStorage.setItem(VERIFIED_STORAGE_KEY, JSON.stringify(mapped));
          return;
        }

        // Fallback to subscription requests
        const allRequests = subscriptionService.getRequests();
        if (allRequests.length > 0) {
          const first = allRequests[0];
          setMember(first);
          localStorage.setItem(VERIFIED_STORAGE_KEY, JSON.stringify(first));
        }
      } catch (err) {
        console.warn('Error loading member profile:', err);
      }
    };

    loadCurrentMember();
  }, []);

  const handleSearchMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const clean = searchQuery.toLowerCase().trim();
    const numOnly = clean.replace(/[^0-9]/g, '');

    // 1. Search official DB members first
    const allDbMembers = memberService.getAll();
    const matchedDb = allDbMembers.find((m) => {
      const idMatch = m.id.toLowerCase() === clean || m.id.toLowerCase().replace('mem-', '') === clean.replace('mem-', '');
      const emailMatch = m.email.toLowerCase() === clean;
      const phoneMatch = numOnly.length >= 7 && m.phone.replace(/[^0-9]/g, '') === numOnly;
      const nameMatch = m.fullName.toLowerCase() === clean;
      const codeMatch = m.memberCode === clean;
      return idMatch || emailMatch || phoneMatch || nameMatch || codeMatch;
    });

    if (matchedDb) {
      const mapped = mapMemberToProfile(matchedDb);
      setMember(mapped);
      localStorage.setItem(VERIFIED_STORAGE_KEY, JSON.stringify(mapped));
      setSearchError('');
      setSearchQuery('');
      return;
    }

    // 2. Search subscription requests
    const allRequests = subscriptionService.getRequests();
    const foundReq = allRequests.find((r: any) => {
      const emailMatch = r.email?.toLowerCase() === clean;
      const idMatch = r.id?.toLowerCase() === clean || r.id?.replace('req-', '').toLowerCase() === clean.replace('req-', '');
      const phoneMatch = numOnly.length >= 7 && r.phone?.replace(/[^0-9]/g, '') === numOnly;
      const nameMatch = r.fullName?.toLowerCase() === clean;
      return emailMatch || idMatch || phoneMatch || nameMatch;
    });

    if (foundReq) {
      // If approved, check if member exists in DB to get real mem- ID
      const matchingDb = allDbMembers.find(
        (m) =>
          m.email.toLowerCase() === foundReq.email.toLowerCase() ||
          (m.phone && foundReq.phone && m.phone.replace(/[^0-9]/g, '') === foundReq.phone.replace(/[^0-9]/g, ''))
      );

      const finalMember = matchingDb ? mapMemberToProfile(matchingDb) : foundReq;
      setMember(finalMember);
      localStorage.setItem(VERIFIED_STORAGE_KEY, JSON.stringify(finalMember));
      setSearchError('');
      setSearchQuery('');
    } else {
      setSearchError(`No member or application found for "${searchQuery}". Please check your email, phone, or Member ID.`);
    }
  };

  const handleSwitchMember = () => {
    localStorage.removeItem(VERIFIED_STORAGE_KEY);
    setMember(null);
  };

  const isApproved = member?.status === 'approved';
  const displayId = member ? member.id : '';
  const keycardCode = member ? `KEY-${member.id.replace('mem-', '').replace('req-', '').toUpperCase()}` : '';

  return (
    <div className="min-h-screen bg-bg text-text-main flex flex-col selection:bg-brand-primary/30 selection:text-brand-primary">
      {/* Simple Clean Public Top Header */}
      <header className="border-b border-border-subtle bg-surface/85 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-primary font-semibold transition-colors py-1.5 px-3 rounded-xl hover:bg-surface-elevated border border-border-subtle"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {member && (
              <button
                onClick={handleSwitchMember}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-border-subtle hover:border-brand-primary text-xs font-semibold text-text-muted hover:text-brand-primary transition-colors cursor-pointer shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Check Other Member</span>
              </button>
            )}
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* If no member is active, show simple email search */}
        {!member ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-border-subtle shadow-xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary/15 text-brand-primary mx-auto flex items-center justify-center border border-brand-primary/30">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-text-main">
                Member Profile & Keycard Lookup
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-md mx-auto">
                Enter your registered email address, phone number, or Request ID to open your member profile.
              </p>
            </div>

            <form onSubmit={handleSearchMember} className="max-w-md mx-auto space-y-3 pt-2">
              <FormInput
                label="Email, Phone, or Request ID"
                placeholder="e.g. sara.ahmed@example.com or req-50"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searchError) setSearchError('');
                }}
                leftIcon={<Search className="w-4 h-4" />}
                required
                autoFocus
              />

              {searchError && (
                <p className="text-xs text-rose-400 font-medium text-left">{searchError}</p>
              )}

              <Button type="submit" variant="primary" className="w-full font-bold shadow-md shadow-brand-primary/20">
                Open My Profile & Keycard
              </Button>
            </form>
          </div>
        ) : (
          /* Simple Member Profile & Keycard Card */
          <div className="space-y-5">
            {/* Hero Member Badge */}
            <div className="p-5 sm:p-6 rounded-3xl bg-surface-card border border-border-subtle shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <Avatar name={member.fullName} size="xl" className="border-2 border-brand-primary/50 shadow" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-text-main font-heading">
                      {member.fullName}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 border ${
                      isApproved
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : member.status === 'pending'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}>
                      {isApproved && <CheckCircle2 className="w-3 h-3" />}
                      {member.status === 'approved' ? 'APPROVED MEMBER' : member.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted flex items-center gap-2">
                    <span className="font-mono text-brand-primary font-bold">ID: {displayId}</span>
                    <span>•</span>
                    <span className="font-semibold text-text-main">{member.planName}</span>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                <span className="text-[10px] uppercase tracking-wider text-text-muted block font-semibold">
                  Facility Status
                </span>
                <span className="text-sm font-extrabold text-emerald-400 font-heading">
                  {isApproved ? 'All Access 24/7' : 'Pending Activation'}
                </span>
              </div>
            </div>

            {/* Turnstile Keycard Pass */}
            {isApproved ? (
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-surface-card via-slate-950 to-zinc-900 border border-brand-primary/40 text-text-main shadow-xl text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-brand-primary font-bold uppercase block">
                    GEM FITNESS CLUB
                  </span>
                  <h3 className="text-lg font-black text-white font-heading">
                    Digital Turnstile Keycard Pass
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Scan this QR code at front turnstiles for instant entrance.
                  </p>
                </div>

                {/* Scannable QR Pass */}
                <div className="p-4 bg-white rounded-2xl w-44 h-44 mx-auto flex items-center justify-center shadow-2xl">
                  <QrCode className="w-36 h-36 text-black" />
                </div>

                <div className="space-y-2">
                  <div className="font-mono text-xs font-bold text-brand-primary">
                    {keycardCode}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Authorized for {member.fullName}
                  </p>

                  <div className="pt-2 max-w-xs mx-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                      onClick={() => window.print()}
                    >
                      Print Keycard Pass
                    </Button>
                  </div>
                </div>
              </div>
            ) : member.status === 'pending' ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <strong className="block font-semibold">Application Under Review</strong>
                  <p className="mt-0.5 opacity-90">
                    Your request is in the review queue. Once approved by reception, your digital keycard turnstile pass will activate automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-3">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Application Inactive</strong>
                  <p className="mt-0.5 opacity-90">
                    Please contact reception for assistance.
                  </p>
                </div>
              </div>
            )}

            {/* Simple Membership Information Details */}
            <div className="p-6 rounded-3xl bg-surface-card border border-border-subtle shadow-sm space-y-4 text-xs">
              <div className="font-bold text-text-main text-xs uppercase tracking-wider pb-3 border-b border-border-subtle flex items-center justify-between">
                <span>Membership Specifications</span>
                <span className="text-brand-primary font-normal">{member.duration || 1} Month Package</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">Plan Name</span>
                  <span className="font-bold text-text-main text-sm mt-0.5 block">{member.planName}</span>
                </div>

                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">Amount Paid</span>
                  <span className="font-extrabold text-emerald-400 text-sm mt-0.5 block">
                    ${member.paidAmount || (member.duration === 12 ? 249.99 : member.duration === 3 ? 79.99 : 29.99)} USD
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">Payment Method</span>
                  <span className="font-semibold text-text-main text-xs mt-0.5 block truncate">
                    {member.paymentMethod || 'Visa'}
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">Start Date</span>
                  <span className="font-medium text-text-main text-xs mt-0.5 block">
                    {formatDate(member.requestedStartDate)}
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">Email</span>
                  <span className="font-medium text-text-main text-xs mt-0.5 block truncate">{member.email}</span>
                </div>

                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">Phone</span>
                  <span className="font-medium text-text-main text-xs mt-0.5 block">{member.phone}</span>
                </div>
              </div>

              {member.notes && (
                <div className="pt-3 border-t border-border-subtle text-xs text-text-muted">
                  <span className="font-semibold text-text-main">Goals & Notes: </span>
                  <span>{member.notes}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
