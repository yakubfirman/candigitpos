import { ReactNode, useEffect } from 'react';
import { cn } from '@/Utils/cn';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizes: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, icon, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={cn(
          'relative w-full rounded-2xl bg-white shadow-2xl border border-stone-200/80',
          'animate-in fade-in zoom-in-95 duration-200',
          'max-h-[90vh] flex flex-col overflow-hidden',
          sizes[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 shrink-0 bg-stone-50/60">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 shrink-0">
                  {icon}
                </div>
              )}
              <h3 className="text-base font-bold text-stone-800 leading-tight">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="ml-4 shrink-0 rounded-xl p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-all duration-150"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}