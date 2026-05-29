import type { Category } from './category';

export interface Product {
  id: number;
  category_id: number;
  category?: Category;
  name: string;
  slug: string;
  barcode: string | null;
  description: string | null;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  unit: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}