export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'kartu';
export type TransactionStatus = 'completed' | 'cancelled';

export interface TransactionItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  discount_percent: number;
  subtotal: number;
  is_ready?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  invoice_number: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payment_method: PaymentMethod;
  amount_paid: string | number;
  change_amount: string | number;
  status: 'completed' | 'cancelled';
  fulfillment_status?: 'pending' | 'processing' | 'ready';
  customer_name?: string | null;
  table_number?: string | null;
  order_type?: 'dine_in' | 'take_away';
  notes: string | null;
  items: TransactionItem[];
  created_at: string;
  updated_at: string;
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    cash: 'Tunai',
    qris: 'QRIS',
    transfer: 'Transfer',
    kartu: 'Kartu',
  };
  return labels[method];
}

export function getStatusLabel(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return labels[status];
}