import { ReactNode } from 'react';

const alertStyles = {
  success: 'border-green-500 bg-green-50 text-green-800',
  error: 'border-red-500 bg-red-50 text-red-800',
  warning: 'border-harvest-500 bg-harvest-50 text-harvest-700',
  info: 'border-brand-300 bg-brand-50 text-brand-800',
};

export function Alert({ variant, children }: { variant: keyof typeof alertStyles; children: ReactNode }) {
  return (
    <div role={variant === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-4 text-sm ${alertStyles[variant]}`}>
      {children}
    </div>
  );
}

export function Badge({ color, children }: { color: 'success' | 'warning' | 'gray'; children: ReactNode }) {
  const c = {
    success: 'bg-green-50 text-green-700',
    warning: 'bg-harvest-50 text-harvest-700',
    gray: 'bg-gray-100 text-gray-700',
  }[color];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c}`}>{children}</span>;
}

export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-10 text-sm text-gray-500">
      <span className="size-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" aria-hidden />
      {label}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <p className="text-base font-medium text-gray-800">{title}</p>
      {children && <div className="mt-2 text-sm text-gray-500">{children}</div>}
    </div>
  );
}

/** Contenedor tipo "ComponentCard" de TailAdmin. */
export function Card({ title, description, actions, children }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
          <div>
            {title && <h3 className="text-base font-medium text-gray-800">{title}</h3>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-title-sm font-semibold text-gray-800 sm:text-2xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}
