import { PaymentRecord } from '../types/subscription.types';
import { getStoredItem, setStoredItem } from '../utils/storageUtils';
import paymentsSeed from '../data/payments.json';

const STORAGE_KEY = 'gym_payments';

export const paymentService = {
  getAll(): PaymentRecord[] {
    return getStoredItem<PaymentRecord[]>(STORAGE_KEY, paymentsSeed as PaymentRecord[]);
  },

  create(payment: Omit<PaymentRecord, 'id'>): PaymentRecord {
    const list = this.getAll();
    const newRecord: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}`,
    };
    list.unshift(newRecord);
    setStoredItem(STORAGE_KEY, list);
    return newRecord;
  },
};
