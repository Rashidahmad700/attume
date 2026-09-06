import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Container({
  as: Tag = 'div',
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={cn('mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12', className)}>
      {children}
    </Tag>
  );
}
