import React from 'react';
import { cn } from '../../utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export default function Card({
  children,
  className,
  hover = false,
  gradient = false,
  padding = 'md',
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-slate-100 dark:border-slate-700/60',
        gradient
          ? 'bg-gradient-card dark:bg-gradient-card-dark'
          : 'bg-white dark:bg-slate-800',
        'shadow-card',
        hover &&
          'cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
