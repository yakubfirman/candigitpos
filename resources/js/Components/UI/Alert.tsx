import { cn } from '@/Utils/cn';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const typeStyles: Record<string, { bg: string; border: string; text: string; title: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    title: 'text-green-900',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    title: 'text-red-900',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    title: 'text-amber-900',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    title: 'text-blue-900',
  },
};

export function Alert({ type = 'info', title, children, className, onClose }: AlertProps) {
  const styles = typeStyles[type];

  return (
    <div className={cn('rounded-lg border p-3', styles.bg, styles.border, className)}>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          {title && <p className={cn('font-medium', styles.title)}>{title}</p>}
          <div className={cn('text-sm', styles.text)}>{children}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className={cn('rounded p-1 hover:bg-black/5', styles.text)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}