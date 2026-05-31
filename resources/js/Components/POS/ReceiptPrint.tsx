import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // Paper size config
  const is58mm = app_settings?.paper_size === '58';
  // Printable area: 58mm paper = ~48mm printable, 80mm paper = ~72mm printable
  const paperWidthMm = is58mm ? '58mm' : '80mm';
  const printableWidthMm = is58mm ? '48mm' : '72mm';

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
      const engineUrl = app_settings?.wa_engine_url || 'http://127.0.0.1:3001';
      const res = await fetch(`${engineUrl}/api/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'text/plain',
        },
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
      console.error('[WA] Detailed Error:', err);
      console.warn('[WA] Gateway tidak tersedia, fallback ke wa.me:', err?.message);
    }

    // Fallback: buka WhatsApp Web
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    setWaFeedback('idle');
    setWaSending(false);
  };

  // Font sizes — diperbesar agar terlihat jelas di printer thermal 58mm/80mm
  const fs = {
    storeName: is58mm ? '16px' : '20px',
    address:   is58mm ? '11px' : '12px',
    header:    is58mm ? '10px' : '11px',
    invoice:   is58mm ? '12px' : '13px',
    timestamp: is58mm ? '10px' : '11px',
    badge:     is58mm ? '10px' : '11px',
    itemName:  is58mm ? '12px' : '13px',
    itemQty:   is58mm ? '11px' : '12px',
    label:     is58mm ? '11px' : '12px',
    value:     is58mm ? '11px' : '12px',
    total:     is58mm ? '14px' : '16px',
    footer:    is58mm ? '10px' : '11px',
  };

  const pad = is58mm ? '3mm' : '4mm';

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Dynamic print styles — optimized for thermal printer */}
      <style>{`
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: ${paperWidthMm} !important;
          }
          body > *:not(#receipt-print-portal) { display: none !important; }
          #receipt-print-portal {
            display: block !important;
            position: static !important;
            width: ${paperWidthMm} !important;
          }
          #receipt-print-portal * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
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

      {/* Hidden portal for printing only — uses mm units to match thermal paper exactly */}
      {mounted && typeof document !== 'undefined' ? createPortal(
        <div id="receipt-print-portal">
          <div style={{
            width: printableWidthMm,
            maxWidth: paperWidthMm,
            fontFamily: "'Courier New', Courier, monospace",
            backgroundColor: '#fff',
            color: '#000',
            padding: pad,
            boxSizing: 'border-box',
            position: 'relative',
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
              color: 'rgba(34, 197, 94, 0.10)',
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
        </div>,
        document.body
      ) : null}

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
              maxWidth: is58mm ? '35mm' : '50mm', 
              height: 'auto', 
              maxHeight: is58mm ? '15mm' : '20mm', 
              objectFit: 'contain', 
              margin: '0 auto 8px', 
              display: 'block', 
              filter: 'grayscale(1) contrast(1.3)' 
            }}
          />
        )}
        <div style={{ fontSize: fs.storeName, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#000' }}>
          {displayStoreName}
        </div>
        {displayAddress && (
          <div style={{ fontSize: fs.address, color: '#333', marginTop: '2px', lineHeight: 1.4 }}>
            {displayAddress}
          </div>
        )}
        {app_settings?.receipt_header && (
          <div style={{ fontSize: fs.header, fontWeight: 600, marginTop: '4px', whiteSpace: 'pre-wrap', color: '#333' }}>
            {app_settings.receipt_header}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '2px dashed #000', borderBottom: '2px dashed #000', padding: '6px 0', textAlign: 'center', margin: '10px 0' }}>
        <div style={{ fontSize: fs.invoice, fontWeight: 800, letterSpacing: '0.06em', color: '#000' }}>{transaction.invoice_number}</div>
        <div style={{ display: 'inline-block', padding: '2px 0', fontSize: fs.badge, fontWeight: 800, marginTop: '4px', letterSpacing: '0.05em', color: '#000' }}>
          {transaction.order_type === 'take_away' ? 'TAKE-AWAY' : 'DINE-IN'}
        </div>
        <div style={{ fontSize: fs.timestamp, color: '#333', marginTop: '4px', fontWeight: 600 }}>{formatTanggalWaktu(transaction.created_at)}</div>
        {(transaction.customer_name || transaction.table_number) && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            {transaction.customer_name && (
              <span style={{ fontSize: fs.badge, fontWeight: 700, color: '#000' }}>
                {transaction.customer_name}
              </span>
            )}
            {transaction.customer_name && transaction.table_number && (
              <span style={{ fontSize: fs.badge, color: '#555' }}>|</span>
            )}
            {transaction.table_number && (
              <span style={{ fontSize: fs.badge, fontWeight: 700, color: '#000' }}>
                Meja {transaction.table_number}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{ marginBottom: '8px' }}>
        {transaction.items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <div style={{ flex: 1, paddingRight: '6px' }}>
              <div style={{ fontSize: fs.itemName, fontWeight: 800, color: '#000' }}>{item.product_name}</div>
              <div style={{ fontSize: fs.itemQty, color: '#333', fontWeight: 600 }}>
                {item.quantity} x {formatRupiah(item.product_price)}
              </div>
            </div>
            <div style={{ fontSize: fs.itemName, fontWeight: 800, whiteSpace: 'nowrap', color: '#000' }}>
              {formatRupiah(item.subtotal)}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ borderTop: '1.5px dashed #000', paddingTop: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, color: '#333', marginBottom: '3px', fontWeight: 600 }}>
          <span>Subtotal</span><span style={{ color: '#000' }}>{formatRupiah(transaction.subtotal)}</span>
        </div>
        {transaction.discount_amount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, marginBottom: '3px', fontWeight: 600, color: '#333' }}>
            <span>Diskon</span><span>-{formatRupiah(transaction.discount_amount)}</span>
          </div>
        )}
        {transaction.tax_amount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, color: '#333', marginBottom: '3px', fontWeight: 600 }}>
            <span>Pajak</span><span style={{ color: '#000' }}>{formatRupiah(transaction.tax_amount)}</span>
          </div>
        )}
        {/* TOTAL bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.total, fontWeight: 900, borderTop: '2px solid #000', marginTop: '4px', paddingTop: '5px', color: '#000' }}>
          <span>TOTAL</span><span>{formatRupiah(transaction.total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, borderTop: '1px dashed #000', marginTop: '5px', paddingTop: '5px', color: '#333', fontWeight: 600 }}>
          <span>Metode Bayar</span>
          <span style={{ fontWeight: 800, textTransform: 'uppercase', color: '#000' }}>{transaction.payment_method}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, marginTop: '3px', color: '#333', fontWeight: 600 }}>
          <span>Tunai/Bayar</span>
          <span style={{ color: '#000', fontWeight: 700 }}>{formatRupiah(Number(transaction.amount_paid))}</span>
        </div>
        {Number(transaction.change_amount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs.label, fontWeight: 800, marginTop: '3px', color: '#000' }}>
            <span>KEMBALI</span><span>{formatRupiah(Number(transaction.change_amount))}</span>
          </div>
        )}
      </div>

      {/* Pseudo Barcode / Invoice Number */}
      <div style={{ margin: '12px auto 8px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block', 
          height: is58mm ? '25px' : '35px', 
          width: '85%', 
          background: 'repeating-linear-gradient(to right, #000, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 5px, transparent 5px, transparent 8px, #000 8px, #000 11px, transparent 11px, transparent 13px, #000 13px, #000 14px, transparent 14px, transparent 17px)' 
        }} />
        <div style={{ fontSize: fs.header, marginTop: '3px', letterSpacing: '0.2em', fontWeight: 700, color: '#000' }}>
          {transaction.invoice_number}
        </div>
      </div>

      {/* Notes */}
      {transaction.notes && (
        <div style={{ borderTop: '1.5px dashed #000', marginTop: '8px', paddingTop: '6px', textAlign: 'center', fontSize: fs.footer, color: '#333', fontStyle: 'italic', fontWeight: 600 }}>
          "{transaction.notes}"
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '10px', textAlign: 'center', fontSize: fs.footer, color: '#555', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontWeight: 600 }}>
        {app_settings?.receipt_footer || 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar/dikembalikan.'}
      </div>

      {/* Bottom decorative line */}
      <div style={{ marginTop: '10px', borderTop: '1.5px dashed #000' }} />
    </>
  );
}