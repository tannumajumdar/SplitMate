import React from 'react';
import { cn } from '../../utils/helpers';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  fullWidth = true,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border bg-white dark:bg-slate-800 px-3 h-11 transition-colors',
          error
            ? 'border-rose-400 focus-within:ring-rose-400/30'
            : 'border-slate-200 dark:border-slate-700 focus-within:border-primary-400 focus-within:ring-primary-400/20',
          'focus-within:ring-2',
          props.disabled && 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900'
        )}
      >
        {prefix && (
          <span className="text-slate-400 dark:text-slate-500 shrink-0 text-sm">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none min-w-0',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="text-slate-400 dark:text-slate-500 shrink-0 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  hint,
  fullWidth = true,
  options,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'rounded-xl border h-11 px-3 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors',
          error
            ? 'border-rose-400'
            : 'border-slate-200 dark:border-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20',
          props.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function TextArea({ label, error, hint, className, id, ...props }: TextAreaProps) {
  const taId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={taId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={taId}
        className={cn(
          'w-full rounded-xl border px-3 py-2.5 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-colors resize-none',
          error
            ? 'border-rose-400'
            : 'border-slate-200 dark:border-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
