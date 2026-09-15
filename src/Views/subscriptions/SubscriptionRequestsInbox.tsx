import React, { useState } from 'react';
import { useSubscriptionRequests } from '../../Hooks/useSubscriptionRequests';
import { Table, Column } from '../../Components/ui/Table';
import { Badge } from '../../Components/ui/Badge';
import { Button } from '../../Components/ui/Button';
import { Modal } from '../../Components/ui/Modal';
import { StatCard } from '../../Components/ui/StatCard';
import {
  Check,
  X,
  Inbox,
  RefreshCw,
  Clock,
  CheckCircle,
  FileText,
  CreditCard,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { SubscriptionRequest } from '../../types/subscription.types';
import { formatDate } from '../../utils/dateUtils';

export const SubscriptionRequestsInbox: React.FC = () => {
  const {
    requests,
    loading,
    actionLoading,
    error,
    successMessage,
    refreshRequests,
    approveRequest,
    rejectRequest,
    clearMessages,
  } = useSubscriptionRequests();

  const [inspectingRequest, setInspectingRequest] = useState<SubscriptionRequest | null>(null);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const columns: Column<SubscriptionRequest>[] = [
    {
      key: 'fullName',
      header: 'Applicant',
      render: (r) => (
        <div>
          <div className="font-semibold text-text-main flex items-center gap-2">
            {r.fullName}
            {r.requestType && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-subtle">
                {r.requestType}
              </span>
            )}
          </div>
          <div className="text-xs text-text-muted mt-0.5">
            {r.email} • {r.phone}
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Requested Plan',
      render: (r) => (
        <div>
          <span className="font-bold text-brand-primary">{r.planName || 'Standard Tier'}</span>
          <div className="text-xs text-text-muted mt-0.5">
            {r.duration ? `${r.duration} Mo • ` : ''}${r.paidAmount !== undefined ? `$${r.paidAmount}` : ''} via {r.paymentMethod || 'Card'}
          </div>
        </div>
      ),
    },
    {
      key: 'requestedStartDate',
      header: 'Start Date',
      render: (r) => (
        <span className="text-xs text-text-muted">
          {formatDate(r.requestedStartDate || r.createdAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant={r.status}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.status === 'pending' ? (
            <>
              <Button
                variant="primary"
                size="sm"
                isLoading={actionLoading === r.id}
                onClick={() => approveRequest(r.id)}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={actionLoading === r.id}
                onClick={() => rejectRequest(r.id)}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Reject
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInspectingRequest(r)}
            >
              Details
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInspectingRequest(r)}
          >
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-main flex items-center gap-3">
            <Inbox className="w-7 h-7 text-brand-primary" />
            Public Subscription Inquiries Inbox
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Review incoming public sign-ups and 1-click convert them into active members.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => refreshRequests()}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Feed
        </Button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearMessages} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={clearMessages} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Inquiries"
          value={String(pendingCount)}
          subtitle="Awaiting administrative sign-off"
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="Approved Members"
          value={String(approvedCount)}
          subtitle="Converted to active member profiles"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          title="Rejected / Canceled"
          value={String(rejectedCount)}
          subtitle="Declined sign-up submissions"
          icon={<X className="w-5 h-5" />}
        />
      </div>

      {/* Main Table */}
      <Table
        columns={columns}
        data={requests}
        keyExtractor={(r) => r.id}
        isLoading={loading}
        emptyMessage="No pending subscription requests. Inquiries submitted via the public storefront will appear here."
      />

      {/* Request Details Review Modal */}
      <Modal
        isOpen={!!inspectingRequest}
        onClose={() => setInspectingRequest(null)}
        title="Subscription Inquiry Details"
        subtitle={`Request ID: ${inspectingRequest?.id}`}
      >
        {inspectingRequest && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h4 className="text-lg font-bold text-text-main font-heading">
                  {inspectingRequest.fullName}
                </h4>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-brand-primary" />
                    {inspectingRequest.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-primary" />
                    {inspectingRequest.phone}
                  </span>
                </div>
              </div>
              <Badge variant={inspectingRequest.status}>{inspectingRequest.status}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-card border border-border-subtle">
                <span className="text-text-muted block">Selected Plan</span>
                <span className="text-sm font-bold text-brand-primary mt-0.5 block">
                  {inspectingRequest.planName}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-card border border-border-subtle">
                <span className="text-text-muted block">Duration</span>
                <span className="text-sm font-bold text-text-main mt-0.5 block">
                  {inspectingRequest.duration ? `${inspectingRequest.duration} Month(s)` : '1 Month'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-card border border-border-subtle">
                <span className="text-text-muted block">Amount Paid</span>
                <span className="text-sm font-bold text-text-main mt-0.5 block">
                  ${inspectingRequest.paidAmount !== undefined ? inspectingRequest.paidAmount : '0.00'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-card border border-border-subtle">
                <span className="text-text-muted block">Payment Method</span>
                <span className="text-sm font-semibold text-text-main mt-0.5 block">
                  {inspectingRequest.paymentMethod || 'Credit Card'}
                </span>
              </div>
            </div>

            {inspectingRequest.notes && (
              <div className="p-4 rounded-xl bg-surface-card border border-border-subtle space-y-1 text-xs">
                <span className="font-semibold text-text-muted uppercase tracking-wider block">
                  Notes & Details
                </span>
                <p className="text-text-main">{inspectingRequest.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button variant="outline" onClick={() => setInspectingRequest(null)}>
                Close
              </Button>
              {inspectingRequest.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    isLoading={actionLoading === inspectingRequest.id}
                    onClick={async () => {
                      await rejectRequest(inspectingRequest.id);
                      setInspectingRequest(null);
                    }}
                  >
                    Reject Application
                  </Button>
                  <Button
                    variant="primary"
                    isLoading={actionLoading === inspectingRequest.id}
                    onClick={async () => {
                      await approveRequest(inspectingRequest.id);
                      setInspectingRequest(null);
                    }}
                  >
                    Approve & Provision Member
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubscriptionRequestsInbox;
