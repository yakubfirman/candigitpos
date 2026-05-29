import { usePage, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layouts/AppLayout';
import { Card, CardHeader, CardBody } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Badge } from '@/Components/UI/Badge';
import { formatRupiah } from '@/Utils/currency';
import { Banknote, QrCode, Landmark, CreditCard, TrendingUp, Package, Receipt, ArrowUpRight, Download } from 'lucide-react';
import type { Transaction } from '@/Types/transaction';
import type { Product } from '@/Types/product';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ReportsProps {
  summary: {
    total_transactions: number;
    total_revenue: number;
    total_items_sold: number;
    average_transaction: number;
  };
  transactions: Transaction[];
  topProducts: {
    product_id: number;
    product_name: string;
    total_quantity: number;
    total_revenue: number;
  }[];
  salesByPaymentMethod: Record<string, { count: number; total: number }>;
  lowStockProducts: Product[];
  filters: {
    period: string;
    date: string;
    month: string;
    year: string;
    start_date: string;
    end_date: string;
  };
  [key: string]: unknown;
}

export default function ReportsIndex() {
  const { summary, transactions, topProducts, salesByPaymentMethod, lowStockProducts, filters } =
    usePage<ReportsProps>().props;

  const paymentMethods: Record<string, string> = {
    cash: 'Tunai',
    qris: 'QRIS',
    transfer: 'Transfer',
    kartu: 'Kartu',
  };

  const period = filters.period || 'monthly';

  // Group transactions by date for the Line Chart
  const salesByDate = transactions
    .filter(t => t.status === 'completed')
    .reduce((acc, curr) => {
      const dateObj = new Date(curr.created_at);
      let dateStr = '';

      if (period === 'daily') {
        // Harian: Kelompokkan per jam
        dateStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      } else if (period === 'yearly') {
        // Tahunan: Kelompokkan per bulan
        dateStr = dateObj.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      } else {
        // Bulanan/Custom: Kelompokkan per hari
        dateStr = dateObj.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      }

      acc[dateStr] = (acc[dateStr] || 0) + Number(curr.total);
      return acc;
    }, {} as Record<string, number>);

  // Sort keys by actual date order
  const sortedDates = Object.keys(salesByDate); 
  const revenueData = sortedDates.map(date => salesByDate[date]);

  const lineChartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        data: revenueData,
        borderColor: '#15803d', // green-700
        backgroundColor: 'rgba(21, 128, 61, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4, // Smooth curves
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#15803d',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1917', // stone-900
        padding: 12,
        titleFont: { size: 14, family: "'Inter', sans-serif" },
        bodyFont: { size: 13, family: "'Inter', sans-serif" },
        callbacks: {
          label: function(context: any) {
            return ' Pendapatan: ' + formatRupiah(context.raw);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f5f5f4', drawBorder: false }, // stone-100
        ticks: {
          callback: function(value: any) {
            if (value >= 1000000) return 'Rp ' + (value / 1000000).toFixed(1) + ' Jt';
            if (value >= 1000) return 'Rp ' + (value / 1000).toFixed(0) + ' Rb';
            return 'Rp ' + value;
          },
          font: { family: "'Inter', sans-serif" },
          color: '#78716c' // stone-500
        }
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { family: "'Inter', sans-serif" }, color: '#78716c' }
      }
    }
  };

  const barChartData = {
    labels: topProducts.slice(0, 5).map(p => p.product_name),
    datasets: [
      {
        label: 'Item Terjual',
        data: topProducts.slice(0, 5).map(p => p.total_quantity),
        backgroundColor: '#22c55e', // green-500
        hoverBackgroundColor: '#16a34a', // green-600
        borderRadius: 4,
        barThickness: 24,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1917',
        padding: 12,
        titleFont: { size: 14, family: "'Inter', sans-serif" },
        bodyFont: { size: 13, family: "'Inter', sans-serif" }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#f5f5f4', drawBorder: false },
        ticks: { font: { family: "'Inter', sans-serif" }, color: '#78716c', stepSize: 1 }
      },
      y: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { family: "'Inter', sans-serif" }, color: '#44403c' }
      }
    }
  };

  const paymentLabels = Object.keys(salesByPaymentMethod).map(m => paymentMethods[m] || m);
  const paymentData = Object.values(salesByPaymentMethod).map(d => d.total);
  const paymentColors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  const doughnutData = {
    labels: paymentLabels,
    datasets: [
      {
        data: paymentData,
        backgroundColor: paymentColors,
        borderWidth: 0,
        hoverOffset: 4,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: "'Inter', sans-serif", size: 13 },
          color: '#44403c'
        }
      },
      tooltip: {
        backgroundColor: '#1c1917',
        padding: 12,
        bodyFont: { size: 14, family: "'Inter', sans-serif" },
        callbacks: {
          label: function(context: any) {
            return ' ' + context.label + ': ' + formatRupiah(context.raw);
          }
        }
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header & Filters */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Dashboard Laporan</h1>
            <p className="text-sm text-stone-500 mt-1 mb-3">
              Ringkasan performa penjualan dari <span className="font-semibold text-stone-700">{filters.start_date}</span> hingga <span className="font-semibold text-stone-700">{filters.end_date}</span>
            </p>
            <a href={`/reports/export?period=${period}&date=${filters.date || ''}&month=${filters.month || ''}&year=${filters.year || ''}&start_date=${filters.start_date || ''}&end_date=${filters.end_date || ''}`} className="w-full sm:w-auto">
              <Button variant="secondary" className="h-9 w-full sm:w-auto px-4 text-sm font-medium border-stone-200 shadow-sm bg-white hover:bg-stone-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Excel
              </Button>
            </a>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-end sm:items-center justify-end">
            <div className="flex bg-stone-100 p-1.5 rounded-xl w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'yearly', label: 'Tahun' },
                { id: 'monthly', label: 'Bulan' },
                { id: 'daily', label: 'Hari' },
                { id: 'custom', label: 'Custom' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => router.get('/reports', { period: p.id }, { preserveState: true })}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
                    period === p.id ? 'bg-white text-green-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            
            {period !== 'all' && (
              <form method="GET" className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-stone-200 w-full sm:w-auto">
                <input type="hidden" name="period" value={period} />
                
                {period === 'daily' && (
                  <Input type="date" name="date" defaultValue={filters.date} className="h-9 text-sm border-none shadow-none focus:ring-0" />
                )}
                
                {period === 'monthly' && (
                  <Input type="month" name="month" defaultValue={filters.month} className="h-9 text-sm border-none shadow-none focus:ring-0" />
                )}
                
                {period === 'yearly' && (
                  <Input type="number" name="year" min="2000" max="2100" defaultValue={filters.year} className="h-9 text-sm w-24 border-none shadow-none focus:ring-0" />
                )}

                {period === 'custom' && (
                  <div className="flex items-center gap-2 px-2">
                    <Input type="date" name="start_date" defaultValue={filters.start_date} className="h-9 text-sm border-none shadow-none focus:ring-0 px-0" />
                    <span className="text-stone-400">-</span>
                    <Input type="date" name="end_date" defaultValue={filters.end_date} className="h-9 text-sm border-none shadow-none focus:ring-0 px-0" />
                  </div>
                )}
                
                <div className="w-px h-6 bg-stone-200 mx-1"></div>
                <Button type="submit" variant="primary" className="h-9 px-4 shrink-0">Terapkan</Button>
              </form>
            )}
          </div>
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
                <Badge variant="green" className="flex gap-1 items-center"><ArrowUpRight className="h-3 w-3"/>Transaksi</Badge>
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
              <p className="text-stone-500 font-medium mb-1">Produk Terjual</p>
              <p className="text-2xl font-bold text-stone-800">{summary.total_items_sold} <span className="text-sm font-normal text-stone-400">item</span></p>
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

        {/* Main Chart (Line) */}
        <Card className="border-stone-200 shadow-sm">
          <CardHeader className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-semibold text-stone-800">
              Tren Pendapatan {period === 'daily' ? 'Hari Ini (Per Jam)' : period === 'yearly' ? 'Periode Ini (Per Bulan)' : 'Periode Ini (Per Hari)'}
            </h2>
          </CardHeader>
          <CardBody className="p-6">
            <div className="h-[300px] w-full">
              {Object.keys(salesByDate).length > 0 ? (
                <Line data={lineChartData} options={lineChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-stone-400">Tidak ada data penjualan di periode ini</div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Secondary Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Products Bar Chart */}
          <Card className="border-stone-200 shadow-sm flex flex-col">
            <CardHeader className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-semibold text-stone-800">Top 5 Produk Terlaris</h2>
            </CardHeader>
            <CardBody className="p-6 flex-1">
              <div className="h-[250px] w-full">
                {topProducts.length > 0 ? (
                  <Bar data={barChartData} options={barChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-stone-400">Tidak ada data penjualan</div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Payment Methods Doughnut */}
          <Card className="border-stone-200 shadow-sm flex flex-col">
            <CardHeader className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-semibold text-stone-800">Metode Pembayaran</h2>
            </CardHeader>
            <CardBody className="p-6 flex-1">
              <div className="h-[250px] w-full flex justify-center">
                {Object.keys(salesByPaymentMethod).length > 0 ? (
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-stone-400">Tidak ada transaksi</div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <Card className="border-stone-200 shadow-sm lg:col-span-2">
            <CardHeader className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-semibold text-stone-800">Transaksi Terbaru</h2>
            </CardHeader>
            <CardBody className="p-0">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-stone-400">Tidak ada transaksi dalam periode ini</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50 border-b border-stone-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-stone-600">Invoice</th>
                        <th className="px-6 py-4 text-left font-semibold text-stone-600">Waktu</th>
                        <th className="px-6 py-4 text-left font-semibold text-stone-600">Metode</th>
                        <th className="px-6 py-4 text-right font-semibold text-stone-600">Total</th>
                        <th className="px-6 py-4 text-center font-semibold text-stone-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {transactions.slice(0, 5).map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium text-stone-700">{transaction.invoice_number}</td>
                          <td className="px-6 py-4 text-stone-500">
                            {new Date(transaction.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md text-xs font-medium">
                              {paymentMethods[transaction.payment_method] || transaction.payment_method}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-stone-800">
                            {formatRupiah(Number(transaction.total))}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={transaction.status === 'completed' ? 'green' : 'red'}>
                              {transaction.status === 'completed' ? 'Selesai' : 'Batal'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length > 5 && (
                    <div className="p-4 text-center border-t border-stone-100 bg-stone-50/50">
                      <Link href="/transactions" className="text-sm font-medium text-green-600 hover:text-green-700">Lihat Semua Transaksi &rarr;</Link>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Low Stock */}
          <Card className="border-stone-200 shadow-sm flex flex-col">
            <CardHeader className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-semibold text-stone-800">Peringatan Stok</h2>
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
                    <div key={product.id} className="flex items-center justify-between p-5 hover:bg-stone-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-800 truncate">{product.name}</p>
                          <p className="text-xs text-stone-500 truncate">{product.category?.name}</p>
                        </div>
                      </div>
                      <div className="text-right pl-3">
                        <Badge variant="red" className="text-sm px-2.5 py-1">
                          {product.stock} {product.unit}
                        </Badge>
                      </div>
                    </div>
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