import { StatusBanner } from '@/components/layout/StatusBanner';
import { Card } from '@/components/ui/Card';
import { useWallet } from '@/lib/wallet';
import { ContractsSection } from './settings/ContractsSection';
import { Diagnostics } from './settings/Diagnostics';
import { HelpSection } from './settings/HelpSection';
import { NetworkSection } from './settings/NetworkSection';
import { WalletSection } from './settings/WalletSection';

export default function SettingsPage() {
  const { deployment, status } = useWallet();
  // The wallet reports rpc-down when deployment.json is missing; without this the sections would skeleton forever.
  const missing = !deployment && status === 'rpc-down';

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <StatusBanner />

      <header>
        <p className="font-display text-label font-medium uppercase tracking-[0.08em] text-green">Environment</p>
        <h1 className="mt-1 font-display text-h1 font-bold">Settings</h1>
        <p className="mt-2 max-w-prose text-fg-muted">Where this app points, what is deployed, and whether everything is wired up.</p>
      </header>

      {missing && (
        <div role="alert">
          <Card className="p-5 sm:p-6">
            <p className="font-display text-h3 font-bold">Deployment info not available</p>
            <p className="mt-1 text-fg-muted">
              <code className="font-mono">deployment.json</code> could not be loaded. Start everything with <code className="font-mono">npm run demo</code>.
            </p>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <NetworkSection dep={deployment} />
        <WalletSection />
      </div>
      <ContractsSection dep={deployment} />
      <Diagnostics dep={deployment} />
      <HelpSection dep={deployment} />
    </div>
  );
}
