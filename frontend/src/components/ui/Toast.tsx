import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react';
import { Address } from '@/components/ui/Address';

export type ToastInput = { kind: 'info' | 'success' | 'error' | 'warning'; title: string; description?: string; hash?: string };
type ToastApi = { toast: (t: ToastInput) => void };

const META = {
  info: { Icon: Info, text: 'text-info', bar: 'bg-info' },
  success: { Icon: CircleCheck, text: 'text-green', bar: 'bg-green' },
  error: { Icon: CircleX, text: 'text-danger', bar: 'bg-danger' },
  warning: { Icon: TriangleAlert, text: 'text-warning', bar: 'bg-warning' },
} as const;

const MAX_TOASTS = 4;
const durationFor = (kind: ToastInput['kind']) => (kind === 'error' ? 8000 : 5000);

/** One toast view. Pass `duration` (ms) to draw the countdown line; dismissal timing is the caller's job. */
export function Toast({ kind, title, description, hash, onClose, duration }: ToastInput & { onClose?: () => void; duration?: number }) {
  const { Icon, text, bar } = META[kind];
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className="glass relative flex items-start gap-3 overflow-hidden rounded-lg py-3.5 pr-2 pl-4 shadow-card"
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${text}`} aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-display text-sm font-bold">{title}</p>
        {description && <p className="text-sm text-fg-muted">{description}</p>}
        {hash && <Address address={hash} copy />}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="grid size-10 shrink-0 place-items-center rounded-lg text-fg-muted transition-colors duration-200 hover:bg-raised hover:text-fg"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
      {duration && (
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-0.5 origin-left ${bar}`}
          style={{ animation: `toast-progress ${duration}ms linear forwards` }}
        />
      )}
    </div>
  );
}

type Item = ToastInput & { id: number };

function ToastItem({ item, dismiss }: { item: Item; dismiss: (id: number) => void }) {
  const duration = durationFor(item.kind);
  useEffect(() => {
    const t = window.setTimeout(() => dismiss(item.id), duration);
    return () => window.clearTimeout(t);
  }, [item.id, duration, dismiss]);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 32, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ opacity: 0, x: 32, transition: { duration: 0.15 } }}
      className="pointer-events-auto"
    >
      <Toast kind={item.kind} title={item.title} description={item.description} hash={item.hash} duration={duration} onClose={() => dismiss(item.id)} />
    </motion.div>
  );
}

const ToastContext = createContext<ToastApi>({ toast: () => {} });

export function ToastProvider({ children }: { children?: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setItems((s) => s.filter((t) => t.id !== id)), []);
  const toast = useCallback((t: ToastInput) => {
    const id = ++nextId.current;
    setItems((s) => [...s.slice(1 - MAX_TOASTS), { ...t, id }]);
  }, []);
  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        role="region"
        className="pointer-events-none fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[70] flex flex-col gap-2 sm:left-auto sm:w-96 lg:right-6 lg:bottom-6"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <ToastItem key={item.id} item={item} dismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}
