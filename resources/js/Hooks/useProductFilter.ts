import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/Types/product';

export function useProductFilter(products: Product[]) {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = debouncedSearch
        ? product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (product.barcode && product.barcode.toLowerCase().includes(debouncedSearch.toLowerCase()))
        : true;

      const matchesCategory = categoryId ? product.category_id === categoryId : true;

      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearch, categoryId]);

  return {
    search,
    setSearch,
    categoryId,
    setCategoryId,
    filteredProducts,
  };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
