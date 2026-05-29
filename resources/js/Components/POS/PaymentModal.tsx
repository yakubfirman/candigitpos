import { useState } from 'react';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { formatRupiah } from '@/Utils/currency';
import { Banknote, Building2, CreditCard, Utensils, ShoppingBag } from 'lucide-react';
import type { PaymentMethod } from '@/Types/transaction';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onSubmit: (data: { payment_method: PaymentMethod; amount_paid: number; notes?: string; customer_phone?: string; customer_name?: string; table_number?: string; order_type: 'dine_in'|'take_away' }) => void;
  loading?: boolean;
  showOrderType?: boolean;
  showWhatsapp?: boolean;
}

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'cash', label: 'Tunai', icon: <Banknote className="h-7 w-7 text-green-600" /> },
  { value: 'qris', label: 'QRIS', icon: <img src="/qris.svg" alt="QRIS" className="h-7 w-auto object-contain drop-shadow-sm" /> },
  { value: 'transfer', label: 'Transfer', icon: <Building2 className="h-7 w-7 text-purple-600" /> },
  { value: 'kartu', label: 'Kartu', icon: <CreditCard className="h-7 w-7 text-orange-600" /> },
];

export function PaymentModal({ isOpen, onClose, total, onSubmit, loading, showOrderType = true, showWhatsapp = true }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState<'dine_in'|'take_away'>('dine_in');

  const numericAmountPaid = Number(amountPaid.replace(/[^\d]/g, '')) || 0;
  const change = Math.max(0, numericAmountPaid - total);

  const handleSubmit = () => {
    // Validasi dine-in harus isi meja (hanya jika fitur order type aktif)
    if (showOrderType && orderType === 'dine_in' && !tableNumber.trim()) {
      return; // Do nothing if dine-in but no table
    }

    if (paymentMethod !== 'cash' || numericAmountPaid >= total) {
      onSubmit({
        payment_method: paymentMethod,
        amount_paid: paymentMethod === 'cash' ? numericAmountPaid : total,
        notes: notes || undefined,
        customer_phone: customerPhone || undefined,
        customer_name: customerName || undefined,
        table_number: orderType === 'dine_in' ? (tableNumber || undefined) : undefined,
        order_type: orderType,
      });
    }
  };

  const handleClose = () => {
    setPaymentMethod('cash');
    setAmountPaid('');
    setNotes('');
    setCustomerPhone('');
    setCustomerName('');
    setTableNumber('');
    setOrderType('dine_in');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Pembayaran" size="lg">
      <div className="space-y-4">
        {/* Total */}
        <div className="text-center">
          <p className="text-sm text-stone-500">Total Belanja</p>
          <p className="text-3xl font-bold text-green-700">{formatRupiah(total)}</p>
        </div>

        {/* Payment Method */}
        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">Metode Pembayaran</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {paymentMethods.map((method) => (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                  paymentMethod === method.value
                    ? 'border-green-600 bg-green-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="mb-1">{method.icon}</div>
                <span className="text-sm font-medium text-stone-800">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash Input */}
        {paymentMethod === 'cash' && (
          <div className="space-y-3">
            <Input
              label="Jumlah Bayar"
              type="text"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="Masukkan jumlah uang"
            />
            {numericAmountPaid > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Jumlah Bayar</span>
                  <span className="font-medium text-stone-800">{formatRupiah(numericAmountPaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Kembalian</span>
                  <span className="font-medium text-green-700">{formatRupiah(change)}</span>
                </div>
              </>
            )}
            <div className="flex flex-wrap gap-2">
              {[50000, 100000, 150000, 200000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmountPaid(val.toString())}
                  className="rounded-lg border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100"
                >
                  {formatRupiah(val)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Customer Details & Notes */}
        <div className="space-y-3 border-t border-stone-200 pt-3">
          {/* Order Type Toggle */}
          {showOrderType && (
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`flex items-center justify-center gap-2 flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                orderType === 'dine_in' ? 'bg-white text-green-700 shadow-sm ring-1 ring-stone-200' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
              }`}
            >
              <Utensils className="h-4 w-4" /> Dine-in
            </button>
            <button
              onClick={() => setOrderType('take_away')}
              className={`flex items-center justify-center gap-2 flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                orderType === 'take_away' ? 'bg-white text-green-700 shadow-sm ring-1 ring-stone-200' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
              }`}
            >
              <ShoppingBag className="h-4 w-4" /> Take-away
            </button>
          </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input 
              label="Nama Pelanggan (opsional)" 
              value={customerName} 
              onChange={(e) => setCustomerName(e.target.value)} 
              placeholder="Contoh: Budi" 
            />
            {orderType === 'dine_in' && (
              <Input 
                label="Nomor Meja (Wajib)" 
                value={tableNumber} 
                onChange={(e) => setTableNumber(e.target.value)} 
                placeholder="Contoh: 12" 
                required
              />
            )}
          </div>
          {showWhatsapp && (
          <div>
            <Input 
              label="Nomor HP Pelanggan (opsional)" 
              type="tel"
              value={customerPhone} 
              onChange={(e) => setCustomerPhone(e.target.value)} 
              placeholder="Contoh: 081234567890" 
            />
            <p className="mt-1 text-xs text-stone-500">Diperlukan jika ingin otomatis mengirim struk via WA</p>
          </div>
          )}
          <Input 
            label="Catatan (opsional)" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Tambahkan catatan pesanan..." 
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={
              (paymentMethod === 'cash' && numericAmountPaid < total) || 
              (showOrderType && orderType === 'dine_in' && !tableNumber.trim())
            }
            className="flex-1"
          >
            Bayar {formatRupiah(paymentMethod === 'cash' ? (numericAmountPaid >= total ? numericAmountPaid : 0) : total)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}