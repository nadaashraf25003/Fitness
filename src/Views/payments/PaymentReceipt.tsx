import React from 'react';
import { PaymentRecord } from '../../types/subscription.types';
import { formatCurrency } from '../../utils/currencyUtils';

interface PaymentReceiptProps {
  payment: PaymentRecord;
  onPrint?: () => void;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ payment }) => {
  return (
    <div className="printable-area p-8 bg-surface rounded-xl border border-border-subtle max-w-lg mx-auto text-text-main">
      <div className="text-center pb-6 border-b border-border-subtle">
        <h2 className="text-2xl font-extrabold font-heading text-brand-primary">GEM.FIT</h2>
        <p className="text-xs text-text-muted">Official Payment Receipt & Tax Invoice</p>
      </div>

      <div className="py-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Receipt ID:</span>
          <span className="font-mono font-semibold">{payment.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Member Name:</span>
          <span className="font-semibold">{payment.memberName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Payment Date:</span>
          <span>{payment.date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Method:</span>
          <span className="uppercase font-mono">{payment.method}</span>
        </div>
        <div className="flex justify-between pt-4 border-t border-border-subtle text-base font-bold">
          <span>Total Paid:</span>
          <span className="text-brand-primary">{formatCurrency(payment.amount)}</span>
        </div>
      </div>
    </div>
  );
};
