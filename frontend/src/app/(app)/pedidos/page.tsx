'use client';

import { useCallback, useEffect, useState } from 'react';
import { OrdersTable } from '@/components/orders/orders-table';
import { Alert, Card, PageHeader, Spinner } from '@/components/ui/feedback';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Order } from '@/lib/types';

export default function OrdersPage() {
  const { user } = useAuth();
  const isProducer = user?.role === 'PRODUCER';
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const path = isProducer ? `/orders/received${status ? `?status=${status}` : ''}` : '/orders/mine';
      setOrders(await api<Order[]>(path));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [isProducer, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirm(order: Order) {
    setSuccess('');
    setError('');
    try {
      await api(`/orders/${order.id}/confirm`, { method: 'POST' });
      setSuccess(`Pedido #${order.number} confirmado. El inventario fue actualizado.`);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader title={isProducer ? 'Pedidos recibidos' : 'Mis pedidos'} subtitle={isProducer ? 'Confirme los pedidos según su disponibilidad real' : 'Siga el estado de sus pedidos'} />
      <div className="space-y-4">
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="error">{error}</Alert>}
        <Card
          actions={
            isProducer && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Estado
                <select className="h-10 rounded-lg border border-gray-300 px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="CONFIRMED">Confirmados</option>
                </select>
              </label>
            )
          }
          title="Pedidos"
        >
          {!orders && !error && <Spinner />}
          {orders && <OrdersTable orders={orders} mode={isProducer ? 'producer' : 'buyer'} onConfirm={confirm} />}
        </Card>
      </div>
    </>
  );
}
