import { usePage } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layouts/AppLayout';
import { Card, CardHeader, CardBody } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { formatRupiah } from '@/Utils/currency';
import { formatTanggal, formatWaktu } from '@/Utils/date';
import { Banknote, Receipt, Package, Landmark, TrendingUp, ArrowUpRight } from 'lucide-react';
import type { Transaction, TransactionItem } from '@/Types/transaction';
import type { Product } from '@/Types/product';

interface DashboardProps {
  summary: {
    total_transactions: number;
    total_revenue: number;
    total_items_sold: number;
    average_transaction: number;
  };
  recentTransactions: Transaction[];
  lowStockProducts: Product[];
  topProducts: TransactionItem[];
  selectedDate: string;
  [key: string]: unknown;
}

export default function Dashboard() {
  const { summary, recentTransactions, lowStockProducts, selectedDate } = usePage<DashboardProps>().props;
  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-stone-500 mt-1">Ringkasan hari ini: <span className="font-semibold text-stone-700">{formatTanggal(selectedDate)}</span></p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-none shadow-md text-white overflow-hidden relative group">
            <div className="absolute -right-6 -top-6 text-green-500/30 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="w-32 h-32" />
            </div>
            <CardBody className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Banknote className="h-5 w-5 text-white" />
                </div>
                <p className="font-medium text-green-50">Total Pendapatan</p>
              </div>
              <p className="text-3xl font-bold tracking-tight">{formatRupiah(Number(summary.total_revenue))}</p>
            </CardBody>
          </Card>

          <Card className="border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-stone-100 p-2 rounded-lg text-stone-600">
                  <Receipt className="h-5 w-5" />
                </div>
                <Badge variant="green" className="flex gap-1 items-center"><ArrowUpRight className="h-3 w-3"/>Hari ini</Badge>
              </div>
              <p className="text-stone-500 font-medium mb-1">Total Transaksi</p>
              <p className="text-2xl font-bold text-stone-800">{summary.total_transactions} <span className="text-sm font-normal text-stone-400">struk</span></p>
            </CardBody>
          </Card>

          <Card className="border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              <p className="text-stone-500 font-medium mb-1">Item Terjual</p>
              <p className="text-2xl font-bold text-stone-800">{summary.total_items_sold} <span className="text-sm font-normal text-stone-400">unit</span></p>
            </CardBody>
          </Card>

          <Card className="border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                  <Landmark className="h-5 w-5" />
                </div>
              </div>
              <p className="text-stone-500 font-medium mb-1">Rata-rata Transaksi</p>
              <p className="text-2xl font-bold text-stone-800">{formatRupiah(Number(summary.average_transaction))}</p>
            </CardBody>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-stone-100">
              <h2 className="text-lg font-semibold text-stone-800">Transaksi Terbaru</h2>
              <a href="/transactions" className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline">
                Lihat semua &rarr;
              </a>
            </CardHeader>
            <CardBody className="p-0 flex-1">
              {recentTransactions.length === 0 ? (
                <div className="h-full min-h-[200px] flex items-center justify-center text-stone-400 p-6">Belum ada transaksi hari ini</div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {recentTransactions.map((transaction) => (
                    <a
                      key={transaction.id}
                      href={`/transactions/${transaction.id}`}
                      className="flex items-center justify-between p-5 hover:bg-stone-50/80 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-medium text-stone-800 group-hover:text-green-700 transition-colors">{transaction.invoice_number}</p>
                          <p className="text-xs text-stone-500">{formatWaktu(transaction.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-stone-800 mb-1">{formatRupiah(Number(transaction.total))}</p>
                        <Badge variant={transaction.status === 'completed' ? 'green' : 'red'} className="text-[10px] px-1.5 py-0">
                          {transaction.status === 'completed' ? 'Selesai' : 'Batal'}
                        </Badge>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Low Stock Products */}
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-stone-100">
              <h2 className="text-lg font-semibold text-stone-800">Peringatan Stok</h2>
              <a href="/products?low_stock=1" className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline">
                Lihat semua &rarr;
              </a>
            </CardHeader>
            <CardBody className="p-0 flex-1">
              {lowStockProducts.length === 0 ? (
                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-stone-400 p-6">
                  <div className="bg-stone-100 p-3 rounded-full mb-3">
                    <Package className="h-6 w-6 text-stone-400" />
                  </div>
                  <p>Semua stok produk aman</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {lowStockProducts.map((product) => (
                    <a
                      key={product.id}
                      href={`/products/${product.id}/edit`}
                      className="flex items-center justify-between p-5 hover:bg-stone-50/80 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-stone-800 group-hover:text-red-700 transition-colors">{product.name}</p>
                          <p className="text-xs text-stone-500">{product.category?.name}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <Badge variant="red" className="mb-1 text-sm">{product.stock} {product.unit}</Badge>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">Min: {product.min_stock}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}