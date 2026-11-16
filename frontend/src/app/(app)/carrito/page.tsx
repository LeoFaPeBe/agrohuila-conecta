'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CartView } from '@/components/orders/cart-view';
import { Alert, Card, PageHeader } from '@/components/ui/feedback';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Order } from '@/lib/types';

export default function CartPage() {
  const { user } = useAuth();
  const { lines, remove, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<Order[] | null>(null);

  // DEF-07: el carrito es exclusivo del rol Comprador (SWR-AUTH-007), también si se entra por URL.
  if (user?.role !== 'BUYER') return <Alert variant="error">Esta sección es solo para compradores.</Alert>;

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      const orders = await api<Order[]>('/orders', {
        method: 'POST',
        body: JSON.stringify({ items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })) }),
      });
      clear();
      setCreated(orders);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Carrito" subtitle="Revise los productos antes de enviar su pedido" />
      {created && (
        <div className="mb-6">
          <Alert variant="success">
            Pedido enviado: se crearon {created.length} pedido(s) en estado Pendiente ({created.map((o) => `#${o.number}`).join(', ')}).{' '}
            <Link href="/pedidos" className="font-medium underline">Ver mis pedidos</Link>
          </Alert>
        </div>
      )}
      {error && <div className="mb-6"><Alert variant="error">{error}</Alert></div>}
      <Card>
        <CartView lines={lines} onRemove={remove} onSubmit={submit} submitting={submitting} />
      </Card>
    </>
  );
}
