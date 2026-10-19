import type { ReactNode } from 'react';

export type PickerItem = { value: string; title: string; sub: string; art: ReactNode; disabled?: boolean };

// Native radio group: keyboard (arrows, space), disabled items and form semantics come for free.
// A native <select> cannot disable individual options through the UI-kit Select, hence this picker.
export function Picker({
  legend,
  name,
  items,
  value,
  onChange,
  tone = 'green',
}: {
  legend: string;
  name: string;
  items: PickerItem[];
  value: string;
  onChange: (value: string) => void;
  tone?: 'green' | 'purple';
}) {
  const checked = tone === 'green' ? 'peer-checked:border-green peer-checked:shadow-glow-green' : 'peer-checked:border-purple peer-checked:shadow-glow-purple';
  const focus = tone === 'green' ? 'peer-focus-visible:outline-green' : 'peer-focus-visible:outline-purple';
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 font-display text-label uppercase tracking-[0.08em] text-fg-muted">{legend}</legend>
      <div className="grid max-h-80 gap-2 overflow-y-auto p-1 sm:grid-cols-2">
        {items.map((it) => (
          <label key={it.value} className="relative block min-w-0">
            <input
              type="radio"
              name={name}
              value={it.value}
              checked={value === it.value}
              disabled={it.disabled}
              onChange={() => onChange(it.value)}
              className="peer sr-only"
            />
            <span
              className={`flex min-h-[4.5rem] cursor-pointer items-center gap-3 rounded-lg border border-line bg-panel-2 p-2.5 transition-[border-color,box-shadow,background-color] duration-200 hover:border-line-strong hover:bg-raised peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-60 peer-disabled:hover:border-line peer-disabled:hover:bg-panel-2 ${checked} ${focus}`}
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg/60">{it.art}</span>
              <span className="min-w-0">
                <span className="block truncate font-display text-body font-medium text-fg">{it.title}</span>
                <span className="block truncate text-label text-fg-muted">{it.sub}</span>
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
