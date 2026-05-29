import { usePage, router } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layouts/AppLayout';
import { Card, CardBody } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Badge } from '@/Components/UI/Badge';
import { Alert } from '@/Components/UI/Alert';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/Components/UI/Table';
import { useState } from 'react';
import { Modal } from '@/Components/UI/Modal';
import { Tags, Plus, Pencil, Trash2, Package, Folder } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  products_count: number;
  created_at: string;
}

interface CategoriesProps {
  categories: Category[];
  auth: {
    user: {
      role: 'admin' | 'kasir';
      [key: string]: unknown;
    }
  };
  flash?: {
    success?: string;
    error?: string;
  };
  [key: string]: unknown;
}

export default function CategoriesIndex() {
  const { categories, auth, flash } = usePage<CategoriesProps>().props;
  const isAdmin = auth.user.role === 'admin';
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [addName, setAddName] = useState('');
  const [editName, setEditName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleOpenModal = (category?: Category) => {
    setLocalError(null);
    if (category) {
      setEditCategory(category);
      setEditName(category.name);
      setShowEditModal(true);
    } else {
      setAddName('');
      setShowAddModal(true);
    }
  };

  const handleAdd = () => {
    if (!addName.trim()) return;
    setProcessing(true);
    router.post('/categories', { name: addName }, {
      onSuccess: () => {
        setShowAddModal(false);
        setAddName('');
        setProcessing(false);
      },
      onError: (errors) => {
        setLocalError(errors.name || 'Gagal menyimpan kategori');
        setProcessing(false);
      },
    });
  };

  const handleEdit = () => {
    if (!editCategory || !editName.trim()) return;
    setProcessing(true);
    router.patch(`/categories/${editCategory.id}`, { name: editName }, {
      onSuccess: () => {
        setShowEditModal(false);
        setEditCategory(null);
        setEditName('');
        setProcessing(false);
      },
      onError: (errors) => {
        setLocalError(errors.name || 'Gagal memperbarui kategori');
        setProcessing(false);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Hapus kategori ini?')) return;
    router.delete(`/categories/${id}`, {
      onError: (errors) => {
        setLocalError(errors.message || 'Gagal menghapus kategori');
      },
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Kategori Produk</h1>
            <p className="text-sm text-stone-500 mt-1">Kelompokkan produk untuk memudahkan pencarian</p>
          </div>
          {isAdmin && (
            <Button onClick={() => handleOpenModal()} className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Tambah Kategori
            </Button>
          )}
        </div>

        {/* Error */}
        {(localError || flash?.error) && (
          <Alert type="error" onClose={() => setLocalError(null)}>
            {localError || flash?.error}
          </Alert>
        )}

        {/* Success */}
        {flash?.success && (
          <Alert type="success">
            {flash.success}
          </Alert>
        )}

        {/* Categories Table */}
        <Card>
          {categories.length === 0 ? (
            <CardBody className="flex flex-col items-center justify-center text-center text-stone-400 py-12">
              <Tags className="h-12 w-12 mb-2 text-stone-300" />
              <p className="mt-2">Belum ada kategori</p>
              {isAdmin && (
                <Button variant="secondary" className="mt-4" onClick={() => handleOpenModal()}>
                  Tambah Kategori Pertama
                </Button>
              )}
            </CardBody>
          ) : (
            <Table>
              <TableHeader>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-center">Jumlah Produk</TableHead>
                {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 border border-green-100/50">
                          <Folder className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-stone-800">{category.name}</p>
                          <p className="text-xs text-stone-400">/{category.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="stone" className="text-xs font-medium px-2.5 py-1">
                        {category.products_count || 0} Produk
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(category)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDelete(category.id)}
                            disabled={category.products_count > 0}
                            title={category.products_count > 0 ? "Tidak dapat menghapus kategori yang memiliki produk" : "Hapus Kategori"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setAddName(''); setLocalError(null); }} title="Tambah Kategori" icon={<Tags className="h-4 w-4" />}>
        <div className="space-y-4">
          {localError && <Alert type="error">{localError}</Alert>}
          <Input
            label="Nama Kategori"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Masukkan nama kategori"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowAddModal(false); setAddName(''); setLocalError(null); }}>
              Batal
            </Button>
            <Button onClick={handleAdd} loading={processing} disabled={!addName.trim()}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditCategory(null); setLocalError(null); }} title="Edit Kategori" icon={<Pencil className="h-4 w-4" />}>
        <div className="space-y-4">
          {localError && <Alert type="error">{localError}</Alert>}
          <Input
            label="Nama Kategori"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Masukkan nama kategori"
            onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowEditModal(false); setEditCategory(null); setLocalError(null); }}>
              Batal
            </Button>
            <Button onClick={handleEdit} loading={processing} disabled={!editName.trim()}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}