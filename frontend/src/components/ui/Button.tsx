import type { ComponentProps, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-green text-on-accent enabled:hover:shadow-glow-green enabled:hover:brightness-110',
  secondary: 'border border-line-strong bg-transparent text-fg enabled:hover:border-green/60 enabled:hover:bg-raised',
  ghost: 'bg-transparent text-fg-muted enabled:hover:bg-raised enabled:hover:text-fg',
  danger: 'bg-danger text-on-accent enabled:hover:brightness-110 enabled:hover:shadow-[0_0_24px_rgb(255_92_108/0.35)]',
  gold: 'bg-gold text-on-accent enabled:hover:shadow-glow-gold enabled:hover:brightness-110',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-10 gap-1.5 px-3 text-sm',
  md: 'h-11 gap-2 px-5 text-[0.9375rem]',
  lg: 'h-12 gap-2.5 px-6 text-base',
};

// Exported so a router <Link> can look like a button without nesting interactive elements.
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', fullWidth = false): string {
  return [
    'inline-flex shrink-0 items-center justify-center rounded-lg font-display font-bold tracking-tight whitespace-nowrap select-none',
    'transition-[transform,box-shadow,background-color,border-color,color,filter] duration-200 ease-out-expo',
    'enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
    VARIANT[variant],
    SIZE[size],
    fullWidth ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function Button({ variant = 'primary', size = 'md', loading = false, icon, fullWidth = false, className, children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${buttonClass(variant, size, fullWidth)} ${className ?? ''}`}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}
