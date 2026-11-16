import { ReactNode } from 'react';
import { LogoMark } from '../ui/logo';

/** Diseño de pantalla de autenticación basado en "SignIn" de TailAdmin (formulario + panel de marca). */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex w-full flex-1 flex-col justify-center px-6 py-10 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-brand-950 lg:flex">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative z-10 max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <LogoMark size={88} />
          </div>
          <p className="text-3xl font-semibold text-white">AgroHuila Conecta</p>
          <p className="mt-3 text-gray-300">Productores del Huila y compradores, conectados de forma directa.</p>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-harvest-500" />
        </div>
      </div>
    </div>
  );
}
