import { useId } from 'react';
import type { ComponentProps } from 'react';

export type InputProps = Omit<ComponentProps<'input'>, 'className'> & {
  label: string;
  hint?: string;
  error?: string;
  mono?: boolean;
  /** Applied to the wrapper (layout), not the <input>. */
  className?: string;
};

export function Input({ label, hint, error, mono = false, className, id, ...rest }: InputProps) {
  const uid = useId();
  const inputId = id ?? `in-${uid}`;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <label htmlFor={inputId} className="font-display text-label font-medium uppercase tracking-[0.08em] text-fg-muted">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-11 w-full rounded-md border bg-panel-2 px-3.5 text-fg placeholder:text-fg-faint transition-[border-color,box-shadow] duration-200 hover:border-line-strong focus-visible:border-green focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--color-green-glow)] disabled:cursor-not-allowed disabled:opacity-50 ${
          mono ? 'font-mono text-[0.8125rem]' : ''
        } ${error ? 'border-danger' : 'border-line'}`}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-label text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-label text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
