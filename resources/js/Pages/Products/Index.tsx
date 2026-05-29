import { usePage, Link } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layouts/AppLayout';
import { Card, CardBody } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Badge } from '@/Components/UI/Badge';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/Components/UI/Table';
import { formatRupiah } from '@/Utils/currency';
import { Package, Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { Product } from '@/Types/product';

interface ProductsProps {
  products: {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  categories: { id: number; name: string }[];
  filters: {
    search?: string;
    category_id?: number;
    low_stock?: boolean;
  };
  auth: {
    user: {
      role: 'admin' | 'kasir';
      [key: string]: unknown;
    }
  };
  [key: string]: unknown;
}

export default function ProductsIndex() {
  const { products, categories, filters, auth } = usePage<ProductsProps>().props;
  const isAdmin = auth.user.role === 'admin';

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Produk</h1>
            <p className="text-sm text-stone-500 mt-1">Kelola stok dan harga untuk <span className="font-semibold text-stone-700">{products.total}</span> produk</p>
          </div>
          {isAdmin && (
            <Link href="/products/create">
              <Button><Plus className="h-4 w-4" /> Tambah Produk</Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardBody className="p-4">
            <form method="GET" className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  type="search"
                  name="search"
                  defaultValue={filters.search}
                  placeholder="Cari produk..."
                />
              </div>
              <div className="w-full sm:w-auto">
                <select
                  name="category_id"
                  defaultValue={filters.category_id}
                  className="h-11 rounded-xl border border-stone-200 bg-stone-50/50 px-4 text-sm text-stone-800 shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all duration-200"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600 bg-stone-50 px-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
                <input
                  type="checkbox"
                  name="low_stock"
                  value="1"
                  defaultChecked={filters.low_stock}
                  className="rounded text-green-600 focus:ring-green-500 cursor-pointer"
                />
                Stok Rendah
              </label>
              <div className="flex-1"></div>
              <Button type="submit" variant="secondary" className="h-11">
                Filter
              </Button>
              <Link href="/products">
                <Button type="button" variant="ghost" className="h-11">
                  Reset
                </Button>
              </Link>
            </form>
          </CardBody>
        </Card>

        {/* Products Table */}
        <Card>
          {products.data.length === 0 ? (
            <CardBody className="flex flex-col items-center justify-center text-center text-stone-400 py-12">
              <Package className="h-12 w-12 mb-2 text-stone-300" />
              <p className="mt-2">Belum ada produk</p>
              {isAdmin && (
                <Link href="/products/create">
                  <Button variant="secondary" className="mt-4">
                    Tambah Produk Pertama
                  </Button>
                </Link>
              )}
            </CardBody>
          ) : (
            <Table>
              <TableHeader>
                <TableHead>Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead>Aksi</TableHead>}
              </TableHeader>
              <TableBody>
                {products.data.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100">
                            <Package className="h-5 w-5 text-stone-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-stone-800">{product.name}</p>
                          {product.barcode && (
                            <p className="text-xs text-stone-400">{product.barcode}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category?.name}</TableCell>
                    <TableCell>
                      <p className="font-medium text-green-700">{formatRupiah(product.price)}</p>
                      {isAdmin && product.cost_price > 0 && (
                        <p className="text-xs text-stone-400">Modal: {formatRupiah(product.cost_price)}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className={`font-medium ${product.stock <= product.min_stock ? 'text-amber-600' : 'text-stone-800'}`}>
                        {product.stock} {product.unit}
                      </p>
                      <p className="text-xs text-stone-400">Min: {product.min_stock}</p>
                    </TableCell>
                    <TableCell>
                      {product.is_active ? (
                        <Badge variant="green">Aktif</Badge>
                      ) : (
                        <Badge variant="stone">Nonaktif</Badge>
                      )}
                      {product.stock <= product.min_stock && (
                        <Badge variant="amber" className="ml-1">
                          Stok Rendah
                        </Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Link href={`/products/${product.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4 mr-1.5" /> Edit
                            </Button>
                          </Link>
                          <form
                            method="POST"
                            action={`/products/${product.id}`}
                            className="inline"
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (confirm('Hapus produk ini?')) {
                                const form = e.target as HTMLFormElement;
                                const methodInput = document.createElement('input');
                                methodInput.type = 'hidden';
                                methodInput.name = '_method';
                                methodInput.value = 'DELETE';
                                form.appendChild(methodInput);
                                const tokenInput = document.createElement('input');
                                tokenInput.type = 'hidden';
                                tokenInput.name = '_token';
                                tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
                                form.appendChild(tokenInput);
                                form.submit();
                              }
                            }}
                          >
                            <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                              <Trash2 className="h-4 w-4 mr-1.5" /> Hapus
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Pagination */}
        {products.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {products.current_page > 1 && (
              <Link href={`?page=${products.current_page - 1}`}>
                <Button variant="secondary" size="sm">
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
              </Link>
            )}
            <span className="flex items-center px-4 text-sm text-stone-600">
              Page {products.current_page} of {products.last_page}
            </span>
            {products.current_page < products.last_page && (
              <Link href={`?page=${products.current_page + 1}`}>
                <Button variant="secondary" size="sm">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}