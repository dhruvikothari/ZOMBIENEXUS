import { Skeleton } from '@/components/ui/Skeleton';

export function DetailSkeleton() {
  return (
    <div aria-hidden className="space-y-6">
      <Skeleton rounded="xl" className="h-[420px]" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div className="space-y-6">
          <Skeleton rounded="xl" className="h-40" />
          <Skeleton rounded="xl" className="h-96" />
        </div>
        <div className="space-y-4">
          <Skeleton rounded="xl" className="h-44" />
          <Skeleton rounded="xl" className="h-60" />
          <Skeleton rounded="xl" className="h-60" />
        </div>
      </div>
    </div>
  );
}
