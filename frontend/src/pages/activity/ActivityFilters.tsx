import { FILTERS, type FilterId } from './eventMeta';

export function ActivityFilters({
  value,
  counts,
  onChange,
}: {
  value: FilterId;
  counts: Record<FilterId, number> | null;
  onChange: (id: FilterId) => void;
}) {
  return (
    <div role="group" aria-label="Filter events" className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-1 pb-1 lg:mx-0 lg:px-0">
      {FILTERS.map((f) => {
        const active = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(f.id)}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 font-display text-sm font-bold transition-[background-color,border-color,color,box-shadow] duration-200 ${
              active
                ? 'border-green/60 bg-green/10 text-green shadow-glow-green'
                : 'border-line bg-panel text-fg-muted hover:border-line-strong hover:bg-raised hover:text-fg'
            }`}
          >
            {f.label}
            {counts && <span className="font-mono text-label tabular-nums opacity-80">{counts[f.id]}</span>}
          </button>
        );
      })}
    </div>
  );
}
