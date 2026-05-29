import { usePage, Link } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layouts/AppLayout';
import { Card, CardBody } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Badge } from '@/Components/UI/Badge';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/Components/UI/Table';
import { formatRupiah } from '@/Utils/currency';
import { formatTanggalWaktu } from '@/Utils/date';
import { FileText, ClipboardList, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import type { Transaction } from '@/Types/transaction';

interface TransactionsProps {
  transactions: {
    data: Transaction[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    start_date?: string;
    end_date?: string;
    status?: string;
    invoice_number?: string;
  };
  [key: string]: unknown;
}

export default function TransactionsIndex() {
  const { transactions, filters } = usePage<TransactionsProps>().props;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Transaksi</h1>
            <p className="text-sm text-stone-500 mt-1">Riwayat <span className="font-semibold text-stone-700">{transactions.total}</span> transaksi kasir</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardBody className="p-4">
            <form method="GET" className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  type="search"
                  name="invoice_number"
                  defaultValue={filters.invoice_number}
                  placeholder="Cari No. Invoice..."
                />
              </div>
              <div className="w-full sm:w-auto flex gap-3">
                <Input
                  type="date"
                  name="start_date"
                  defaultValue={filters.start_date}
                  placeholder="Tanggal mulai"
                />
                <Input type="date" name="end_date" defaultValue={filters.end_date} placeholder="Tanggal akhir" />
              </div>
              <div className="w-full sm:w-auto">
                <select
                  name="status"
                  defaultValue={filters.status}
                  className="h-11 rounded-xl border border-stone-200 bg-stone-50/50 px-4 text-sm text-stone-800 shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all duration-200"
                >
                  <option value="">Semua Status</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
              <div className="flex-1"></div>
              <Button type="submit" variant="secondary" className="h-11">
                Filter
              </Button>
              <Link href="/transactions">
                <Button type="button" variant="ghost" className="h-11">
                  Reset
                </Button>
              </Link>
            </form>
          </CardBody>
        </Card>

        {/* Transactions Table */}
        <Card>
          {transactions.data.length === 0 ? (
            <CardBody className="flex flex-col items-center justify-center text-center text-stone-400 py-12">
              <ClipboardList className="h-12 w-12 mb-2 text-stone-300" />
              <p className="mt-2">Belum ada transaksi</p>
            </CardBody>
          ) : (
            <Table>
              <TableHeader>
                <TableHead>Invoice</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pembayaran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableHeader>
              <TableBody>
                {transactions.data.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm font-medium">{transaction.invoice_number}</TableCell>
                    <TableCell className="text-stone-500">{formatTanggalWaktu(transaction.created_at)}</TableCell>
                    <TableCell>
                      <p className="font-semibold text-green-700">{formatRupiah(Number(transaction.total))}</p>
                      <p className="text-xs text-stone-400">
                        {transaction.items.length} item
                      </p>
                    </TableCell>
                    <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.status === 'completed' ? 'green' : 'red'}>
                        {transaction.status === 'completed' ? 'Selesai' : 'Batal'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/transactions/${transaction.id}`}>
                          <Button variant="ghost" size="sm">
                            Detail
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Pagination */}
        {transactions.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {transactions.current_page > 1 && (
              <Link href={`?page=${transactions.current_page - 1}`}>
                <Button variant="secondary" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
              </Link>
            )}
            <span className="flex items-center px-4 text-sm text-stone-600">
              Page {transactions.current_page} of {transactions.last_page}
            </span>
            {transactions.current_page < transactions.last_page && (
              <Link href={`?page=${transactions.current_page + 1}`}>
                <Button variant="secondary" size="sm">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}