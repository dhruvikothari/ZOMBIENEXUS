import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Activity, Biohazard, FlaskConical, Images, Settings, Shield, Skull, Swords } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useHead } from '@/lib/chain';

export type NavItem = { to: string; label: string; icon: LucideIcon };

// Order matters: BottomNav shows the first five.
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Army', icon: Skull },
  { to: '/create', label: 'Factory', icon: FlaskConical },
  { to: '/avengers', label: 'Avengers', icon: Shield },
  { to: '/battle', label: 'Battle', icon: Swords },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/gallery', label: 'Gallery', icon: Images },
  { to: '/settings', label: 'Settings', icon: Settings },
];

// A zombie detail page belongs to the Army section.
export function isNavActive(to: string, pathname: string): boolean {
  if (to === '/') return pathname === '/' || pathname.startsWith('/zombie/');
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-green text-on-accent shadow-glow-green">
        <Biohazard className="size-5" aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        ZOMBIE<span className="text-green">NEXUS</span>
      </span>
    </span>
  );
}

export function Sidebar() {
  const { pathname } = useLocation();
  const head = useHead();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-panel/80 backdrop-blur-xl lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
        <Link to="/" aria-label="ZOMBIENEXUS home" className="rounded-lg">
          <Logo />
        </Link>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = isNavActive(to, pathname);
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex h-11 items-center gap-3 rounded-lg px-3 font-display text-sm font-bold transition-colors duration-200 ${
                    active ? 'text-fg' : 'text-fg-muted hover:bg-raised/60 hover:text-fg'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg border border-green/30 bg-raised shadow-[0_0_20px_rgb(57_255_136/0.18)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    >
                      <span className="absolute top-2.5 bottom-2.5 left-0 w-0.5 rounded-full bg-green shadow-[0_0_8px_var(--color-green)]" />
                    </motion.span>
                  )}
                  <Icon
                    className={`relative size-[1.125rem] transition-colors duration-200 ${active ? 'text-green drop-shadow-[0_0_6px_var(--color-green-glow)]' : 'group-hover:text-fg'}`}
                    aria-hidden="true"
                  />
                  <span className="relative">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex shrink-0 items-center gap-2 border-t border-line px-5 py-4 font-mono text-[0.8125rem] text-fg-muted">
        <span className={`size-2 rounded-full ${head ? 'bg-green shadow-[0_0_8px_var(--color-green)]' : 'bg-fg-faint'}`} aria-hidden="true" />
        {head ? `Block #${head.blockNumber}` : 'Reading chain…'}
      </div>
    </aside>
  );
}
