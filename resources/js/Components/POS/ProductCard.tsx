import { Product } from '@/Types/product';
import { formatRupiah } from '@/Utils/currency';
import { Badge } from '@/Components/UI/Badge';
import { cn } from '@/Utils/cn';
import { Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const stock = Number(product.stock);
  const minStock = Number(product.min_stock);
  const price = Number(product.price);
  const isLowStock = stock <= minStock && stock > 0;
  const isOutOfStock = stock === 0;
  const imageUrl = product.image
    ? (product.image.startsWith('http') ? product.image : `/storage/${product.image}`)
    : null;

  return (
    <button
      onClick={() => !isOutOfStock && onAdd(product)}
      disabled={isOutOfStock}
      className={cn(
        'relative flex flex-col rounded-xl border border-stone-200 bg-white p-4 text-left w-full overflow-hidden group',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:border-green-500/50 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500/20',
        isOutOfStock && 'opacity-50 cursor-not-allowed hover:-translate-y-0 hover:shadow-none hover:border-stone-200'
      )}
    >
      {imageUrl ? (
        <div className="overflow-hidden rounded-lg mb-3 aspect-square w-full">
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
      ) : (
        <div className="mb-3 flex aspect-square w-full items-center justify-center rounded-lg bg-stone-50 group-hover:bg-stone-100 transition-colors">
          <Package className="h-10 w-10 text-stone-300 group-hover:scale-110 transition-transform duration-500" />
        </div>
      )}

      <p className="line-clamp-2 text-sm font-medium text-stone-800">{product.name}</p>
      <p className="mt-1 text-sm font-semibold text-green-700">{formatRupiah(price)}</p>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-stone-500">Stok: {stock} {product.unit}</span>
        {isLowStock && <Badge variant="amber">Stok Rendah</Badge>}
        {isOutOfStock && <Badge variant="red">Habis</Badge>}
      </div>
    </button>
  );
}