import { ProductCard } from './ProductCard';
import type { Product } from '@/Types/product';
import { Input } from '@/Components/UI/Input';
import { Search } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  categories: { id: number; name: string }[];
}

export function ProductGrid({
  products,
  onAddProduct,
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
}: ProductGridProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filter */}
      <div className="sticky top-0 z-10 -mx-1 px-1 pt-1 pb-3 mb-1 bg-stone-50/90 backdrop-blur-md flex flex-col gap-3 sm:flex-row shadow-sm sm:shadow-none border-b sm:border-b-0 border-stone-200">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap">
          <button
            onClick={() => onCategoryChange(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              categoryId === null
                ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
            }`}
          >
            Semua
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                categoryId === category.id
                  ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-stone-400">
          <Search className="h-12 w-12 mb-2 text-stone-300" />
          <p className="mt-2 text-sm">Produk tidak ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={onAddProduct} />
          ))}
        </div>
      )}
    </div>
  );
}