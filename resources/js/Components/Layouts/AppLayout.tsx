import { ReactNode, useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { LayoutDashboard, ShoppingCart, Package, Tags, ClipboardList, TrendingUp, Settings, Leaf, Menu, LogOut, Users, ChefHat } from 'lucide-react';
import { cn } from '@/Utils/cn';
import { generateThemeVariables, ThemeColor } from '@/Utils/theme';
import type { User } from '@/Types/user';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'super_admin', 'kasir'] },
  { href: '/pos', label: 'Kasir', icon: ShoppingCart, roles: ['admin', 'super_admin', 'kasir'], feature: 'feature_pos' },
  { href: '/kitchen', label: 'Dapur (KDS)', icon: ChefHat, roles: ['admin', 'super_admin', 'dapur'], feature: 'feature_kitchen' },
  { href: '/products', label: 'Produk', icon: Package, roles: ['admin', 'super_admin', 'kasir'], feature: 'feature_products' },
  { href: '/categories', label: 'Kategori', icon: Tags, roles: ['admin', 'super_admin', 'kasir'], feature: 'feature_categories' },
  { href: '/transactions', label: 'Transaksi', icon: ClipboardList, roles: ['admin', 'super_admin', 'kasir'], feature: 'feature_transactions' },
  { href: '/reports', label: 'Laporan', icon: TrendingUp, roles: ['admin', 'super_admin'], feature: 'feature_reports' },
  { href: '/users', label: 'Pengguna', icon: Users, roles: ['admin', 'super_admin'], feature: 'feature_users_management' },
  { href: '/settings', label: 'Pengaturan', icon: Settings, roles: ['admin', 'super_admin'] },
];

interface PageProps {
  auth: { user: User };
  app_settings?: {
    store_logo?: string;
    store_icon?: string;
    store_name?: string;
    theme_color?: string;
  };
  feature_settings?: {
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
  ziggy: { to: string };
  [key: string]: unknown;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { auth, app_settings, feature_settings } = usePage<PageProps>().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    // Ambil preferensi dari localStorage jika ada
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });
  
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(desktopCollapsed));
  }, [desktopCollapsed]);

  // Reactive Title & Favicon Updates
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const storeName = app_settings?.store_name || 'GreenPOS';
      
      // Deteksi nama halaman berdasarkan URL
      const path = window.location.pathname;
      const basePath = '/' + path.split('/')[1];
      const pageMap: Record<string, string> = {
        '/dashboard': 'Dashboard',
        '/pos': 'Kasir',
        '/kitchen': 'Dapur',
        '/products': 'Produk',
        '/categories': 'Kategori',
        '/transactions': 'Transaksi',
        '/reports': 'Laporan',
        '/users': 'Pengguna',
        '/settings': 'Pengaturan',
      };
      
      let pageName = pageMap[basePath] || '';
      if (path.includes('/create')) pageName = `Tambah ${pageName}`;
      else if (path.includes('/edit')) pageName = `Edit ${pageName}`;
      else if (path.split('/').length > 2 && basePath === '/transactions') pageName = 'Detail Transaksi';

      // Set page title
      document.title = pageName ? `${pageName} - ${storeName}` : storeName;

      const favicon = document.getElementById('favicon') as HTMLLinkElement;
      if (favicon) {
        if (app_settings?.store_icon) {
          favicon.href = `/storage/${app_settings.store_icon}`;
        } else {
          favicon.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍃</text></svg>";
        }
      }
    }
  }, [app_settings?.store_name, app_settings?.store_icon]);

  const userRole = auth.user.role as string;
  const isSuperAdmin = userRole === 'super_admin';

  const visibleNav = navItems.filter((item) => {
    // Check role access
    if (!item.roles.includes(userRole)) return false;
    // Check feature toggle (super_admin always sees everything)
    if ((item as any).feature && !isSuperAdmin) {
      const featureKey = (item as any).feature as keyof typeof feature_settings;
      if (feature_settings && !feature_settings[featureKey]) return false;
    }
    return true;
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') return currentPath === '/dashboard' || currentPath === '/';
    return currentPath.startsWith(href);
  };

  const handleLogout = () => {
    router.post('/logout');
  };

  const isDapur = userRole === 'dapur';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root {\n${generateThemeVariables((app_settings?.theme_color as ThemeColor) || 'green')}\n}` }} />
      <div className="min-h-screen bg-stone-50 font-sans text-stone-800 selection:bg-green-200">
        {/* Mobile overlay */}
      {!isDapur && sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-stone-900/40 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      {!isDapur && (
        <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex-col bg-white border-r border-stone-200/80 shadow-sm',
          'flex transition-all duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          desktopCollapsed ? 'lg:w-20 w-64' : 'w-64'
        )}
      >
        <div className={cn("flex h-16 items-center justify-center border-b border-stone-100", !desktopCollapsed ? "px-6" : "")}>
          {(() => {
            const hasIcon = !!app_settings?.store_icon;
            const hasLogo = !!app_settings?.store_logo;
            
            // Mode Tertutup (Collapsed): Tampilkan Icon jika ada, jika tidak ada fallback ke Logo, lalu Daun
            if (desktopCollapsed) {
              if (hasIcon) return (
                <div className="flex items-center justify-center rounded-lg overflow-hidden shrink-0 h-10 w-10">
                  <img src={`/storage/${app_settings.store_icon}`} alt="Icon" className="h-full w-full object-contain" />
                </div>
              );
              if (hasLogo) return (
                <div className="flex items-center justify-center rounded-lg overflow-hidden shrink-0 h-10 w-10">
                  <img src={`/storage/${app_settings.store_logo}`} alt="Logo" className="h-full w-full object-contain" />
                </div>
              );
            }
            
            // Mode Terbuka (Expanded): Tampilkan Logo Utama full width
            if (!desktopCollapsed && hasLogo) {
              return (
                <div className="flex items-center justify-center rounded-lg overflow-hidden shrink-0 h-10 w-full max-w-[160px]">
                  <img src={`/storage/${app_settings.store_logo}`} alt="Logo" className="h-full w-full object-contain" />
                </div>
              );
            }

            // Fallback Ikon Daun (Leaf) Default
            return (
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg shadow-sm shrink-0">
                <Leaf className="h-6 w-6 text-white transition-transform duration-300 hover:scale-110" />
              </div>
            );
          })()}
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 scrollbar-hide">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={desktopCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-xl py-2.5 transition-all duration-300 group relative',
                desktopCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'px-3 gap-3',
                isActive(item.href)
                  ? 'bg-gradient-to-r from-green-50 to-green-100/30 font-semibold text-green-700 shadow-sm ring-1 ring-green-600/10'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800 font-medium hover:shadow-sm'
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-all duration-300 group-hover:scale-110 flex-shrink-0", isActive(item.href) ? "text-green-600 drop-shadow-sm" : "group-hover:text-stone-800")} />
              <span className={cn("whitespace-nowrap transition-transform duration-300", !isActive(item.href) && "group-hover:translate-x-0.5", desktopCollapsed && "lg:hidden")}>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={cn("border-t border-stone-50 p-4 transition-all duration-300 flex flex-col items-center justify-center opacity-50 hover:opacity-100", desktopCollapsed ? "lg:px-2 px-4" : "px-4")}>
          <p className={cn("text-[11px] text-stone-400 whitespace-nowrap", desktopCollapsed && "lg:hidden")}>
            Powered by <span className="font-medium">candigit.web.id</span>
          </p>
          <div className={cn("hidden lg:hidden items-center justify-center", desktopCollapsed && "lg:flex")} title="Powered by Candigit.web">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">CG</span>
          </div>
        </div>
      </aside>
      )}

      {/* Main content */}
      <div className={cn("transition-all duration-300 ease-in-out flex flex-col min-h-screen", !isDapur ? (desktopCollapsed ? "lg:pl-20" : "lg:pl-64") : "")}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-stone-200/80 bg-white/80 px-4 backdrop-blur-md shadow-sm lg:px-6">
          {!isDapur ? (
            <>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-xl p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 lg:hidden transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <button 
                onClick={() => setDesktopCollapsed(!desktopCollapsed)}
                className="hidden lg:flex rounded-xl p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
                title="Toggle Sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {app_settings?.store_logo ? (
                <img src={`/storage/${app_settings.store_logo}`} alt="Logo" className="h-8 object-contain" />
              ) : (
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-1.5 rounded-lg shadow-sm">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
              )}
              {(!app_settings?.store_logo) && (
                <span className="text-lg font-bold text-stone-800">{app_settings?.store_name || 'GreenPOS'}</span>
              )}
            </div>
          )}
          
          <div className="flex-1" />
          
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={cn(
                "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-full border transition-all duration-200",
                profileDropdownOpen ? "bg-stone-100 border-stone-300 shadow-inner" : "bg-stone-50 border-stone-200 hover:bg-stone-100"
              )}
            >
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                {auth.user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-stone-700 hidden sm:inline">{auth.user.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("hidden sm:block w-4 h-4 text-stone-400 transition-transform duration-200", profileDropdownOpen && "rotate-180")}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Overlay to catch outside clicks */}
            {profileDropdownOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)}></div>
            )}

            {/* Dropdown Menu */}
            <div
              className={cn(
                "absolute right-0 mt-2 w-56 rounded-2xl border border-stone-200 bg-white p-1 shadow-xl z-50 transition-all duration-200 origin-top-right",
                profileDropdownOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              )}
            >
              <div className="px-3 py-3 border-b border-stone-100/80 bg-stone-50/50 rounded-t-xl">
                <p className="text-sm font-bold text-stone-800">{app_settings?.store_name || 'Sistem POS'}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-xs text-stone-500">Versi 1.0.0 (Stabil)</p>
                </div>
              </div>
              
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100/50 text-red-600">
                    <LogOut className="h-4 w-4" />
                  </div>
                  Keluar dari Sistem
                </button>
              </div>
            </div>
          </div>
        </header>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6 animate-in fade-in duration-500">{children}</main>
        </div>
      </div>
    </>
  );
}