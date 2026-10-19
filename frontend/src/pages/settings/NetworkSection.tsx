import { Server } from 'lucide-react';
import { Address } from '@/components/ui/Address';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Deployment } from '@/lib/types';
import { Row, Section } from './Section';

export function NetworkSection({ dep }: { dep: Deployment | null }) {
  return (
    <Section icon={<Server />} title="Network">
      {dep ? (
        <dl>
          <Row label="Name">{dep.networkName}</Row>
          <Row label="Chain ID">
            <span className="font-mono">{dep.chainId}</span>
          </Row>
          <Row label="RPC URL">
            <Address address={dep.rpcUrl} short={false} copy />
          </Row>
        </dl>
      ) : (
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-4/5" />
        </div>
      )}
    </Section>
  );
}
