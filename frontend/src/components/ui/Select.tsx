import { useId } from 'react';
import type { ComponentProps } from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectProps = Omit<ComponentProps<'select'>, 'className' | 'children'> & {
  label: string;
  options: { value: string; label: string }[];
  /** Applied to the wrapper (layout), not the <select>. */
  className?: string;
};

export function Select({ label, options, className, id, ...rest }: SelectProps) {
  const uid = useId();
  const selectId = id ?? `sel-${uid}`;
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <label htmlFor={selectId} className="font-display text-label font-medium uppercase tracking-[0.08em] text-fg-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className="h-11 w-full appearance-none rounded-md border border-line bg-panel-2 pr-10 pl-3.5 text-fg transition-[border-color,box-shadow] duration-200 hover:border-line-strong focus-visible:border-green focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--color-green-glow)] disabled:cursor-not-allowed disabled:opacity-50"
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
      </div>
    </div>
  );
}
