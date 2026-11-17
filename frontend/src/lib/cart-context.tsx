'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Product } from './types';

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (product: Product, quantity: number) => string | null;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CART_KEY = 'agrohuila.cart';
const CartContext = createContext<CartState | null>(null);

/**
 * SWR-ORD-002 (lado cliente): antes de agregar, la cantidad total del producto en el carrito
 * debe ser entera, mayor que cero y no superar la disponible. Devuelve el mensaje de error o null.
 */
export function checkCartQuantity(current: number, adding: number, available: number): string | null {
  if (!Number.isInteger(adding) || adding <= 0) return 'La cantidad debe ser un número entero mayor que cero';
  if (current + adding > available) return `Solo hay ${available} disponibles (ya tiene ${current} en el carrito)`;
  return null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  const persist = (next: CartLine[]) => {
    setLines(next);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
    } catch {
      /* sin almacenamiento */
    }
  };

  const add = (product: Product, quantity: number) => {
    const current = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;
    const error = checkCartQuantity(current, quantity, product.quantity);
    if (error) return error;
    const exists = lines.some((l) => l.product.id === product.id);
    persist(
      exists
        ? lines.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l))
        : [...lines, { product, quantity }],
    );
    return null;
  };

  const setQuantity = (productId: string, quantity: number) =>
    persist(lines.map((l) => (l.product.id === productId ? { ...l, quantity } : l)));
  const remove = (productId: string) => persist(lines.filter((l) => l.product.id !== productId));
  const clear = () => persist([]);

  return <CartContext.Provider value={{ lines, add, setQuantity, remove, clear }}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
