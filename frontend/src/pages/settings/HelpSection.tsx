import { Images, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router';
import { Address } from '@/components/ui/Address';
import { buttonClass } from '@/components/ui/Button';
import type { Deployment } from '@/lib/types';
import { Row, Section } from './Section';

export function HelpSection({ dep }: { dep: Deployment | null }) {
  return (
    <Section icon={<LifeBuoy />} title="MetaMask help">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div>
          <h3 className="mb-3 font-display font-bold">Add the network manually</h3>
          <dl>
            <Row label="Network name">
              <Address address={dep?.networkName ?? 'Ganache 1337 (ZOMBIENEXUS)'} short={false} copy />
            </Row>
            <Row label="RPC URL">
              <Address address={dep?.rpcUrl ?? 'http://127.0.0.1:7545'} short={false} copy />
            </Row>
            <Row label="Chain ID">
              <Address address={String(dep?.chainId ?? 1337)} short={false} copy />
            </Row>
            <Row label="Currency symbol">
              <Address address="ETH" short={false} copy />
            </Row>
          </dl>
          <p className="mt-3 text-sm text-fg-muted">
            Already have a chain 1337 entry such as "Localhost 8545"? Edit its RPC URL to the one above instead of adding a second network.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="mb-3 font-display font-bold">Transactions fail with a nonce error?</h3>
            <p className="text-fg-muted">
              After the local chain is reset or restored, MetaMask remembers old nonces. Open MetaMask, then{' '}
              <strong className="font-semibold text-fg">Settings, Advanced, Clear activity tab data</strong>, and retry. This only clears local history for the selected network.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-display font-bold">More</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/gallery" className={buttonClass('secondary', 'md')}>
                <Images className="size-4" aria-hidden="true" />
                Open Gallery
              </Link>
              <a href="/legacy/" className={buttonClass('secondary', 'md')}>
                Legacy page
              </a>
            </div>
            <p className="mt-2 text-sm text-fg-muted">The Gallery needs no wallet. The legacy page is the original starter UI served next to this app.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
