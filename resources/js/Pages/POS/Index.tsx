import { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layouts/AppLayout';
import { Card } from '@/Components/UI/Card';
import { ProductGrid } from '@/Components/POS/ProductGrid';
import { Cart } from '@/Components/POS/Cart';
import { PaymentModal } from '@/Components/POS/PaymentModal';
import { ReceiptPrint } from '@/Components/POS/ReceiptPrint';
import { Button } from '@/Components/UI/Button';
import { Modal } from '@/Components/UI/Modal';
import { useCart } from '@/Hooks/useCart';
import { useProductFilter } from '@/Hooks/useProductFilter';
import type { Product } from '@/Types/product';
import type { PaymentMethod } from '@/Types/transaction';
import { CheckCircle } from 'lucide-react';

interface POSProps {
  products: Product[];
  categories: { id: number; name: string }[];
  flash?: {
    success?: string;
  };
}

export default function POS({ products, categories }: Omit<POSProps, 'flash'>) {
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const waWindowRef = useRef<Window | null>(null);

  const { search, setSearch, categoryId, setCategoryId, filteredProducts } = useProductFilter(products);
  
  const { app_settings, feature_settings } = usePage<any>().props;
  const featureDiscountTax = feature_settings?.feature_discount_tax !== false;
  const featureWhatsapp = feature_settings?.feature_whatsapp !== false;
  const featureOrderType = feature_settings?.feature_order_type !== false;
  const globalDiscountRate = featureDiscountTax ? parseFloat(app_settings?.discount_rate || '0') : 0;
  const globalTaxRate = featureDiscountTax ? parseFloat(app_settings?.tax_rate || '0') : 0;
  const cart = useCart(globalDiscountRate, globalTaxRate);

  const handleCheckout = () => {
    if (cart.items.length > 0) {
      setShowPayment(true);
    }
  };

  const handlePayment = (data: { payment_method: PaymentMethod; amount_paid: number; notes?: string; customer_phone?: string; customer_name?: string; table_number?: string; order_type: 'dine_in'|'take_away' }) => {
    setProcessing(true);
    if (data.customer_phone) {
      setCustomerPhone(data.customer_phone);
    }

    router.post('/pos/transaction', {
      items: cart.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        discount_percent: item.discount_percent,
        subtotal: item.subtotal,
      })),
      subtotal: cart.subtotal,
      discount_amount: cart.discount_amount,
      tax_amount: cart.tax_amount,
      total: cart.total,
      payment_method: data.payment_method,
      amount_paid: data.amount_paid,
      notes: data.notes,
      customer_name: data.customer_name,
      table_number: data.table_number,
      order_type: data.order_type,
    }, {
      onSuccess: (page) => {
        setProcessing(false);
        setShowPayment(false);
        cart.clearCart();
        
        // Show receipt modal instead of redirecting
        const flashProps = page.props.flash as { transaction?: any };
        const newTransaction = flashProps?.transaction;
        if (newTransaction) {
          setCompletedTransaction(newTransaction);
        }
      },
      onError: () => {
        setProcessing(false);
      },
    });
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Left: Products */}
        <div className="flex-1 overflow-y-auto pr-2 pb-24 lg:pb-4">
          <ProductGrid
            products={filteredProducts}
            onAddProduct={cart.addItem}
            search={search}
            onSearchChange={setSearch}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            categories={categories}
          />
        </div>

        {/* Right: Cart */}
        <div className="hidden w-80 lg:block">
          <Card className="flex h-full flex-col">
            <div className="border-b border-stone-200 px-4 py-3">
              <h2 className="font-semibold text-stone-800">Keranjang</h2>
              <p className="text-xs text-stone-500">{cart.items.length} item</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <Cart
                items={cart.items}
                subtotal={cart.subtotal}
                discountAmount={cart.discount_amount}
                taxAmount={cart.tax_amount}
                total={cart.total}
                onUpdateQty={cart.updateQuantity}
                onRemove={cart.removeItem}
                onCheckout={handleCheckout}
                onClear={cart.clearCart}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-stone-200 bg-white p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">{cart.items.length} item</p>
            <p className="text-xl font-bold text-green-700">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(cart.total)}
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleCheckout}
            disabled={cart.items.length === 0}
            className="px-8 shadow-green-600/30 shadow-lg"
          >
            Bayar
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        total={cart.total}
        onSubmit={handlePayment}
        loading={processing}
        showOrderType={featureOrderType}
        showWhatsapp={featureWhatsapp}
      />

      {/* Success Receipt Modal */}
      <Modal 
        isOpen={!!completedTransaction} 
        onClose={() => { setCompletedTransaction(null); setCustomerPhone(''); waWindowRef.current = null; }} 
        title="Transaksi Berhasil"
        icon={<CheckCircle className="h-4 w-4" />}
      >
        {completedTransaction && (
          <ReceiptPrint 
            transaction={completedTransaction} 
            customerPhone={customerPhone}
            waWindow={waWindowRef.current}
            onClose={() => { setCompletedTransaction(null); setCustomerPhone(''); waWindowRef.current = null; }}
            showWhatsapp={featureWhatsapp}
          />
        )}
      </Modal>
    </AppLayout>
  );
}