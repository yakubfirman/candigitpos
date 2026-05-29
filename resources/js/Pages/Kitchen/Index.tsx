import { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layouts/AppLayout';
import { Card } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { ChefHat, Clock, CheckCircle2, PlayCircle, Eye, X, ShoppingBag, Send, Check } from 'lucide-react';
import type { Transaction, TransactionItem } from '@/Types/transaction';

interface KitchenProps {
  transactions: Transaction[];
  auth: {
    user: {
      role: 'admin' | 'kasir' | 'dapur';
      [key: string]: unknown;
    }
  };
  flash?: {
    success?: string;
    error?: string;
  };
  [key: string]: unknown;
}

export default function KitchenIndex() {
  const { transactions } = usePage<KitchenProps>().props;
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'processing' | 'ready'>('pending');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Track checked items per transaction: { transactionId: Set<itemId> }
  // Persist to localStorage to prevent state loss on auto-refresh or manual refresh
  const [checkedItems, setCheckedItems] = useState<Record<number, Set<number>>>(() => {
    try {
      const saved = localStorage.getItem('kitchen_checked_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        const result: Record<number, Set<number>> = {};
        for (const key in parsed) {
          result[key] = new Set(parsed[key]);
        }
        return result;
      }
    } catch (e) {
      console.error("Failed to parse checkedItems from localStorage", e);
    }
    return {};
  });

  useEffect(() => {
    const toSave: Record<number, number[]> = {};
    for (const key in checkedItems) {
      if (checkedItems[key].size > 0) {
        toSave[key] = Array.from(checkedItems[key]);
      }
    }
    localStorage.setItem('kitchen_checked_items', JSON.stringify(toSave));
  }, [checkedItems]);

  // Auto reload page data every 10 seconds to get new orders
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['transactions'], preserveScroll: true, preserveState: true } as any);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-complete: when all items in processing tab are checked, automatically send them
  useEffect(() => {
    if (!selectedTransaction || selectedTransaction.fulfillment_status !== 'processing') return;
    const items = selectedTransaction.items ?? [];
    if (items.length === 0) return;
    
    // Only looking at items that are not yet ready in DB
    const processingItems = items.filter(i => !(i as any).is_ready);
    if (processingItems.length === 0) return;

    const checked = checkedItems[selectedTransaction.id];
    if (checked && checked.size === processingItems.length) {
      handleUpdateItems(selectedTransaction.id);
    }
  }, [checkedItems, selectedTransaction]);

  const handleUpdateStatus = (id: number, newStatus: 'processing' | 'ready') => {
    setProcessingId(id);
    router.patch(`/kitchen/${id}/status`, { status: newStatus }, {
      preserveScroll: true,
      onFinish: () => {
        setProcessingId(null);
        setSelectedTransaction(null);
        setCheckedItems(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      },
    });
  };

  const handleUpdateItems = (transactionId: number) => {
    const checked = checkedItems[transactionId];
    if (!checked || checked.size === 0) return;
    
    setProcessingId(transactionId);
    router.patch(`/kitchen/${transactionId}/items`, { 
      item_ids: Array.from(checked),
      is_ready: true
    }, {
      preserveScroll: true,
      onFinish: () => {
        setProcessingId(null);
        // Optional: Do not close modal if transaction is still processing?
        // Let's close it so the user can see the tab changes smoothly.
        setSelectedTransaction(null);
        setCheckedItems(prev => {
          const next = { ...prev };
          delete next[transactionId];
          return next;
        });
      },
    });
  };

  const toggleItemCheck = (transactionId: number, itemId: number) => {
    setCheckedItems(prev => {
      const existing = prev[transactionId] ?? new Set<number>();
      const next = new Set(existing);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return { ...prev, [transactionId]: next };
    });
  };

  const getElapsedTime = (dateString: string) => {
    const start = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diffMins = Math.floor((now - start) / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins >= 60) return `${Math.floor(diffMins / 60)}j ${diffMins % 60}m`;
    return `${diffMins}m lalu`;
  };

  // Filtering transactions based on item readiness
  const pendingTransactions = transactions.filter(t => t.fulfillment_status === 'pending');
  const processingTransactions = transactions.filter(t => 
    t.fulfillment_status === 'processing' && 
    (!t.items || t.items.length === 0 || t.items.some(i => !(i as any).is_ready))
  );
  const readyTransactions = transactions.filter(t => 
    t.fulfillment_status === 'ready' || 
    (t.fulfillment_status === 'processing' && t.items?.some(i => (i as any).is_ready))
  );
  
  let displayedTransactions = pendingTransactions;
  if (activeTab === 'processing') displayedTransactions = processingTransactions;
  if (activeTab === 'ready') displayedTransactions = readyTransactions;

  // Calculate items for the specific tab
  const getDisplayItems = (t: Transaction, tab: string) => {
    if (!t.items) return [];
    if (tab === 'processing') return t.items.filter(i => !(i as any).is_ready);
    if (tab === 'ready') return t.items.filter(i => (i as any).is_ready);
    return t.items;
  };

  const totalItems = (t: Transaction, tab: string) => 
    getDisplayItems(t, tab).reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AppLayout>
      <Head title="Sistem Layar Dapur" />
      
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-stone-700" />
              Layar Antrean Dapur
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Pantau dan kelola pesanan masuk secara real-time.
            </p>
            
            <div className="flex gap-2 mt-4 flex-wrap">
              <button 
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'pending' ? 'bg-stone-800 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Baru Masuk
                <span className={`px-2 py-0.5 rounded-md text-xs ${activeTab === 'pending' ? 'bg-stone-600 text-white' : 'bg-stone-200 text-stone-700'}`}>
                  {pendingTransactions.length}
                </span>
              </button>
              
              <button 
                onClick={() => setActiveTab('processing')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'processing' ? 'bg-amber-500 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Sedang Dimasak
                <span className={`px-2 py-0.5 rounded-md text-xs ${activeTab === 'processing' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'}`}>
                  {processingTransactions.length}
                </span>
              </button>

              <button 
                onClick={() => setActiveTab('ready')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'ready' ? 'bg-green-600 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Riwayat Selesai
                <span className={`px-2 py-0.5 rounded-md text-xs ${activeTab === 'ready' ? 'bg-green-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                  {readyTransactions.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Board Content */}
        {displayedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-stone-300">
            <div className="bg-stone-50 p-4 rounded-full mb-4">
              <ChefHat className="h-10 w-10 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-700">
              {activeTab === 'pending' ? 'Belum Ada Pesanan Baru' : 
               activeTab === 'processing' ? 'Tidak Ada Pesanan Dimasak' : 
               'Belum Ada Pesanan Selesai'}
            </h3>
            <p className="text-stone-500 mt-2 max-w-md">
              {activeTab === 'pending' ? 'Dapur sedang kosong. Bersiaplah untuk pesanan berikutnya!' : 
               activeTab === 'processing' ? 'Pilih pesanan baru dari tab "Baru Masuk" dan mulai memasak.' : 
               'Belum ada pesanan yang diselesaikan hari ini.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedTransactions.map((transaction) => {
              const isPending = transaction.fulfillment_status === 'pending';
              const start = new Date(transaction.created_at).getTime();
              const diffMins = Math.floor((new Date().getTime() - start) / 60000);
              const isUrgent = diffMins >= 15 && isPending;
              const dItems = getDisplayItems(transaction, activeTab);

              return (
                <Card 
                  key={transaction.id} 
                  className={`transition-all duration-200 hover:shadow-md cursor-pointer border flex flex-col ${
                    isUrgent ? 'border-red-300 ring-1 ring-red-100' : 'border-stone-200'
                  }`}
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  {/* Compact Card Header */}
                  <div className="px-4 py-3 flex justify-between items-center border-b border-stone-100 bg-stone-50/50 rounded-t-2xl">
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-bold text-stone-800 text-sm tracking-tight truncate">
                        {transaction.invoice_number}
                      </h3>
                      {(transaction.table_number || transaction.customer_name) && (
                        <p className="text-[10px] text-stone-500 font-medium truncate mt-0.5">
                          {transaction.table_number ? `Meja ${transaction.table_number}` : ''}
                          {transaction.table_number && transaction.customer_name ? ' • ' : ''}
                          {transaction.customer_name}
                        </p>
                      )}
                    </div>
                    {activeTab === 'ready' ? (
                      <Badge variant="green" className="text-[10px] px-2 py-0.5 shrink-0">Selesai</Badge>
                    ) : (
                      <Badge variant={isPending ? 'stone' : 'amber'} className="text-[10px] px-2 py-0.5 shrink-0">
                        {isPending ? 'Menunggu' : 'Dimasak'}
                      </Badge>
                    )}
                  </div>

                  {/* Compact Card Body */}
                  <div className="p-4 flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-stone-500">
                        <ShoppingBag className="h-4 w-4" />
                        <span className="text-sm font-medium">{totalItems(transaction, activeTab)} item</span>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-stone-400'}`}>
                        <Clock className="h-3 w-3" />
                        {getElapsedTime(transaction.created_at)}
                      </div>
                    </div>

                    {/* Preview first 2 items */}
                    <ul className="space-y-1.5">
                      {dItems.slice(0, 2).map((item) => (
                        <li key={item.id} className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-stone-600 bg-stone-100 rounded px-1.5 py-0.5 text-xs min-w-[24px] text-center">{item.quantity}</span>
                          <span className="text-stone-700 truncate">{item.product_name}</span>
                        </li>
                      ))}
                      {dItems.length > 2 && (
                        <li className="text-xs text-stone-400 pl-1">
                          +{dItems.length - 2} item lainnya...
                        </li>
                      )}
                    </ul>

                    {transaction.notes && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 truncate">
                        📝 {transaction.notes}
                      </p>
                    )}

                    {isUrgent && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">⚠ Urgent</span>
                    )}
                  </div>

                  {/* Compact Footer */}
                  <div className="px-4 pb-3 mt-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedTransaction(transaction); }}
                      className="w-full py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> Lihat Detail
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== DETAIL MODAL ===== */}
      {selectedTransaction && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedTransaction(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 pointer-events-auto flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-stone-100 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-stone-800">{selectedTransaction.invoice_number}</h2>
                  {(selectedTransaction.table_number || selectedTransaction.customer_name) && (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {selectedTransaction.table_number && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          Meja {selectedTransaction.table_number}
                        </span>
                      )}
                      {selectedTransaction.customer_name && (
                        <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                          Pelanggan: {selectedTransaction.customer_name}
                        </span>
                      )}
                    </div>
                  )}
                  <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-medium ${
                    (() => {
                      const s = new Date(selectedTransaction.created_at).getTime();
                      return (Math.floor((new Date().getTime() - s) / 60000) >= 15 && selectedTransaction.fulfillment_status === 'pending') ? 'text-red-600' : 'text-stone-500';
                    })()
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                    {getElapsedTime(selectedTransaction.created_at)}
                    {(() => {
                      const s = new Date(selectedTransaction.created_at).getTime();
                      const urgent = Math.floor((new Date().getTime() - s) / 60000) >= 15 && selectedTransaction.fulfillment_status === 'pending';
                      return urgent ? <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700">Urgent</span> : null;
                    })()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    selectedTransaction.fulfillment_status === 'pending' ? 'stone' : 
                    selectedTransaction.fulfillment_status === 'processing' ? 'amber' : 'green'
                  }>
                    {selectedTransaction.fulfillment_status === 'pending' ? 'Menunggu' : 
                     selectedTransaction.fulfillment_status === 'processing' ? 'Dimasak' : 'Selesai'}
                  </Badge>
                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto flex-1 min-h-0 p-5">
                {(() => {
                  const isProcessing = activeTab === 'processing' && selectedTransaction.fulfillment_status === 'processing';
                  const displayItems = getDisplayItems(selectedTransaction, activeTab);
                  const checked = checkedItems[selectedTransaction.id] ?? new Set<number>();
                  const checkedCount = checked.size;

                  return (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                          Daftar Pesanan ({totalItems(selectedTransaction, activeTab)} item)
                        </h4>
                        {isProcessing && displayItems.length > 0 && (
                          <span className="text-xs font-medium text-stone-500">
                            {checkedCount}/{displayItems.length} selesai
                          </span>
                        )}
                      </div>

                      {/* Progress bar for processing */}
                      {isProcessing && displayItems.length > 0 && (
                        <div className="w-full h-1.5 bg-stone-100 rounded-full mb-3 overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(checkedCount / displayItems.length) * 100}%` }}
                          />
                        </div>
                      )}

                      <ul className="divide-y divide-stone-100 bg-stone-50 rounded-xl border border-stone-100">
                        {displayItems.map((item) => {
                          const isChecked = isProcessing && checked.has(item.id);
                          return (
                            <li 
                              key={item.id} 
                              className={`px-4 py-3 flex items-center gap-3 transition-colors ${
                                isChecked ? 'bg-green-50/80' : ''
                              } ${isProcessing ? 'cursor-pointer hover:bg-stone-100/50' : ''}`}
                              onClick={() => isProcessing && toggleItemCheck(selectedTransaction.id, item.id)}
                            >
                              {/* Checkbox for processing */}
                              {isProcessing && (
                                <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 shrink-0 transition-all duration-200 ${
                                  isChecked 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'bg-white border-stone-300'
                                }`}>
                                  {isChecked && <Check className="h-3.5 w-3.5" />}
                                </div>
                              )}

                              <div className="flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-white border border-stone-200 text-sm font-bold text-stone-700 shadow-sm">
                                {item.quantity}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium leading-snug transition-all ${
                                  isChecked ? 'text-green-700 line-through opacity-60' : 'text-stone-800'
                                }`}>
                                  {item.product_name}
                                </p>
                              </div>
                              {isChecked && (
                                <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full shrink-0">Siap</span>
                              )}
                              {activeTab === 'ready' && (
                                <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full shrink-0">Dikirim</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  );
                })()}

                {selectedTransaction.notes && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm">
                    <span className="font-semibold text-amber-800 flex items-center gap-1.5 mb-1">
                      <ChefHat className="w-3.5 h-3.5" /> Catatan Khusus:
                    </span>
                    <p className="text-amber-700/90 leading-relaxed">{selectedTransaction.notes}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer - Actions */}
              {selectedTransaction.fulfillment_status === 'pending' && (
                <div className="p-5 border-t border-stone-100 shrink-0">
                  <Button 
                    variant="secondary"
                    className="w-full font-semibold shadow-sm border-stone-200 hover:border-stone-300 hover:bg-stone-100 text-stone-700" 
                    onClick={() => handleUpdateStatus(selectedTransaction.id, 'processing')}
                    loading={processingId === selectedTransaction.id}
                  >
                    <PlayCircle className="h-4 w-4 mr-2 text-stone-500" /> Mulai Memasak
                  </Button>
                </div>
              )}

              {activeTab === 'processing' && selectedTransaction.fulfillment_status === 'processing' && (
                <div className="p-5 border-t border-stone-100 shrink-0 space-y-2">
                  {(() => {
                    const displayItems = getDisplayItems(selectedTransaction, 'processing');
                    const checked = checkedItems[selectedTransaction.id] ?? new Set<number>();
                    const checkedCount = checked.size;
                    const hasChecked = checkedCount > 0;
                    const allChecked = displayItems.length > 0 && checkedCount === displayItems.length;
                    
                    return (
                      <>
                        {hasChecked && !allChecked && (
                          <Button 
                            className="w-full font-semibold shadow-sm bg-blue-500 hover:bg-blue-600 text-white border-none" 
                            onClick={() => handleUpdateItems(selectedTransaction.id)}
                            loading={processingId === selectedTransaction.id}
                          >
                            <Send className="h-4 w-4 mr-2" /> Bisa Dikirim ({checkedCount}/{displayItems.length} siap)
                          </Button>
                        )}
                        <Button 
                          className={`w-full font-semibold shadow-sm border-none ${
                            allChecked 
                              ? 'bg-green-500 hover:bg-green-600 text-white' 
                              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          }`}
                          onClick={() => allChecked && handleUpdateItems(selectedTransaction.id)}
                          loading={processingId === selectedTransaction.id}
                          disabled={!allChecked}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" /> 
                          {allChecked ? 'Pesanan Selesai — Kirim!' : `Semua Selesai (Ceklis semua menu)`}
                        </Button>
                        <p className="text-[11px] text-stone-400 text-center pt-1">
                          💡 Sebagian item dapat dikirim duluan, atau ceklis semua untuk menyelesaikan sisa pesanan.
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}

              {activeTab === 'ready' && (
                <div className="p-5 border-t border-green-100 shrink-0 flex items-center justify-center text-green-700 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Item Telah Dikirim
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
