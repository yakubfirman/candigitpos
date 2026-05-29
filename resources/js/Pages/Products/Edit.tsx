import { usePage, useForm, Link } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layouts/AppLayout';
import { Card, CardBody } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Alert } from '@/Components/UI/Alert';
import { ArrowLeft } from 'lucide-react';

interface EditProductProps {
  product: {
    id: number;
    category_id: number;
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
  };
  categories: { id: number; name: string }[];
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export default function EditProduct() {
  const { product, categories, errors } = usePage<EditProductProps>().props;

  const { data, setData, post, processing } = useForm({
    _method: 'put',
    category_id: String(product.category_id),
    name: product.name,
    barcode: product.barcode || '',
    description: product.description || '',
    price: product.price.toString(),
    cost_price: product.cost_price.toString(),
    stock: product.stock.toString(),
    min_stock: product.min_stock.toString(),
    unit: product.unit,
    image: null as File | null,
    is_active: product.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/products/${product.id}`, {
      forceFormData: true,
    });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-stone-600 hover:text-stone-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-stone-800">Edit Produk</h1>
            <p className="text-sm text-stone-500">{product.name}</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardBody className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.keys(errors || {}).length > 0 && (
                <Alert type="error" title="Gagal menyimpan">
                  Pastikan semua field terisi dengan benar.
                </Alert>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-stone-700">Kategori</label>
                  <select
                    value={data.category_id}
                    onChange={(e) => setData('category_id', e.target.value)}
                    className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors?.category_id && <p className="mt-1 text-xs text-red-600">{errors.category_id[0]}</p>}
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Nama Produk"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Masukkan nama produk"
                    error={errors?.name?.[0]}
                    required
                  />
                </div>

                <Input
                  label="Barcode"
                  value={data.barcode}
                  onChange={(e) => setData('barcode', e.target.value)}
                  placeholder="Opsional"
                  error={errors?.barcode?.[0]}
                />

                <Input
                  label="Unit"
                  value={data.unit}
                  onChange={(e) => setData('unit', e.target.value)}
                  placeholder="pcs, kg, liter, dll"
                />

                <Input
                  label="Harga Jual"
                  type="number"
                  value={data.price}
                  onChange={(e) => setData('price', e.target.value)}
                  placeholder="0"
                  error={errors?.price?.[0]}
                  required
                />

                <Input
                  label="Harga Modal"
                  type="number"
                  value={data.cost_price}
                  onChange={(e) => setData('cost_price', e.target.value)}
                  placeholder="0"
                />

                <Input
                  label="Stok"
                  type="number"
                  value={data.stock}
                  onChange={(e) => setData('stock', e.target.value)}
                  placeholder="0"
                />

                <Input
                  label="Stok Minimum"
                  type="number"
                  value={data.min_stock}
                  onChange={(e) => setData('min_stock', e.target.value)}
                  placeholder="5"
                />

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-stone-700">Deskripsi</label>
                  <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Opsional"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-stone-700">Gambar</label>
                  {product.image && (
                    <img src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`} alt={product.name} className="mb-2 h-24 w-24 rounded-lg object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setData('image', e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                  {errors?.image && <p className="mt-1 text-xs text-red-600">{errors.image[0]}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="rounded border-stone-300 text-green-600"
                    />
                    <span className="text-sm text-stone-700">Produk aktif (ditampilkan di kasir)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Link href="/products">
                  <Button type="button" variant="secondary">
                    Batal
                  </Button>
                </Link>
                <Button type="submit" loading={processing}>
                  Simpan
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}