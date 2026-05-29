import { useState, useCallback, useMemo } from 'react';
import type { CartItem, CartState } from '@/Types/cart';
import type { Product } from '@/Types/product';

export function useCart(globalDiscountRate = 0, globalTaxRate = 0) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);

  const addItem = useCallback((product: Product) => {
    if (product.stock <= 0) return; // Prevent adding out of stock

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const price = Number(product.price);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Prevent adding beyond stock
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * price }
            : i
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          discount_percent: 0,
          subtotal: price,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) => {
          if (i.product.id === productId) {
            // Prevent updating beyond stock
            const validQuantity = Math.min(quantity, i.product.stock);
            return {
              ...i,
              quantity: validQuantity,
              subtotal: validQuantity * Number(i.product.price) * (1 - i.discount_percent / 100),
            };
          }
          return i;
        })
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountAmount(0);
  }, []);

  const summary = useMemo((): CartState => {
    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    
    // Hitung diskon persentase global
    const calculatedDiscountAmount = subtotal * (globalDiscountRate / 100);
    // Gabungkan dengan diskon nominal manual (jika ada)
    const totalDiscountAmount = calculatedDiscountAmount + discountAmount;
    
    const afterDiscount = subtotal - totalDiscountAmount;
    
    // Hitung pajak dari subtotal yang sudah didiskon
    const taxAmount = afterDiscount > 0 ? afterDiscount * (globalTaxRate / 100) : 0;
    
    return {
      items,
      subtotal,
      discount_amount: totalDiscountAmount,
      tax_amount: taxAmount,
      total: afterDiscount > 0 ? afterDiscount + taxAmount : 0,
    };
  }, [items, discountAmount, globalDiscountRate, globalTaxRate]);

  return {
    ...summary,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setDiscountAmount,
  };
}