import { Card } from '@/components/ui/Card';
import { ROSTER, winChance } from '@/lib/roster';

const POWERS = Array.from({ length: 10 }, (_, i) => i + 1);
const LEVELS = [1, 5, 10];

function tone(chance: number) {
  if (chance >= 60) return 'text-green';
  if (chance >= 35) return 'text-warning';
  return 'text-danger';
}

export function PowerLegend() {
  return (
    <Card className="p-5 lg:p-6">
      <h2 className="font-display text-h3 text-fg">Roster and power</h2>
      <p className="mt-1 text-fg-muted">
        Hero = genes mod 6. Power = last digit of genes + 1, from 1 (weakest) to 10 (strongest).
      </p>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Hero roster">
        {ROSTER.map((hero) => (
          <li
            key={hero.index}
            className="flex items-center gap-2 rounded-full border border-line bg-panel-2 px-3 py-1.5 text-label font-display uppercase tracking-[0.08em] text-fg-muted"
          >
            <span
              aria-hidden
              className="size-3 rounded-full ring-1 ring-line-strong"
              style={{ background: `linear-gradient(135deg, ${hero.color} 50%, ${hero.accent} 50%)` }}
            />
            {hero.name}
          </li>
        ))}
      </ul>

      <div
        className="mt-5 overflow-x-auto rounded-lg border border-line"
        role="region"
        aria-label="Win chance by zombie level and Avenger power"
        tabIndex={0}
      >
        <table className="w-full min-w-[34rem] border-collapse text-center text-body">
          <caption className="sr-only">Win chance in percent by zombie level and Avenger power</caption>
          <thead>
            <tr className="bg-panel-2 text-label font-display uppercase tracking-[0.08em] text-fg-muted">
              <th scope="col" className="px-3 py-2 text-left">Zombie level</th>
              {POWERS.map((p) => (
                <th key={p} scope="col" className="px-2 py-2">
                  P{p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((level) => (
              <tr key={level} className="border-t border-line">
                <th scope="row" className="px-3 py-2 text-left font-display text-fg">
                  Level {level}
                </th>
                {POWERS.map((p) => {
                  const chance = winChance(level, p);
                  return (
                    <td key={p} className={`px-2 py-2 font-mono tabular-nums ${tone(chance)}`}>
                      {chance}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-label text-fg-muted">
        Win chance = 50 + 5 x level - 5 x power, clamped to 10 to 90 percent. Each fight costs a one-day cooldown.
      </p>
    </Card>
  );
}
