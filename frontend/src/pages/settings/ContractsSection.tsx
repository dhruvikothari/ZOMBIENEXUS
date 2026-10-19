import { FileCode2 } from 'lucide-react';
import { Address } from '@/components/ui/Address';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Deployment } from '@/lib/types';
import { Row, Section } from './Section';

const CONTRACTS = ['ZombieOwnership', 'AvengerContract'] as const;

export function ContractsSection({ dep }: { dep: Deployment | null }) {
  return (
    <Section icon={<FileCode2 />} title="Contracts">
      {dep ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {CONTRACTS.map((name) => (
            <dl key={name}>
              <Row label="Contract">
                <span className="font-display font-bold">{name}</span>
              </Row>
              <Row label="Address">
                <Address address={dep.contracts[name].address} short={false} copy />
              </Row>
            </dl>
          ))}
          <dl className="lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-6">
            <Row label="Deployed at block">
              <span className="font-mono">{dep.deployedAtBlock}</span>
            </Row>
            <Row label="deployment.json generated">
              <time dateTime={dep.generatedAt} className="text-sm">
                {new Date(dep.generatedAt).toLocaleString()}
              </time>
            </Row>
          </dl>
        </div>
      ) : (
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-full" />
        </div>
      )}
    </Section>
  );
}
