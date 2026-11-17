'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProductForm, ProductPayload } from '@/components/products/product-form';
import { ProductsTable } from '@/components/products/products-table';
import { Alert, Card, PageHeader, Spinner } from '@/components/ui/feedback';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Category, Product } from '@/lib/types';

export default function MyProductsPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(() => api<Product[]>('/products/mine').then(setProducts).catch((e) => setError(e.message)), []);

  useEffect(() => {
    api<Category[]>('/categories').then(setCategories).catch(() => undefined);
    reload();
  }, [reload]);

  if (user?.role !== 'PRODUCER') return <Alert variant="error">Esta sección es solo para productores.</Alert>;

  async function save(payload: ProductPayload) {
    if (editing) {
      await api(`/products/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    } else {
      await api('/products', { method: 'POST', body: JSON.stringify(payload) });
    }
    await reload();
  }

  return (
    <>
      <PageHeader title="Mis productos" subtitle="Publique su oferta y mantenga actualizada la cantidad disponible" />
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <Card title={editing ? `Editar: ${editing.name}` : 'Publicar nuevo producto'}>
            <ProductForm key={editing?.id ?? 'new'} categories={categories} initial={editing ?? undefined} onSubmit={save} onCancel={editing ? () => setEditing(null) : undefined} />
          </Card>
        </div>
        <div className="xl:col-span-3">
          <Card title="Publicaciones">
            {error && <Alert variant="error">{error}</Alert>}
            {!products && !error && <Spinner />}
            {products && <ProductsTable products={products} onEdit={setEditing} />}
          </Card>
        </div>
      </div>
    </>
  );
}
