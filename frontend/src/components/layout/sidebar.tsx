'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '../ui/logo';
import { IconBox, IconCart, IconHome, IconOrders, IconStore } from './icons';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const producerNav: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: <IconHome /> },
  { href: '/mis-productos', label: 'Mis productos', icon: <IconBox /> },
  { href: '/pedidos', label: 'Pedidos recibidos', icon: <IconOrders /> },
  { href: '/catalogo', label: 'Catálogo', icon: <IconStore /> },
];

const buyerNav: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: <IconHome /> },
  { href: '/catalogo', label: 'Catálogo', icon: <IconStore /> },
  { href: '/carrito', label: 'Carrito', icon: <IconCart /> },
  { href: '/pedidos', label: 'Mis pedidos', icon: <IconOrders /> },
];

/** Menú lateral basado en "AppSidebar" de TailAdmin, con opciones según el rol (SWR-AUTH-007). */
export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const items = user?.role === 'PRODUCER' ? producerNav : buyerNav;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-200 bg-white px-5 transition-transform lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-[76px] items-center">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>
      <p className="mb-3 mt-4 text-xs uppercase leading-5 text-gray-400">Menú</p>
      <nav aria-label="Menú principal">
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={`menu-item group ${active ? 'menu-item-active' : 'menu-item-inactive'}`}
                >
                  <span className={active ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto mb-6 rounded-2xl bg-brand-50 px-4 py-5 text-center">
        <p className="text-sm font-semibold text-brand-700">Del campo huilense a su negocio</p>
        <p className="mt-1 text-xs text-gray-600">Comercio directo, sin intermediarios.</p>
      </div>
    </aside>
  );
}
