'use client';

import { useState } from 'react';
import { formatCOP, formatDate, STATUS_LABEL } from '@/lib/format';
import { Order } from '@/lib/types';
import { Button } from '../ui/button';
import { Badge, EmptyState } from '../ui/feedback';

/**
 * Tabla de pedidos. Para el productor muestra el botón "Confirmar" en pedidos pendientes (SWR-ORD-006).
 * El botón se deshabilita mientras se procesa para evitar doble envío.
 */
export function OrdersTable({
  orders,
  mode,
  onConfirm,
}: {
  orders: Order[];
  mode: 'buyer' | 'producer';
  onConfirm?: (order: Order) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  if (orders.length === 0) {
    return <EmptyState title={mode === 'producer' ? 'No tiene pedidos recibidos' : 'Aún no ha realizado pedidos'} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-y border-gray-100 text-xs text-gray-500">
          <tr>
            <th className="py-3 pr-4 font-medium">Pedido</th>
            <th className="py-3 pr-4 font-medium">{mode === 'producer' ? 'Comprador' : 'Productor'}</th>
            <th className="py-3 pr-4 font-medium">Productos</th>
            <th className="py-3 pr-4 font-medium">Total</th>
            <th className="py-3 pr-4 font-medium">Estado</th>
            {mode === 'producer' && <th className="py-3 font-medium"><span className="sr-only">Acciones</span></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((o) => {
            const party = mode === 'producer' ? o.buyer : o.producer;
            return (
              <tr key={o.id}>
                <td className="py-3 pr-4">
                  <span className="font-medium text-gray-800">#{o.number}</span>
                  <span className="block text-xs text-gray-500">{formatDate(o.createdAt)}</span>
                </td>
                <td className="py-3 pr-4 text-gray-600">
                  {party.fullName}
                  <span className="block text-xs text-gray-500">{party.municipality}</span>
                </td>
                <td className="py-3 pr-4 text-gray-600">
                  <ul>
                    {o.items.map((i) => (
                      <li key={i.id}>
                        {i.quantity} {i.product.unit} · {i.product.name}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-3 pr-4 font-medium text-gray-800">{formatCOP(o.total)}</td>
                <td className="py-3 pr-4">
                  <Badge color={o.status === 'CONFIRMED' ? 'success' : 'warning'}>{STATUS_LABEL[o.status]}</Badge>
                </td>
                {mode === 'producer' && (
                  <td className="py-3 text-right">
                    {o.status === 'PENDING' && onConfirm && (
                      <Button
                        size="sm"
                        loading={busy === o.id}
                        disabled={busy !== null}
                        onClick={async () => {
                          setBusy(o.id);
                          try {
                            await onConfirm(o);
                          } finally {
                            setBusy(null);
                          }
                        }}
                      >
                        Confirmar pedido #{o.number}
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
