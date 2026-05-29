import { useState } from 'react';
import { usePage, useForm, router } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layouts/AppLayout';
import { Card, CardBody } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Alert } from '@/Components/UI/Alert';
import { Shield, ChefHat, TrendingUp, Users, ShoppingCart, Package, Tags, ClipboardList, Percent, MessageCircle, Utensils } from 'lucide-react';

interface SettingsProps {
  settings: {
    store_name: string;
    store_address: string;
    store_phone: string;
    tax_rate: number;
    discount_rate: number;
    receipt_header: string;
    receipt_footer: string;
    print_logo: boolean;
    paper_size: string;
    store_logo?: string;
    store_icon?: string;
    theme_color?: string;
  };
  featureSettings: {
    feature_pos: boolean;
    feature_kitchen: boolean;
    feature_products: boolean;
    feature_categories: boolean;
    feature_transactions: boolean;
    feature_reports: boolean;
    feature_users_management: boolean;
    feature_discount_tax: boolean;
    feature_whatsapp: boolean;
    feature_order_type: boolean;
  };
  auth: {
    user: {
      role: string;
    };
  };
  flash?: {
    success?: string;
  };
  [key: string]: unknown;
}

export default function SettingsIndex() {
  const { settings, featureSettings, auth, flash } = usePage<SettingsProps>().props;
  const userRole = typeof auth.user.role === 'object' ? (auth.user.role as any).value : auth.user.role;
  const isSuperAdmin = userRole === 'super_admin';
  const [activeTab, setActiveTab] = useState<'profil' | 'kontak' | 'sistem' | 'tampilan' | 'fitur'>(isSuperAdmin ? 'fitur' : 'profil');

  const { data, setData, post, processing, errors } = useForm({
    _method: 'patch',
    store_name: settings.store_name || '',
    store_address: settings.store_address || '',
    store_phone: settings.store_phone || '',
    tax_rate: settings.tax_rate?.toString() || '0',
    discount_rate: settings.discount_rate?.toString() || '0',
    receipt_header: settings.receipt_header || '',
    receipt_footer: settings.receipt_footer || '',
    print_logo: settings.print_logo ?? true,
    paper_size: settings.paper_size || '80',
    store_logo: null as File | null,
    store_icon: null as File | null,
    theme_color: settings.theme_color || 'green',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/settings', {
      preserveScroll: true,
      forceFormData: true,
    });
  };

  return (
    <AppLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Pengaturan</h1>
          <p className="text-sm text-stone-500">Konfigurasi aplikasi GreenPOS</p>
        </div>

        {/* Success */}
        {flash?.success && <Alert type="success">{flash.success}</Alert>}

        {/* Tabs Navigation */}
        <div className="flex space-x-1 rounded-xl bg-stone-200/50 p-1 backdrop-blur-sm">
          {[
            ...(isSuperAdmin ? [{ id: 'fitur', label: '🛡️ Fitur Sistem' }] : []),
            { id: 'profil', label: 'Profil Toko' },
            { id: 'kontak', label: 'Kontak & Lokasi' },
            { id: 'sistem', label: 'Keuangan & Struk' },
            { id: 'tampilan', label: 'Tampilan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Form */}
        <Card>
          <CardBody className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Tab Profil */}
              <div className={activeTab === 'profil' ? 'block space-y-6' : 'hidden'}>
                <Input
                  label="Nama Toko"
                  value={data.store_name}
                  onChange={(e) => setData('store_name', e.target.value)}
                  placeholder="Masukkan nama toko"
                  error={errors.store_name}
                />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-stone-700">Logo Utama (Sidebar Terbuka)</label>
                  <p className="text-xs text-stone-500 mb-1">Mendukung rasio persegi panjang (horizontal).</p>
                  <div className="flex items-center gap-4">
                    {(data.store_logo || settings.store_logo) && (
                      <div className="h-16 w-32 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center shadow-sm shrink-0">
                        <img 
                          src={data.store_logo ? URL.createObjectURL(data.store_logo) : `/storage/${settings.store_logo}`} 
                          alt="Logo Preview" 
                          className="h-full w-full object-contain p-2" 
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                      onChange={(e) => setData('store_logo', e.target.files?.[0] || null)}
                      className="block w-full text-sm text-stone-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100 transition-colors"
                    />
                  </div>
                  {errors.store_logo && <p className="text-xs text-red-600 mt-1">{errors.store_logo}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-stone-700">Ikon Aplikasi (Sidebar Tertutup)</label>
                  <p className="text-xs text-stone-500 mb-1">Harus rasio 1:1 (persegi).</p>
                  <div className="flex items-center gap-4">
                    {(data.store_icon || settings.store_icon) && (
                      <div className="h-16 w-16 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center shadow-sm shrink-0">
                        <img 
                          src={data.store_icon ? URL.createObjectURL(data.store_icon) : `/storage/${settings.store_icon}`} 
                          alt="Icon Preview" 
                          className="h-full w-full object-contain p-2" 
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                      onChange={(e) => setData('store_icon', e.target.files?.[0] || null)}
                      className="block w-full text-sm text-stone-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100 transition-colors"
                    />
                  </div>
                  {errors.store_icon && <p className="text-xs text-red-600 mt-1">{errors.store_icon}</p>}
                </div>
              </div>
              </div>

              {/* Tab Kontak */}
              <div className={activeTab === 'kontak' ? 'block space-y-6' : 'hidden'}>
                <Input
                  label="Nomor Telepon"
                  value={data.store_phone}
                  onChange={(e) => setData('store_phone', e.target.value)}
                  placeholder="Masukkan nomor telepon"
                  error={errors.store_phone}
                />
                <Input
                  label="Alamat Toko"
                  value={data.store_address}
                  onChange={(e) => setData('store_address', e.target.value)}
                  placeholder="Masukkan alamat toko lengkap"
                  error={errors.store_address}
                />
              </div>

              {/* Tab Sistem */}
              <div className={activeTab === 'sistem' ? 'block space-y-6' : 'hidden'}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Diskon Bawaan (%)"
                    type="number"
                    value={data.discount_rate}
                    onChange={(e) => setData('discount_rate', e.target.value)}
                    placeholder="0"
                    hint="Diskon otomatis untuk setiap transaksi"
                    error={errors.discount_rate}
                  />
                  <Input
                    label="Tarif Pajak (%)"
                    type="number"
                    value={data.tax_rate}
                    onChange={(e) => setData('tax_rate', e.target.value)}
                    placeholder="0"
                    hint="Masukkan 0 jika tidak ada pajak"
                    error={errors.tax_rate}
                  />
                </div>
                
                <hr className="border-stone-100 my-6" />
                <h3 className="text-base font-semibold text-stone-800 mb-4">Pengaturan Struk Kasir</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-stone-700">Tampilkan Logo Toko</label>
                    <p className="text-xs text-stone-500 mb-1">Cetak logo di bagian paling atas struk.</p>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={data.print_logo}
                        onChange={(e) => setData('print_logo', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      <span className="ml-3 text-sm font-medium text-stone-700">
                        {data.print_logo ? 'Ya, tampilkan' : 'Sembunyikan'}
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-stone-700">Ukuran Kertas Printer</label>
                    <p className="text-xs text-stone-500 mb-1">Sesuaikan dengan jenis printer thermal Anda.</p>
                    <select
                      value={data.paper_size}
                      onChange={(e) => setData('paper_size', e.target.value)}
                      className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                    >
                      <option value="80">80mm (Standar Besar)</option>
                      <option value="58">58mm (Mungil / Portable)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-4">
                  <label className="text-sm font-medium text-stone-700">Header Struk</label>
                  <p className="text-xs text-stone-500 mb-1">Pesan sambutan di bagian atas (di bawah nama toko).</p>
                  <textarea
                    value={data.receipt_header}
                    onChange={(e) => setData('receipt_header', e.target.value)}
                    rows={2}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                    placeholder="Contoh: Belanja Puas, Harga Pas!"
                  />
                  {errors.receipt_header && <p className="text-xs text-red-600 mt-1">{errors.receipt_header}</p>}
                </div>

                <div className="flex flex-col gap-1 mt-4">
                  <label className="text-sm font-medium text-stone-700">Footer Struk</label>
                  <p className="text-xs text-stone-500 mb-1">Pesan terima kasih di bagian paling bawah struk.</p>
                  <textarea
                    value={data.receipt_footer}
                    onChange={(e) => setData('receipt_footer', e.target.value)}
                    rows={3}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                    placeholder="Terima kasih atas kunjungan Anda!"
                  />
                  {errors.receipt_footer && <p className="text-xs text-red-600 mt-1">{errors.receipt_footer}</p>}
                </div>
              </div>

              {/* Tab Tampilan */}
              <div className={activeTab === 'tampilan' ? 'block space-y-6' : 'hidden'}>
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-stone-700">Tema Warna Utama</label>
                  <p className="text-xs text-stone-500">Pilih warna dominan untuk tombol, sidebar, dan aksen aplikasi.</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {[
                      { id: 'green', color: 'bg-[#22c55e]' },
                      { id: 'blue', color: 'bg-[#3b82f6]' },
                      { id: 'violet', color: 'bg-[#8b5cf6]' },
                      { id: 'rose', color: 'bg-[#f43f5e]' },
                      { id: 'orange', color: 'bg-[#f97316]' },
                      { id: 'teal', color: 'bg-[#14b8a6]' },
                      { id: 'slate', color: 'bg-[#64748b]' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setData('theme_color', theme.id)}
                        className={`relative h-12 w-12 rounded-full shadow-sm transition-all duration-200 hover:scale-110 ${theme.color} ${
                          data.theme_color === theme.id ? 'ring-4 ring-offset-2 ring-stone-300 scale-110' : 'ring-1 ring-stone-200'
                        }`}
                        title={`Tema ${theme.id}`}
                      >
                        {data.theme_color === theme.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-white opacity-90"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.theme_color && <p className="text-xs text-red-600 mt-1">{errors.theme_color}</p>}
                </div>
              </div>

              {/* Submit Button for regular settings */}
              {activeTab !== 'fitur' && (
                <div className="flex justify-end pt-6 border-t border-stone-100 mt-8">
                  <Button type="submit" loading={processing}>
                    Simpan Pengaturan
                  </Button>
                </div>
              )}
            </form>

            {/* ===== SUPER ADMIN: Feature Toggle Tab ===== */}
            {isSuperAdmin && activeTab === 'fitur' && (
              <FeatureToggleSection featureSettings={featureSettings} />
            )}
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}

/* ===== Feature Toggle Section Component ===== */
function FeatureToggleSection({ featureSettings }: { featureSettings: SettingsProps['featureSettings'] }) {
  const [features, setFeatures] = useState({
    feature_pos: featureSettings.feature_pos,
    feature_kitchen: featureSettings.feature_kitchen,
    feature_products: featureSettings.feature_products,
    feature_categories: featureSettings.feature_categories,
    feature_transactions: featureSettings.feature_transactions,
    feature_reports: featureSettings.feature_reports,
    feature_users_management: featureSettings.feature_users_management,
    feature_discount_tax: featureSettings.feature_discount_tax,
    feature_whatsapp: featureSettings.feature_whatsapp,
    feature_order_type: featureSettings.feature_order_type,
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveFeatures = () => {
    setSaving(true);
    router.patch('/settings/features', features, {
      preserveScroll: true,
      onFinish: () => setSaving(false),
    });
  };

  const featureItems = [
    {
      key: 'feature_pos' as const,
      label: 'Fitur Kasir (POS)',
      description: 'Aktifkan halaman kasir utama untuk melakukan transaksi penjualan.',
      icon: ShoppingCart, // Need to import ShoppingCart and others
      color: 'blue',
    },
    {
      key: 'feature_kitchen' as const,
      label: 'Fitur Dapur (KDS)',
      description: 'Aktifkan sistem layar dapur untuk mengelola antrean pesanan secara real-time.',
      icon: ChefHat,
      color: 'amber',
    },
    {
      key: 'feature_products' as const,
      label: 'Manajemen Produk',
      description: 'Aktifkan halaman untuk mengelola daftar produk.',
      icon: Package,
      color: 'emerald',
    },
    {
      key: 'feature_categories' as const,
      label: 'Manajemen Kategori',
      description: 'Aktifkan halaman untuk mengelola kategori produk.',
      icon: Tags,
      color: 'violet',
    },
    {
      key: 'feature_transactions' as const,
      label: 'Riwayat Transaksi',
      description: 'Aktifkan halaman untuk melihat riwayat dan detail transaksi.',
      icon: ClipboardList,
      color: 'slate',
    },
    {
      key: 'feature_reports' as const,
      label: 'Fitur Laporan',
      description: 'Aktifkan halaman laporan penjualan dan ekspor data.',
      icon: TrendingUp,
      color: 'indigo',
    },
    {
      key: 'feature_users_management' as const,
      label: 'Manajemen Pengguna',
      description: 'Aktifkan halaman untuk menambah, mengubah, dan menghapus akun pengguna.',
      icon: Users,
      color: 'green',
    },
    {
      key: 'feature_discount_tax' as const,
      label: 'Diskon & Pajak (PPN)',
      description: 'Aktifkan perhitungan diskon dan pajak otomatis pada setiap transaksi kasir.',
      icon: Percent,
      color: 'rose',
    },
    {
      key: 'feature_whatsapp' as const,
      label: 'Kirim Struk via WhatsApp',
      description: 'Aktifkan pengiriman pesan terima kasih dan ringkasan transaksi ke WhatsApp pelanggan.',
      icon: MessageCircle,
      color: 'teal',
    },
    {
      key: 'feature_order_type' as const,
      label: 'Tipe Pesanan (Dine-in / Take-away)',
      description: 'Aktifkan pilihan tipe pesanan dine-in atau take-away saat pembayaran.',
      icon: Utensils,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
        <div className="p-2 rounded-xl bg-purple-100">
          <Shield className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-800">Kontrol Fitur Sistem</h3>
          <p className="text-xs text-stone-500">Aktifkan atau nonaktifkan fitur untuk seluruh pengguna toko ini.</p>
        </div>
      </div>

      <div className="space-y-4">
        {featureItems.map((item) => {
          const isEnabled = features[item.key];
          const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
            amber: { bg: 'bg-amber-100', text: 'text-amber-600', ring: 'ring-amber-200' },
            blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200' },
            green: { bg: 'bg-green-100', text: 'text-green-600', ring: 'ring-green-200' },
            emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-200' },
            violet: { bg: 'bg-violet-100', text: 'text-violet-600', ring: 'ring-violet-200' },
            slate: { bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-200' },
            indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', ring: 'ring-indigo-200' },
            rose: { bg: 'bg-rose-100', text: 'text-rose-600', ring: 'ring-rose-200' },
            teal: { bg: 'bg-teal-100', text: 'text-teal-600', ring: 'ring-teal-200' },
            orange: { bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-200' },
          };
          const colors = colorMap[item.color] || colorMap.green;

          return (
            <div
              key={item.key}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                isEnabled
                  ? `border-stone-200 bg-white shadow-sm`
                  : 'border-stone-100 bg-stone-50 opacity-70'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${colors.bg} shrink-0`}>
                <item.icon className={`h-5 w-5 ${colors.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800">{item.label}</p>
                <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isEnabled}
                  onChange={() => handleToggle(item.key)}
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-6 border-t border-stone-100 mt-4">
        <Button onClick={handleSaveFeatures} loading={saving}>
          Simpan Pengaturan Fitur
        </Button>
      </div>
    </div>
  );
}