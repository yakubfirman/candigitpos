import { usePage, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layouts/AppLayout';
import { Card, CardBody } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { formatRupiah } from '@/Utils/currency';
import { formatTanggalWaktu } from '@/Utils/date';
import { FileText, Printer, AlertTriangle, ArrowLeft } from 'lucide-react';
import type { Transaction } from '@/Types/transaction';
import { useState } from 'react';

interface ShowTransactionProps {
  transaction: Transaction;
  auth: {
    user: {
      role: 'admin' | 'kasir';
      [key: string]: unknown;
    }
  };
  [key: string]: unknown;
}

export default function ShowTransaction() {
  const { transaction, auth } = usePage<ShowTransactionProps>().props;
  const isAdmin = auth.user.role === 'admin';
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = () => {
    if (!confirm('Yakin ingin membatalkan transaksi ini? Stok akan dikembalikan.')) return;
    setCancelling(true);
    router.patch(`/transactions/${transaction.id}/cancel`, {}, {
      onFinish: () => setCancelling(false),
    });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/transactions" className="text-stone-600 hover:text-stone-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-stone-800">Detail Transaksi</h1>
            <p className="font-mono text-sm text-stone-500">{transaction.invoice_number}</p>
          </div>
        </div>

        {/* Transaction Info */}
        <Card>
          <CardBody className="p-6">
            <div className="flex justify-between border-b border-stone-200 pb-4">
              <div>
                <p className="text-sm text-stone-500">Tanggal</p>
                <p className="font-medium text-stone-800">{formatTanggalWaktu(transaction.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-stone-500">Status</p>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={transaction.status === 'completed' ? 'green' : 'red'}>
                    {transaction.status === 'completed' ? 'Lunas' : 'Dibatalkan'}
                  </Badge>
                  {transaction.status === 'completed' && transaction.fulfillment_status && (
                    <Badge variant={
                      transaction.fulfillment_status === 'pending' ? 'stone' : 
                      transaction.fulfillment_status === 'processing' ? 'amber' : 'green'
                    }>
                      {transaction.fulfillment_status === 'pending' ? 'Menunggu Dapur' : 
                       transaction.fulfillment_status === 'processing' ? 'Sedang Dimasak' : 'Siap Diantar'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="py-4">
              <h3 className="mb-3 text-sm font-medium text-stone-700">Item Belanja</h3>
              <div className="space-y-3">
                {transaction.items.map((item) => (
                  <div key={item.id} className="flex justify-between border-b border-dashed border-stone-100 pb-3">
                    <div>
                      <p className="font-medium text-stone-800">{item.product_name}</p>
                      <p className="text-sm text-stone-500">
                        {item.quantity} × {formatRupiah(Number(item.product_price))}
                      </p>
                    </div>
                    <p className="font-medium text-stone-800">{formatRupiah(Number(item.subtotal))}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-stone-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Subtotal</span>
                <span className="text-stone-800">{formatRupiah(Number(transaction.subtotal))}</span>
              </div>
              {Number(transaction.discount_amount) > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Diskon</span>
                  <span>−{formatRupiah(Number(transaction.discount_amount))}</span>
                </div>
              )}
              {Number(transaction.tax_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Pajak</span>
                  <span className="text-stone-800">{formatRupiah(Number(transaction.tax_amount))}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2">
                <span className="text-stone-800">Total</span>
                <span className="text-green-700">{formatRupiah(Number(transaction.total))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Metode Bayar</span>
                <span className="text-stone-800 capitalize">{transaction.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Bayar</span>
                <span className="text-stone-800">{formatRupiah(Number(transaction.amount_paid))}</span>
              </div>
              {Number(transaction.change_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Kembalian</span>
                  <span className="text-green-700 font-medium">{formatRupiah(Number(transaction.change_amount))}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {transaction.notes && (
              <div className="mt-4 border-t border-stone-200 pt-4">
                <p className="text-sm text-stone-500">Catatan:</p>
                <p className="text-stone-800">{transaction.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => window.print()}>
                Cetak Struk
              </Button>
              {isAdmin && transaction.status === 'completed' && (
                <Button
                  variant="danger"
                  loading={cancelling}
                  onClick={handleCancel}
                >
                  Batalkan Transaksi
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}