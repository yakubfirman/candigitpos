import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/Utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 rounded-xl border border-stone-200 bg-stone-50/50 px-4 text-sm text-stone-800 shadow-sm',
            'placeholder:text-stone-400',
            'focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white',
            'transition-all duration-200',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';