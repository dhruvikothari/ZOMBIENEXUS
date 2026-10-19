import { StatusBanner } from '@/components/layout/StatusBanner';
import { useWallet } from '@/lib/wallet';
import { Army } from './home/Army';
import { HeroPanel } from './home/HeroPanel';

export default function HomePage() {
  const { status, address } = useWallet();
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <StatusBanner />
      {status === 'ready' && address ? <Army address={address} /> : <HeroPanel />}
    </div>
  );
}
