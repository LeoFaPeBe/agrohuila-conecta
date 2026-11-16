import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, useId } from 'react';

const base =
  'h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3';
const ok = 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10';
const bad = 'border-red-400 focus:border-red-300 focus:ring-red-500/10';

function Wrapper({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({ label, error, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint}>
      <input id={id} className={`${base} ${error ? bad : ok}`} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props} />
    </Wrapper>
  );
}

export function TextArea({ label, error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error}>
      <textarea id={id} rows={3} className={`${base} h-auto ${error ? bad : ok}`} aria-invalid={!!error} {...props} />
    </Wrapper>
  );
}

export function SelectField({
  label,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error}>
      <select id={id} className={`${base} pr-10 ${error ? bad : ok}`} aria-invalid={!!error} {...props}>
        {children}
      </select>
    </Wrapper>
  );
}
