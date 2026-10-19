import { Link } from 'react-router';
import { Skull } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFoundPage() {
  return (
    <>
    <h1 className="sr-only">Page not found</h1>
    <EmptyState
      icon={<Skull />}
      title="This crypt is empty."
      description="Nothing was buried at this address. Head back to your army."
      action={
        <Link to="/" className={buttonClass('primary', 'md')}>
          Back to Army
        </Link>
      }
    />
    </>
  );
}
