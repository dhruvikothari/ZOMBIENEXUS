import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { buttonClass } from '@/components/ui/Button';
import type { ButtonVariant } from '@/components/ui/Button';

// Router link styled like Button (a <button> inside a <Link> is invalid HTML).
export function LinkButton({ to, variant = 'primary', icon, children }: { to: string; variant?: ButtonVariant; icon?: ReactNode; children: ReactNode }) {
  return (
    <Link to={to} className={`${buttonClass(variant)} gap-2`}>
      {icon}
      {children}
    </Link>
  );
}
