import React, { useState } from 'react';
import { Table, Column } from '../../Components/ui/Table';
import { Button } from '../../Components/ui/Button';
import { StatCard } from '../../Components/ui/StatCard';
import { DollarSign, Plus, Printer, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PaymentRecord } from '../../types/subscription.types';
import { usePayments } from '../../Hooks/usePayments';
import { formatCurrency } from '../../utils/currencyUtils';
import { Spinner } from '../../Components/ui/Spinner';

export const PaymentsPage: React.FC = () => {
  const [branchId] = useState(1);
  const { payments, loading, error } = usePayments(branchId);

  const columns: Column<PaymentRecord>[] = [
    {
      key: 'memberName',
      header: 'Member / Payer',
      render: (p) => <span className="font-semibold text-text-main">{p.memberName}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (p) => <span className="font-bold text-brand-primary">{formatCurrency(p.amount)}</span>,
    },
    {
      key: 'method',
      header: 'Payment Method',
      render: (p) => <span className="text-xs uppercase font-mono text-text-muted">{p.method}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (p) => <span className="text-xs text-text-muted">{p.date}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <span className={`text-xs font-semibold ${p.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
          {p.status?.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Receipt',
      render: (p) => (
        <Button variant="outline" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />}>
          Print Receipt
        </Button>
      ),
    },
  ];

  // Calculate totals from payments
  const totalRevenue = payments.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0);
  const paidInvoices = payments.filter((p) => p.status === 'paid').length;
  const pendingInvoices = payments.filter((p) => p.status !== 'paid').length;
  const pendingAmount = payments
    .filter((p) => p.status !== 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        <p>Failed to load payments: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-main flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-brand-primary" />
            Payments & Financial Invoicing
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Payment transactions, overdue account flags, and printable receipts.
          </p>
        </div>

        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Record Transaction
        </Button>
      </div>

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Monthly Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          trend={{ value: `${payments.length} transactions`, isPositive: true }}
        />
        <StatCard
          title="Paid Invoices"
          value={paidInvoices.toString()}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Pending / Overdue Invoices"
          value={pendingInvoices.toString()}
          subtitle={`Totaling ${formatCurrency(pendingAmount)}`}
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
        />
      </div>

      {/* Payments Ledger Table */}
      {payments.length > 0 ? (
        <Table columns={columns} data={payments} keyExtractor={(p) => p.id} />
      ) : (
        <div className="bg-surface rounded-lg p-8 text-center text-text-muted">
          <p>No payments recorded yet.</p>
        </div>
      )}
    </div>
  );
};
