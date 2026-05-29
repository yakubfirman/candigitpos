import type { CartItem as CartItemType } from '@/Types/cart';
import { formatRupiah } from '@/Utils/currency';
import { Button } from '@/Components/UI/Button';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';

interface CartProps {
  items: CartItemType[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  onUpdateQty: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
  onCheckout: () => void;
  onClear: () => void;
}

export function Cart({
  items,
  subtotal,
  discountAmount,
  taxAmount,
  total,
  onUpdateQty,
  onRemove,
  onCheckout,
  onClear,
}: CartProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-stone-400 p-6 text-center">
        <div className="rounded-full bg-stone-100 p-4">
          <ShoppingCart className="h-10 w-10 text-stone-300" />
        </div>
        <div>
          <p className="text-base font-medium text-stone-600">Keranjang kosong</p>
          <p className="text-xs mt-1">Klik produk untuk menambahkan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Items */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="group flex items-center gap-3 rounded-lg border border-stone-200/60 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:border-green-200"
          >
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-stone-800">{item.product.name}</p>
              <p className="text-xs text-green-700">{formatRupiah(item.product.price)}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 p-1">
              <button
                onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-sm font-semibold text-stone-700">{item.quantity}</span>
              <button
                onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <button
              onClick={() => onRemove(item.product.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-stone-200 bg-stone-50 space-y-1.5 p-4">
        <div className="flex justify-between text-sm text-stone-600">
          <span>Subtotal</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-red-600">
            <span>Diskon</span>
            <span>−{formatRupiah(discountAmount)}</span>
          </div>
        )}
        {taxAmount > 0 && (
          <div className="flex justify-between text-sm text-stone-600">
            <span>Pajak</span>
            <span>{formatRupiah(taxAmount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-stone-300 pt-2 text-base font-semibold text-stone-800">
          <span>Total</span>
          <span className="text-green-700">{formatRupiah(total)}</span>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onClear} className="flex-1">
            Bersihkan
          </Button>
          <Button variant="primary" size="md" onClick={onCheckout} className="flex-1">
            Bayar
          </Button>
        </div>
      </div>
    </div>
  );
}