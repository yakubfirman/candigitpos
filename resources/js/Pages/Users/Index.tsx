import { useState } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layouts/AppLayout';
import { Card, CardBody } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Badge } from '@/Components/UI/Badge';
import { Modal } from '@/Components/UI/Modal';
import { Alert } from '@/Components/UI/Alert';
import { Users, UserPlus, Pencil, Trash2, Search, ShieldCheck, User } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  username: string;
  role: 'admin' | 'kasir' | 'dapur';
  created_at: string;
}

interface UsersProps {
  users: UserData[];
  flash?: {
    success?: string;
    error?: string;
  };
  errors?: Record<string, string>;
  [key: string]: unknown;
}

export default function UsersIndex() {
  const { users, flash, errors: pageErrors, auth } = usePage<UsersProps & { auth: { user: { role: string | { value: string } } } }>().props;
  const currentUserRole = typeof auth.user.role === 'object' ? auth.user.role.value : auth.user.role;
  const isSuperAdmin = currentUserRole === 'super_admin';
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const { data, setData, post, patch, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    name: '',
    username: '',
    password: '',
    role: 'kasir' as 'admin' | 'kasir' | 'dapur',
  });

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (user?: UserData) => {
    clearErrors();
    if (user) {
      setEditingUser(user);
      setData({
        name: user.name,
        username: user.username,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      reset();
      setData('role', 'kasir');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      patch(`/users/${editingUser.id}`, {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        }
      });
    } else {
      post('/users', {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        }
      });
    }
  };

  const handleDelete = (user: UserData) => {
    if (confirm(`Yakin ingin menghapus pengguna "${user.name}"?`)) {
      destroy(`/users/${user.id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Manajemen Pengguna" />
      
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-stone-800 flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              Pengguna Sistem
            </h1>
            <p className="text-sm text-stone-500 mt-1">Kelola akun admin dan kasir GreenPOS</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Tambah Pengguna
          </Button>
        </div>

        {flash?.success && <Alert type="success">{flash.success}</Alert>}
        {(flash?.error || pageErrors?.error) && <Alert type="error">{flash?.error || pageErrors?.error}</Alert>}

        <Card>
          <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-stone-400" />
              </div>
              <input
                type="text"
                className="bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl focus:ring-green-500 focus:border-green-500 block w-full pl-10 p-2.5 shadow-sm transition-colors"
                placeholder="Cari nama atau username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Pengguna</th>
                  <th className="px-6 py-4 font-medium">Username</th>
                  <th className="px-6 py-4 font-medium">Hak Akses</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                          user.role === 'admin' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-stone-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-500">@{user.username}</td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={user.role === 'admin' ? 'green' : user.role === 'dapur' ? 'amber' : 'blue'} 
                        className="inline-flex items-center gap-1"
                      >
                        {user.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {user.role === 'admin' ? 'Administrator' : user.role === 'dapur' ? 'Dapur' : 'Kasir'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => handleOpenModal(user)} className="px-2">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(user)} 
                        className="px-2"
                        disabled={user.role === 'admin' && !isSuperAdmin}
                        title={user.role === 'admin' && !isSuperAdmin ? "Admin tidak dapat menghapus admin lain" : "Hapus Pengguna"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                      Tidak ada pengguna yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
        icon={editingUser ? <Pencil className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            placeholder="Contoh: Budi Santoso"
            error={errors.name}
            required
          />
          <Input
            label="Username"
            value={data.username}
            onChange={(e) => setData('username', e.target.value)}
            placeholder="Contoh: budi"
            error={errors.username}
            required
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">Hak Akses (Role)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
              <label className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center gap-2 transition-all ${
                data.role === 'kasir' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-stone-200 hover:bg-stone-50'
              }`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="kasir" 
                  checked={data.role === 'kasir'} 
                  onChange={(e) => setData('role', e.target.value as any)}
                  className="sr-only" 
                />
                <User className={`h-6 w-6 ${data.role === 'kasir' ? 'text-blue-600' : 'text-stone-400'}`} />
                <span className={`text-sm font-semibold ${data.role === 'kasir' ? 'text-blue-700' : 'text-stone-600'}`}>Kasir</span>
              </label>

              <label className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center gap-2 transition-all ${
                data.role === 'dapur' ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500' : 'border-stone-200 hover:bg-stone-50'
              }`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="dapur" 
                  checked={data.role === 'dapur'} 
                  onChange={(e) => setData('role', e.target.value as any)}
                  className="sr-only" 
                />
                <User className={`h-6 w-6 ${data.role === 'dapur' ? 'text-amber-600' : 'text-stone-400'}`} />
                <span className={`text-sm font-semibold ${data.role === 'dapur' ? 'text-amber-700' : 'text-stone-600'}`}>Dapur</span>
              </label>

              <label className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center gap-2 transition-all ${
                data.role === 'admin' ? 'border-green-500 bg-green-50/50 ring-1 ring-green-500' : 'border-stone-200 hover:bg-stone-50'
              }`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="admin" 
                  checked={data.role === 'admin'} 
                  onChange={(e) => setData('role', e.target.value as any)}
                  className="sr-only" 
                />
                <ShieldCheck className={`h-6 w-6 ${data.role === 'admin' ? 'text-green-600' : 'text-stone-400'}`} />
                <span className={`text-sm font-semibold ${data.role === 'admin' ? 'text-green-700' : 'text-stone-600'}`}>Admin</span>
              </label>
            </div>
            {errors.role && <p className="text-xs text-red-600">{errors.role}</p>}
            {pageErrors?.role && <p className="text-xs text-red-600">{pageErrors.role}</p>}
          </div>

          <div className="pt-2">
            <Input
              label={editingUser ? 'Password Baru (Opsional)' : 'Password'}
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder={editingUser ? 'Kosongkan jika tidak ingin diubah' : 'Minimal 8 karakter'}
              error={errors.password}
              required={!editingUser}
            />
            {editingUser && <p className="text-xs text-stone-500 mt-1">Hanya isi jika ingin mereset password pengguna ini.</p>}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-stone-100">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={processing}>
              Simpan Pengguna
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
