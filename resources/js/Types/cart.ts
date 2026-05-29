import type { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  discount_percent: number;
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
}