import { motion } from 'motion/react';
import { CircleCheck, CircleX, LoaderCircle, TriangleAlert } from 'lucide-react';
import type { TxState } from '@/lib/types';
import { Address } from '@/components/ui/Address';

const STEPS = ['Sign in wallet', 'Pending', 'Confirmed'];

type Fail = { index: number; tone: 'danger' | 'warning'; label: string };

// current = index of the active step (3 = all done); fail = the step where it stopped.
function progress(state: TxState): { current: number; fail: Fail | null } | null {
  switch (state.status) {
    case 'idle':
      return null;
    case 'awaiting-signature':
      return { current: 0, fail: null };
    case 'pending':
      return { current: 1, fail: null };
    case 'confirmed':
      return { current: 3, fail: null };
    case 'rejected':
      return { current: 0, fail: { index: 0, tone: 'warning', label: 'Rejected' } };
    case 'reverted':
      return { current: 0, fail: { index: state.hash ? 2 : 0, tone: 'danger', label: 'Reverted' } };
    case 'failed':
      return { current: 0, fail: { index: state.hash ? 1 : 0, tone: 'danger', label: 'Failed' } };
  }
}

function StepIcon({ kind, tone }: { kind: 'done' | 'active' | 'todo' | 'fail'; tone?: Fail['tone'] }) {
  if (kind === 'done') return <CircleCheck className="size-5 text-green" aria-hidden="true" />;
  if (kind === 'active') return <LoaderCircle className="size-5 animate-spin text-green" aria-hidden="true" />;
  if (kind === 'fail') {
    return tone === 'warning' ? <TriangleAlert className="size-5 text-warning" aria-hidden="true" /> : <CircleX className="size-5 text-danger" aria-hidden="true" />;
  }
  return <span className="size-5 rounded-full border-2 border-line-strong" aria-hidden="true" />;
}

export function TxStepper({ state, compact = false }: { state: TxState; compact?: boolean }) {
  const p = progress(state);
  if (!p) return null;
  const { current, fail } = p;
  const border = fail ? (fail.tone === 'warning' ? 'border-warning/40' : 'border-danger/40') : state.status === 'confirmed' ? 'border-green/40' : 'border-line';

  return (
    <div role="status" aria-live="polite" className={`rounded-lg border bg-panel-2/70 transition-colors duration-200 ${border} ${compact ? 'space-y-2 p-3' : 'space-y-3 p-4'}`}>
      {!compact && state.label && <p className="font-display text-sm font-bold">{state.label}</p>}

      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {STEPS.map((name, i) => {
          const kind = fail ? (i < fail.index ? 'done' : i === fail.index ? 'fail' : 'todo') : i < current ? 'done' : i === current ? 'active' : 'todo';
          const text = kind === 'fail' && fail ? fail.label : name;
          return (
            <li key={name} className="flex items-center gap-3 sm:flex-1 sm:last:flex-none" aria-current={kind === 'active' ? 'step' : undefined}>
              <span className="flex items-center gap-2">
                <StepIcon kind={kind} tone={fail?.tone} />
                <span className={`${compact ? 'text-label' : 'text-sm'} font-medium ${kind === 'todo' ? 'text-fg-muted' : 'text-fg'}`}>{text}</span>
              </span>
              {i < STEPS.length - 1 && (
                <span className="relative hidden h-0.5 min-w-4 flex-1 overflow-hidden rounded-full bg-line sm:block" aria-hidden="true">
                  <motion.span
                    className="absolute inset-0 origin-left bg-green"
                    initial={false}
                    animate={{ scaleX: kind === 'done' ? 1 : 0 }}
                    transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {fail && <p className={`text-sm ${fail.tone === 'warning' ? 'text-warning' : 'text-danger'}`}>{state.error?.message ?? 'The transaction reverted on-chain.'}</p>}

      {state.hash && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-fg-muted">
          <span className="font-display font-medium uppercase tracking-[0.08em]">Tx</span>
          <Address address={state.hash} copy />
          {state.receipt && <span>Block {state.receipt.blockNumber}</span>}
        </div>
      )}
    </div>
  );
}
