'use client';

import { useCallback, useEffect, useState } from 'react';
import { CatalogFilters, CatalogFilterValues, EMPTY_FILTERS } from '@/components/catalog/catalog-filters';
import { ProductCard } from '@/components/catalog/product-card';
import { Button } from '@/components/ui/button';
import { Alert, Card, EmptyState, PageHeader, Spinner } from '@/components/ui/feedback';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Category, Paged, Product } from '@/lib/types';

export default function CatalogPage() {
  const { user } = useAuth();
  const { add } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [filters, setFilters] = useState<CatalogFilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paged<Product> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Category[]>('/categories').then(setCategories).catch(() => undefined);
    api<string[]>('/municipalities').then(setMunicipalities).catch(() => undefined);
  }, []);

  const load = useCallback(async (f: CatalogFilterValues, p: number) => {
    setResult(null);
    setError('');
    const params = new URLSearchParams({ page: String(p) });
    Object.entries(f).forEach(([k, v]) => v && params.set(k, v));
    try {
      setResult(await api<Paged<Product>>(`/products?${params}`));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load(filters, page);
  }, [filters, page, load]);

  const pages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <>
      <PageHeader title="Catálogo de productos" subtitle="Productos publicados por productores del Huila" />
      <Card>
        <CatalogFilters
          categories={categories}
          municipalities={municipalities}
          onSearch={(f) => {
            setPage(1);
            setFilters(f);
          }}
        />
      </Card>
      <div className="mt-6">
        {error && <Alert variant="error">{error}</Alert>}
        {!result && !error && <Spinner label="Cargando productos…" />}
        {result && result.items.length === 0 && <EmptyState title="No se encontraron productos">Modifique los criterios de búsqueda.</EmptyState>}
        {result && result.items.length > 0 && (
          <>
            <p className="mb-4 text-sm text-gray-500">{result.total} producto(s) encontrado(s)</p>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {result.items.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={add} canBuy={user?.role === 'BUYER'} />
              ))}
            </div>
            {pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
                <span className="text-sm text-gray-600">Página {page} de {pages}</span>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Siguiente</Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
