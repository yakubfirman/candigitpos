import { useRef, useState } from 'react';
import type { Transaction } from '@/Types/transaction';
import { formatRupiah } from '@/Utils/currency';
import { formatTanggalWaktu } from '@/Utils/date';
import { Button } from '@/Components/UI/Button';
import { Printer, MessageCircle, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { usePage } from '@inertiajs/react';

interface ReceiptPrintProps {
  transaction: Transaction;
  storeName?: string;
  storeAddress?: string;
  customerPhone?: string;
  waWindow?: Window | null;
  onClose?: () => void;
  showWhatsapp?: boolean;
}

export function ReceiptPrint({ transaction, storeName = 'GreenPOS', storeAddress = 'Jl. Contoh Alamat No. 123', customerPhone, waWindow: externalWaWindow, onClose, showWhatsapp = true }: ReceiptPrintProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { app_settings } = usePage<any>().props;

  // Paper width in pixels: 58mm ≈ 219px, 80mm ≈ 302px at 96dpi
  const is58mm = app_settings?.paper_size === '58';
  const paperWidthPx = is58mm ? 219 : 302;
  const paperWidthMm = is58mm ? '58mm' : '80mm';

  const handlePrint = () => {
    window.print();
  };

  const [waSending, setWaSending] = useState(false);
  const [waFeedback, setWaFeedback] = useState<'idle'|'sending'|'success'|'error'>('idle');

  const buildWaMessage = () => {
    const storeName = app_settings?.store_name || 'GreenPOS';
    const customerGreeting = transaction.customer_name ? `Halo *${transaction.customer_name}*, ` : 'Halo, ';

    return `${customerGreeting}terima kasih telah berbelanja di *${storeName}*! 🎉`;
  };

  const handleSendWA = async (phone?: string) => {
    if (!phone) return;
    const waNumber = phone.replace(/^0/, '62').replace(/\D/g, '');
    const message = buildWaMessage();

    setWaSending(true);
    setWaFeedback('sending');

    // Tangkap gambar struk menggunakan html2canvas
    let imageBase64 = null;
    const portal = document.getElementById('receipt-print-portal');
    if (portal) {
      try {
        portal.style.display = 'block';
        const canvas = await html2canvas(portal.firstElementChild as HTMLElement, { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#ffffff' 
        });
        imageBase64 = canvas.toDataURL('image/png');
        portal.style.display = 'none';
      } catch (e) {
        console.error("Gagal men-screenshot struk", e);
        portal.style.display = 'none';
      }
    }

    // Coba kirim via Gateway lokal terlebih dahulu
    try {
      const res = await fetch('http://localhost:3001/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waNumber, message, image: imageBase64 }),
        signal: AbortSignal.timeout(15000), // timeout 15 detik karena payload gambar lebih besar
      });
      const json = await res.json();
      if (json.success) {
        setWaFeedback('success');
        setTimeout(() => setWaFeedback('idle'), 3000);
        setWaSending(false);
        return; // Berhasil via gateway, selesai
      }
      throw new Error(json.error || 'Gateway error');
    } catch (err: any) {
      // Gateway tidak tersedia / error → fallback ke wa.me
      console.warn('[WA] Gateway tidak tersedia, fallback ke wa.me:', err?.message);
    }

    // Fallback: buka WhatsApp Web
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    setWaFeedback('idle');
    setWaSending(false);
  };



  // Font sizes (smaller for 58mm)
  const fs = {
    storeName: is58mm ? '13px' : '15px',
    address: is58mm ? '9px' : '10px',
    header: is58mm ? '8px' : '9px',
    invoice: is58mm ? '10px' : '11px',
    timestamp: is58mm ? '8px' : '9px',
    badge: is58mm ? '8px' : '9px',
    itemName: is58mm ? '10px' : '11px',
    itemQty: is58mm ? '9px' : '10px',
    label: is58mm ? '9px' : '10px',
    value: is58mm ? '9px' : '10px',
    total: is58mm ? '12px' : '14px',
    footer: is58mm ? '8px' : '9px',
  };

  const pad = is58mm ? '12px' : '16px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Dynamic print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #receipt-print-portal { display: block !important; }
          @page {
            size: ${paperWidthMm} auto;
            margin: 0;
          }
        }
        #receipt-print-portal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          background: white;
        }
      `}</style>

      {/* Hidden portal for printing only — exact paper width */}
      <div id="receipt-print-portal">
        <div style={{
          width: `${paperWidthPx}px`,
          fontFamily: "'Courier New', Courier, monospace",
          backgroundColor: '#fff',
          color: '#111',
          padding: pad,
          boxSizing: 'border-box',
          position: 'relative',
          borderBottom: '4px dashed #e5e7eb', // Efek struk robek di bawah
          margin: '0 auto',
        }}>
          {/* Watermark LUNAS */}
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-30deg)',
            fontSize: is58mm ? '48px' : '72px',
            fontWeight: 900,
            color: 'rgba(34, 197, 94, 0.10)', // Hijau sangat transparan
            border: is58mm ? '6px solid rgba(34, 197, 94, 0.10)' : '10px solid rgba(34, 197, 94, 0.10)',
            borderRadius: '16px',
            padding: '10px 20px',
            pointerEvents: 'none',
            zIndex: 0,
            letterSpacing: '0.1em'
          }}>
            LUNAS
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ReceiptContent
              transaction={transaction}
              storeName={storeName}
              storeAddress={storeAddress}
              app_settings={app_settings}
              fs={fs}
              is58mm={is58mm}
            />
          </div>
        </div>
      </div>

      {/* Success Card */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '1.5px solid #86efac',
        borderRadius: '12px',
        padding: '20px 16px',
        textAlign: 'center',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#15803d', marginBottom: '4px' }}>Transaksi Berhasil!</div>
        <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>{transaction.invoice_number}</div>
        <div style={{ fontSize: '22px', fontWeight: 900, color: '#15803d', marginTop: '8px' }}>
          {formatRupiah(transaction.total)}
        </div>
        {(transaction.customer_name || transaction.table_number) && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            {transaction.customer_name && (
              <span style={{ fontSize: '11px', background: '#bbf7d0', color: '#166534', fontWeight: 600 }}>
                {transaction.customer_name}
              </span>
            )}
            {transaction.table_number && (
              <span style={{ fontSize: '11px', background: '#bbf7d0', color: '#166534', fontWeight: 600 }}>
                Meja {transaction.table_number}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        <Button onClick={handlePrint} variant="primary" className="w-full flex justify-center items-center gap-2 h-11">
          <Printer className="h-4 w-4" /> Cetak Struk
        </Button>
        {showWhatsapp && customerPhone && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Button
              onClick={() => handleSendWA(customerPhone)}
              disabled={waSending}
              className="w-full flex justify-center items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white border-transparent h-11 disabled:opacity-60"
            >
              <MessageCircle className="h-4 w-4" />
              {waSending ? 'Mengirim...' : 'Kirim ke WhatsApp'}
            </Button>
            {waFeedback === 'success' && (
              <p style={{ fontSize: '12px', textAlign: 'center', color: '#15803d', fontWeight: 600 }}>✅ Struk berhasil terkirim via Gateway!</p>
            )}
          </div>
        )}
        {onClose && (
          <Button onClick={onClose} variant="secondary" className="w-full h-11">
            Transaksi Baru
          </Button>
        )}
      </div>
    </div>
  );
}

// Extracted inner receipt content (used both for print portal and preview)
function ReceiptContent({ transaction, storeName, storeAddress, app_settings, fs, is58mm }: {
  transaction: Transaction;
  storeName: string;
  storeAddress: string;
  app_settings: any;
  fs: Record<string, string>;
  is58mm: boolean;
}) {
  const displayStoreName = app_settings?.store_name || storeName;
  const displayAddress = app_settings?.store_address || storeAddress;

  return (
    <>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        {app_settings?.store_logo && (app_settings?.print_logo ?? true) && (
          <img
            src={`/storage/${app_settings.store_logo}`}
            alt="Logo"
            style={{ 
              width: 'auto', 
              maxWidth: is58mm ? '130px' : '180px', 
              height: 'auto', 
              maxHeight: is58mm ? '55px' : '70px', 
              objectFit: 'contain', 
              margin: '0 auto 10px', 
              display: 'block', 
              filter: 'grayscale(1) contrast(1.2)' 
            }}
          />
        )}
        <div style={{ fontSize: is58mm ? '15px' : '18px', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {displayStoreName}
        </div>
        {displayAddress && (
          <div style={{ fontSize: fs.address, color: '#555', marginTop: '2px', lineHeight: 1.4 }}>
            {displayAddress}
          </div>
        )}
        {app_settings?.receipt_header && (
          <div style={{ fontSize: fs.header, fontWeight: 600, marginTop: '4px', whiteSpace: 'pre-wrap' }}>
            {app_settings.receipt_header}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '2px dotted #555', borderBottom: '2px dotted #555', padding: '6px 0', textAlign: 'center', margin: '12px 0 10px' }}>
        <div style={{ fontSize: fs.invoice, fontWeight: 700, letterSpacing: '0.06em' }}>{transaction.invoice_number}</div>
        <div style={{ display: 'inline-block', padding: '2px 0', fontSize: fs.badge, fontWeight: 700, marginTop: '5px', letterSpacing: '0.05em' }}>
          {transaction.order_type === 'take_away' ? 'TAKE-AWAY' : 'DINE-IN'}
        </div>
        <div style={{ fontSize: fs.timestamp, color: '#666', marginTop: '6px' }}>{formatTanggalWaktu(transaction.created_at)}</div>
        {(transaction.customer_name || transaction.table_number) && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '5px', flexWrap: 'wrap' }}>
            {transaction.customer_name && (
              <span style={{ fontSize: fs.badge, fontWeight: 600 }}>
                {transaction.customer_name}
              </span>
            )}
            {transaction.customer_name && transaction.table_number && (
              <span style={{ fontSize: fs.badge, color: '#888' }}>|</span>
            )}
            {transaction.table_number && (
              <span style={{ fontSize: fs.badge, fontWeight: 600 }}>
                Meja {transaction.table_number}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{ marginBottom: '10px' }}>
        {transaction.items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <div style={{ flex: 1, paddingRight: '8px' }}>
              <div style={{ fontSize: fs.itemName, fontWeight: 700 }}>{item.product_name}</div>
              <div style={{ fontSize: fs.itemQty, color: '#555' }}>
                {item.quantity} x {formatRupiah(item.product_price)}
              </div>
            </div>
            <div style={{ fontSize: fs.itemName, fontWeight: 700, whiteSpace: 'nowrap' }}>
              {formatRupiah(item.subtotal)}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ borderTop: '1.5px dashed #aaa', paddingTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, color: '#555', marginBottom: '4px' }}>
          <span>Subtotal</span><span style={{ color: '#111' }}>{formatRupiah(transaction.subtotal)}</span>
        </div>
        {transaction.discount_amount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, marginBottom: '4px' }}>
            <span>Diskon</span><span>-{formatRupiah(transaction.discount_amount)}</span>
          </div>
        )}
        {transaction.tax_amount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, color: '#555', marginBottom: '4px' }}>
            <span>Pajak</span><span style={{ color: '#111' }}>{formatRupiah(transaction.tax_amount)}</span>
          </div>
        )}
        {/* TOTAL bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.total, fontWeight: 900, borderTop: '2px solid #111', marginTop: '6px', paddingTop: '6px' }}>
          <span>TOTAL</span><span>{formatRupiah(transaction.total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, borderTop: '1px solid #ddd', marginTop: '6px', paddingTop: '6px', color: '#555' }}>
          <span>Metode Bayar</span>
          <span style={{ fontWeight: 700, textTransform: 'uppercase', color: '#111' }}>{transaction.payment_method}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, marginTop: '4px', color: '#555' }}>
          <span>Tunai/Bayar</span>
          <span style={{ color: '#111', fontWeight: 600 }}>{formatRupiah(Number(transaction.amount_paid))}</span>
        </div>
        {Number(transaction.change_amount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, fontWeight: 700, marginTop: '4px' }}>
            <span>KEMBALI</span><span>{formatRupiah(Number(transaction.change_amount))}</span>
          </div>
        )}
      </div>

      {/* Pseudo Barcode / Invoice Number */}
      <div style={{ margin: '16px auto 10px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block', 
          height: is58mm ? '30px' : '40px', 
          width: '85%', 
          background: 'repeating-linear-gradient(to right, #111, #111 2px, transparent 2px, transparent 4px, #111 4px, #111 5px, transparent 5px, transparent 8px, #111 8px, #111 11px, transparent 11px, transparent 13px, #111 13px, #111 14px, transparent 14px, transparent 17px)' 
        }} />
        <div style={{ fontSize: fs.header, marginTop: '4px', letterSpacing: '0.25em', fontWeight: 600 }}>
          {transaction.invoice_number}
        </div>
      </div>

      {/* Notes */}
      {transaction.notes && (
        <div style={{ borderTop: '1.5px dashed #aaa', marginTop: '10px', paddingTop: '8px', textAlign: 'center', fontSize: fs.footer, color: '#666', fontStyle: 'italic' }}>
          "{transaction.notes}"
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '12px', textAlign: 'center', fontSize: fs.footer, color: '#888', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
        {app_settings?.receipt_footer || 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar/dikembalikan.'}
      </div>

      {/* Bottom decorative line */}
      <div style={{ marginTop: '12px', borderTop: '1.5px dashed #aaa' }} />
    </>
  );
}