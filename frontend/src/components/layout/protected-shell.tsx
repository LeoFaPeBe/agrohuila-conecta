'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '../ui/feedback';
import { Header } from './header';
import { Sidebar } from './sidebar';

/**
 * Protege las rutas internas: si no hay sesión, redirige a /login (SWR-AUTH-001).
 * La protección real está en el backend (JwtAuthGuard); aquí solo se evita mostrar pantallas vacías.
 */
export function ProtectedShell({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);

  if (!ready || !user) return <Spinner label="Verificando sesión…" />;

  return (
    <div className="min-h-screen">
      <Sidebar open={open} onNavigate={() => setOpen(false)} />
      {open && <div className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <div className="lg:ml-[260px]">
        <Header onToggle={() => setOpen((v) => !v)} />
        <main className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
