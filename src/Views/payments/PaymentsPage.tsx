import React, { useState } from 'react';
import { Table, Column } from '../../Components/ui/Table';
import { Button } from '../../Components/ui/Button';
import { StatCard } from '../../Components/ui/StatCard';
import { DollarSign, Plus, Printer, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PaymentRecord } from '../../types/subscription.types';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/currencyUtils';

export const PaymentsPage: React.FC = () => {
  const [payments] = useState<PaymentRecord[]>(paymentService.getAll());

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
      key: 'actions',
      header: 'Receipt',
      render: (p) => (
        <Button variant="outline" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />}>
          Print Receipt
        </Button>
      ),
    },
  ];

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
          value="$9,600"
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          trend={{ value: '+14% vs last mo', isPositive: true }}
        />
        <StatCard
          title="Paid Invoices"
          value="48"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Pending / Overdue Invoices"
          value="3"
          subtitle="Totaling $377"
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
        />
      </div>

      {/* Payments Ledger Table */}
      <Table columns={columns} data={payments} keyExtractor={(p) => p.id} />
    </div>
  );
};
