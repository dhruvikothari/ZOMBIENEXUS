const ROUND = { md: 'rounded-md', xl: 'rounded-xl', full: 'rounded-full' };

export function Skeleton({ className, rounded = 'md' }: { className?: string; rounded?: 'md' | 'xl' | 'full' }) {
  return <div aria-hidden="true" className={`skeleton ${ROUND[rounded]} ${className ?? 'h-4 w-full'}`} />;
}
