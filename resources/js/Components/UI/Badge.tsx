import { cn } from '@/Utils/cn';

type BadgeVariant = 'green' | 'red' | 'amber' | 'stone' | 'blue';

const variants: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-800',
  stone: 'bg-stone-100 text-stone-700',
  blue: 'bg-blue-100 text-blue-800',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'stone', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}