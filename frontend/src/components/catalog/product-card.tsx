'use client';

import { useState } from 'react';
import { formatCOP } from '@/lib/format';
import { Product } from '@/lib/types';
import { Button } from '../ui/button';

/** Tarjeta de producto en el catálogo con selector de cantidad (SWR-ORD-001/002). */
export function ProductCard({ product, onAdd, canBuy }: { product: Product; onAdd: (p: Product, qty: number) => string | null; canBuy: boolean }) {
  const [qty, setQty] = useState('1');
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const outOfStock = product.quantity <= 0;

  function add() {
    const error = onAdd(product, Number(qty));
    setMessage(error ? { type: 'error', text: error } : { type: 'ok', text: 'Agregado al carrito' });
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white" aria-label={product.name}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover" />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium tracking-wide text-coffee-500 uppercase">{product.category.name}</p>
        <h3 className="mt-1 font-semibold text-gray-800">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{product.description}</p>
        <p className="mt-2 text-xs text-gray-500">
          {product.producer.fullName} · {product.producer.municipality}
        </p>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-lg font-semibold text-brand-600">
            {formatCOP(product.price)}
            <span className="text-xs font-normal text-gray-500"> / {product.unit}</span>
          </span>
          <span className="text-xs text-gray-500">{outOfStock ? 'Agotado' : `${product.quantity} ${product.unit} disp.`}</span>
        </div>
        {canBuy && (
          <div className="mt-4 flex items-end gap-2">
            <label className="w-20 text-xs text-gray-600">
              Cantidad
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 px-2 text-sm"
                aria-label={`Cantidad de ${product.name}`}
              />
            </label>
            <Button size="sm" className="flex-1" onClick={add} disabled={outOfStock}>
              Agregar al carrito
            </Button>
          </div>
        )}
        {message && (
          <p role={message.type === 'error' ? 'alert' : 'status'} className={`mt-2 text-xs ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    </article>
  );
}
