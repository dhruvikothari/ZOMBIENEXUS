import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { NAV_ITEMS, isNavActive } from '@/components/layout/Sidebar';

const ITEMS = NAV_ITEMS.slice(0, 5);

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isNavActive(to, pathname);
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 text-label font-medium transition-colors duration-200 ${active ? 'text-green' : 'text-fg-muted'}`}
              >
                {active && (
                  <motion.span
                    layoutId="bottomnav-active"
                    className="absolute top-0 h-0.5 w-10 rounded-full bg-green shadow-[0_0_12px_var(--color-green)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon className={`size-5 ${active ? 'drop-shadow-[0_0_6px_var(--color-green-glow)]' : ''}`} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
