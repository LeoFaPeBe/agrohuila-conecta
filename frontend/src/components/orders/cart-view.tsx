'use client';

import { formatCOP } from '@/lib/format';
import { CartLine } from '@/lib/cart-context';
import { Button } from '../ui/button';
import { EmptyState } from '../ui/feedback';

/** Carrito: agrupa visualmente por productor porque se generará un pedido por cada uno (SWR-ORD-004). */
export function CartView({
  lines,
  onRemove,
  onSubmit,
  submitting,
}: {
  lines: CartLine[];
  onRemove: (productId: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  if (lines.length === 0) return <EmptyState title="Su carrito está vacío">Explore el catálogo y agregue productos.</EmptyState>;

  const groups = new Map<string, CartLine[]>();
  for (const l of lines) groups.set(l.product.producer.fullName, [...(groups.get(l.product.producer.fullName) ?? []), l]);
  const total = lines.reduce((s, l) => s + l.quantity * l.product.price, 0);

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([producer, group]) => (
        <div key={producer} className="rounded-xl border border-gray-200">
          <p className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">Pedido para: {producer}</p>
          <ul className="divide-y divide-gray-100">
            {group.map((l) => (
              <li key={l.product.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span>
                  <span className="font-medium text-gray-800">{l.product.name}</span>
                  <span className="block text-xs text-gray-500">
                    {l.quantity} {l.product.unit} × {formatCOP(l.product.price)}
                  </span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="font-medium">{formatCOP(l.quantity * l.product.price)}</span>
                  <button className="text-xs text-red-500 hover:underline" onClick={() => onRemove(l.product.id)} aria-label={`Quitar ${l.product.name}`}>
                    Quitar
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-brand-50 px-5 py-4">
        <p className="text-sm text-gray-700">
          Se crearán <strong>{groups.size}</strong> pedido(s). Total: <strong className="text-brand-700">{formatCOP(total)}</strong>
        </p>
        <Button onClick={onSubmit} loading={submitting}>
          Enviar pedido
        </Button>
      </div>
    </div>
  );
}
