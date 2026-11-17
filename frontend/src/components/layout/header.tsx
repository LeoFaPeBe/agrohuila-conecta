'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { ROLE_LABEL } from '@/lib/format';
import { IconCart, IconLogout, IconMenu } from './icons';
import Link from 'next/link';

/** Barra superior basada en "AppHeader" de TailAdmin. */
export function Header({ onToggle }: { onToggle: () => void }) {
  const { user, logout } = useAuth();
  const { lines } = useCart();
  const router = useRouter();
  const count = lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <button className="rounded-lg border border-gray-200 p-2 text-gray-600 lg:hidden" onClick={onToggle} aria-label="Abrir menú">
        <IconMenu />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        {user?.role === 'BUYER' && (
          <Link href="/carrito" className="relative rounded-full border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-100" aria-label={`Carrito (${count})`}>
            <IconCart />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-harvest-500 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        )}
        <div className="flex items-center gap-3 rounded-full border border-gray-200 py-1.5 pr-4 pl-1.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white" aria-hidden>
            {user?.fullName?.charAt(0) ?? '?'}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-gray-800">{user?.fullName}</span>
            <span className="block text-xs text-gray-500">{user ? ROLE_LABEL[user.role] : ''} · {user?.municipality}</span>
          </span>
        </div>
        <button
          onClick={() => {
            logout();
            router.replace('/login');
          }}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <IconLogout />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
