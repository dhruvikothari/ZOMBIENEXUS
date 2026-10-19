import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Biohazard, Settings } from 'lucide-react';
import { NetworkBadge } from '@/components/layout/NetworkBadge';
import { WalletPill } from '@/components/layout/WalletPill';
import { NAV_ITEMS, isNavActive } from '@/components/layout/Sidebar';

function titleFor(pathname: string): string {
  if (pathname.startsWith('/zombie/')) return `Zombie #${pathname.split('/')[2]}`;
  return NAV_ITEMS.find((i) => isNavActive(i.to, pathname))?.label ?? 'Not found';
}

export function Header() {
  const { pathname } = useLocation();
  const title = titleFor(pathname);

  useEffect(() => {
    document.title = `${title} · ZOMBIENEXUS`;
  }, [title]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" aria-label="ZOMBIENEXUS home" className="grid size-8 shrink-0 place-items-center rounded-lg bg-green text-on-accent shadow-glow-green max-sm:hidden lg:hidden">
            <Biohazard className="size-5" aria-hidden="true" />
          </Link>
          <p className="truncate font-display text-h3 font-bold">{title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <NetworkBadge />
          <WalletPill />
          <Link
            to="/settings"
            aria-label="Settings"
            className="grid size-10 place-items-center rounded-full border border-line text-fg-muted transition-colors duration-200 hover:border-line-strong hover:text-fg lg:hidden"
          >
            <Settings className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
