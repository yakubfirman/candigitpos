import { cn } from '@/Utils/cn';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn('overflow-x-auto w-full', className)}>
      <table className="w-full text-left text-sm text-stone-600 whitespace-nowrap">{children}</table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-stone-50 border-b border-stone-100">
      <tr>{children}</tr>
    </thead>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
  return (
    <th className={cn('px-6 py-4 text-left font-semibold text-stone-600', className)}>
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-stone-100 bg-white">{children}</tbody>;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function TableRow({ children, className }: TableRowProps) {
  return <tr className={cn('hover:bg-stone-50/50 transition-colors', className)}>{children}</tr>;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
  return <td className={cn('px-6 py-4 text-stone-600', className)}>{children}</td>;
}