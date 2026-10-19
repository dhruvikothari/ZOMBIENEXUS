import { Component, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { TriangleAlert } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { buttonClass } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import HomePage from '@/pages/HomePage';
import CreatePage from '@/pages/CreatePage';
import ZombieDetailPage from '@/pages/ZombieDetailPage';
import AvengersPage from '@/pages/AvengersPage';
import BattlePage from '@/pages/BattlePage';
import ActivityPage from '@/pages/ActivityPage';
import SettingsPage from '@/pages/SettingsPage';
import GalleryPage from '@/pages/GalleryPage';
import NotFoundPage from '@/pages/NotFoundPage';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(e: Error) {
    console.error(e);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <EmptyState
        icon={<TriangleAlert className="size-6" aria-hidden="true" />}
        title="Something broke"
        description="This page hit an unexpected error."
        action={
          <button type="button" className={buttonClass('primary', 'sm')} onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        }
      />
    );
  }
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // The exiting page keeps its own frozen location so it does not flash the next route while fading out.
  return (
    <AppShell>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
        >
          <ErrorBoundary key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/zombie/:id" element={<ZombieDetailPage />} />
            <Route path="/avengers" element={<AvengersPage />} />
            <Route path="/battle" element={<BattlePage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
