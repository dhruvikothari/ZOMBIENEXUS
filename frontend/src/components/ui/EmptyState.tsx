import type { ReactNode } from 'react';

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="glass flex flex-col items-center gap-4 px-6 py-12 text-center sm:py-16">
      <span
        className="grid size-16 place-items-center rounded-full border border-line-strong bg-raised text-green shadow-glow-green [&_svg]:size-7"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="max-w-md space-y-1.5">
        <h2 className="font-display text-h3 font-bold">{title}</h2>
        <p className="text-fg-muted">{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
