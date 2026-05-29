import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/Utils/cn';

interface DropdownItem {
  label: string;
  onClick?: () => void;
  href?: string;
  divider?: boolean;
  className?: string;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            'absolute z-10 mt-1 min-w-[160px] rounded-lg border border-stone-200 bg-white py-1 shadow-md',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) =>
            item.divider ? (
              <div key={index} className="my-1 border-t border-stone-200" />
            ) : (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-100',
                  item.className
                )}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}