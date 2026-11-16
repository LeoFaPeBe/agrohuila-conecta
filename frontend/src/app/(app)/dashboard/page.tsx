'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { IconBox, IconCart, IconOrders, IconStore } from '@/components/layout/icons';
import { Alert, PageHeader, Spinner } from '@/components/ui/feedback';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatCOP } from '@/lib/format';

type Summary = Record<string, number | string>;

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Summary>('/dashboard/summary').then(setData).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageHeader title={`Hola, ${user?.fullName}`} subtitle={user?.role === 'PRODUCER' ? 'Resumen de sus publicaciones y pedidos' : 'Resumen de sus compras'} />
      {error && <Alert variant="error">{error}</Alert>}
      {!data && !error && <Spinner />}
      {data && user?.role === 'PRODUCER' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
          <StatCard label="Productos activos" value={data.products} icon={<IconBox />} />
          <StatCard label="Pedidos pendientes" value={data.pending} icon={<IconOrders />} tone="harvest" />
          <StatCard label="Pedidos confirmados" value={data.confirmed} icon={<IconOrders />} />
          <StatCard label="Ventas confirmadas" value={formatCOP(Number(data.salesTotal))} icon={<IconStore />} tone="coffee" />
        </div>
      )}
      {data && user?.role === 'BUYER' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
          <StatCard label="Productos disponibles" value={data.availableProducts} icon={<IconStore />} />
          <StatCard label="Pedidos pendientes" value={data.pending} icon={<IconOrders />} tone="harvest" />
          <StatCard label="Pedidos confirmados" value={data.confirmed} icon={<IconCart />} />
          <StatCard label="Compras confirmadas" value={formatCOP(Number(data.spentTotal))} icon={<IconCart />} tone="coffee" />
        </div>
      )}
      {data && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-medium text-gray-800">Accesos rápidos</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {user?.role === 'PRODUCER' ? (
              <>
                <Link className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600" href="/mis-productos">Publicar producto</Link>
                <Link className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50" href="/pedidos">Ver pedidos recibidos</Link>
                {Number(data.lowStock) > 0 && <p className="self-center text-sm text-harvest-700">{data.lowStock} producto(s) con stock bajo (≤ 5)</p>}
              </>
            ) : (
              <>
                <Link className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600" href="/catalogo">Explorar catálogo</Link>
                <Link className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50" href="/pedidos">Ver mis pedidos</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
