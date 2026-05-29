import { FormEventHandler, useEffect } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Card, CardBody } from '@/Components/UI/Card';
import { Leaf } from 'lucide-react';
import { generateThemeVariables, ThemeColor } from '@/Utils/theme';

export default function Login() {
  const { app_settings } = usePage<any>().props;
  const { data, setData, post, processing, errors } = useForm({
    username: '',
    password: '',
    remember: false,
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/login');
  };

  // Reactive Title & Favicon Updates
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const storeName = app_settings?.store_name || 'GreenPOS';
      document.title = `Login - ${storeName}`;

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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root {\n${generateThemeVariables((app_settings?.theme_color as ThemeColor) || 'green')}\n}` }} />
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <Card className="w-full max-w-md">
        <CardBody className="p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            {app_settings?.store_icon ? (
              <div className="flex h-24 w-24 items-center justify-center mb-4 shrink-0">
                <img src={`/storage/${app_settings.store_icon}`} alt="Icon" className="h-full w-full object-contain" />
              </div>
            ) : app_settings?.store_logo ? (
              <div className="flex h-20 max-w-[200px] items-center justify-center mb-4 shrink-0">
                <img src={`/storage/${app_settings.store_logo}`} alt="Logo" className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4 shrink-0">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
            )}
            <h1 className="mt-2 text-2xl font-bold text-green-700">{app_settings?.store_name || 'GreenPOS'}</h1>
            <p className="mt-1 text-sm text-stone-500">Masuk ke System Point of Sale</p>
          </div>

          {errors.username && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {errors.username}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              value={data.username}
              onChange={(e) => setData('username', e.target.value)}
              placeholder="Masukkan username"
              error={errors.username}
            />

            <Input
              label="Password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder="••••••••"
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="rounded border-stone-300 text-green-600 focus:ring-green-500"
                />
                Ingat saya
              </label>
            </div>

            <Button type="submit" className="w-full" loading={processing}>
              Masuk
            </Button>
          </form>
        </CardBody>
        </Card>
      </div>
    </>
  );
}