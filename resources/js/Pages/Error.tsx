import { Head, Link } from '@inertiajs/react';
import { AlertCircle, FileQuestion, ShieldAlert, ServerCrash, Home, ArrowLeft } from 'lucide-react';
import { generateThemeVariables, ThemeColor } from '@/Utils/theme';

interface ErrorProps {
  status: number;
  message?: string;
  app_settings?: {
    theme_color?: string;
  };
}

export default function ErrorPage({ status, message, app_settings }: ErrorProps) {
  const getErrorContent = () => {
    switch (status) {
      case 404:
        return {
          title: 'Halaman Tidak Ditemukan',
          description: 'Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.',
          icon: FileQuestion,
          color: 'text-blue-500',
          bg: 'bg-blue-100/50',
        };
      case 403:
        return {
          title: 'Akses Ditolak',
          description: message || 'Maaf, Anda tidak memiliki izin untuk mengakses halaman atau fitur ini.',
          icon: ShieldAlert,
          color: 'text-amber-500',
          bg: 'bg-amber-100/50',
        };
      case 500:
        return {
          title: 'Kesalahan Sistem',
          description: 'Ups, terjadi kesalahan pada server kami. Silakan coba lagi nanti.',
          icon: ServerCrash,
          color: 'text-red-500',
          bg: 'bg-red-100/50',
        };
      case 503:
        return {
          title: 'Layanan Tidak Tersedia',
          description: 'Sistem sedang dalam perbaikan. Silakan periksa kembali beberapa saat lagi.',
          icon: AlertCircle,
          color: 'text-orange-500',
          bg: 'bg-orange-100/50',
        };
      default:
        return {
          title: 'Terjadi Kesalahan',
          description: message || 'Maaf, terjadi kesalahan yang tidak terduga.',
          icon: AlertCircle,
          color: 'text-stone-500',
          bg: 'bg-stone-100/50',
        };
    }
  };

  const content = getErrorContent();
  const Icon = content.icon;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root {\n${generateThemeVariables((app_settings?.theme_color as ThemeColor) || 'green')}\n}` }} />
      <Head title={`${status} - ${content.title}`} />
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 selection:bg-green-200">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative">
            <h1 className={`text-9xl font-black tracking-tighter opacity-10 ${content.color}`}>
              {status}
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`p-6 rounded-3xl ${content.bg} border-4 border-white shadow-xl rotate-12 transition-transform hover:rotate-0 duration-500`}>
                <Icon className={`w-16 h-16 ${content.color}`} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-stone-800 tracking-tight">
              {content.title}
            </h2>
            <p className="text-stone-500 leading-relaxed max-w-sm mx-auto">
              {content.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
            <button
              onClick={() => window.history.back()}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:text-stone-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 focus:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <Link
              href="/"
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-600/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Home className="w-4 h-4" />
              Ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
