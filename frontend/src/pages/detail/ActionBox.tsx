import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TxStepper } from '@/components/ui/TxStepper';
import type { TxState, Zombie } from '@/lib/types';

export type PanelProps = { zombie: Zombie; onDone: () => void };

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  tx: TxState;
  /** Reason the action is unavailable (rendered as visible text). */
  hint?: string | null;
  children: ReactNode;
};

export function ActionBox({ icon, title, description, tx, hint, children }: Props) {
  return (
    <Card className="space-y-4 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-raised text-green">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-h3 font-bold">{title}</h3>
          <p className="text-sm text-fg-muted">{description}</p>
        </div>
      </div>
      {children}
      {hint && (
        <p className="flex items-start gap-1.5 text-label text-fg-muted">
          <Info size={14} className="mt-px shrink-0" aria-hidden />
          {hint}
        </p>
      )}
      {tx.status !== 'idle' && <TxStepper state={tx} compact />}
    </Card>
  );
}
