import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { FILTERS, SORT_OPTIONS, type FilterKey, type SortKey } from './armyUtils';

type Props = {
  sort: SortKey;
  onSort: (s: SortKey) => void;
  filter: FilterKey;
  onFilter: (f: FilterKey) => void;
  counts: Record<FilterKey, number>;
  onRefresh: () => void;
  refreshing: boolean;
};

export function ArmyToolbar({ sort, onSort, filter, onFilter, counts, onRefresh, refreshing }: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div
        role="group"
        aria-label="Filter zombies"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => onFilter(f.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${
                active
                  ? 'border-green/60 bg-green/10 text-green'
                  : 'border-line bg-panel text-fg-muted hover:border-line-strong hover:text-fg'
              }`}
            >
              {f.label}
              <span className="text-label tabular-nums opacity-70">{counts[f.id]}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
          <Select
            label="Sort by"
            options={SORT_OPTIONS}
            value={sort}
            onChange={(e) => onSort(e.target.value as SortKey)}
          />
        </div>
        <Button variant="secondary" icon={<RefreshCw size={16} aria-hidden />} loading={refreshing} onClick={onRefresh}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
