import { useId } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { motion } from 'motion/react';

type Tab = { id: string; label: string; icon?: ReactNode };

export function Tabs({ tabs, value, onChange, children }: { tabs: Tab[]; value: string; onChange: (id: string) => void; children?: ReactNode }) {
  const uid = useId();
  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = `${uid}-panel`;

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = tabs.findIndex((t) => t.id === value);
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(tabs[next].id);
    document.getElementById(tabId(tabs[next].id))?.focus();
  }

  return (
    <div>
      <div role="tablist" onKeyDown={onKeyDown} className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-panel p-1">
        {tabs.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              id={tabId(t.id)}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={children ? panelId : undefined}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(t.id)}
              className={`relative inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 font-display text-sm font-bold whitespace-nowrap transition-colors duration-200 ${
                active ? 'text-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`${uid}-pill`}
                  className="absolute inset-0 rounded-lg border border-green/40 bg-raised shadow-[0_0_18px_var(--color-green-glow)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span className={`relative inline-flex items-center gap-2 [&_svg]:size-4 ${active ? '[&_svg]:text-green' : ''}`}>
                {t.icon}
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
      {children && (
        <div role="tabpanel" id={panelId} aria-labelledby={tabId(value)} className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
}
