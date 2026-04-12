import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const inputVariants = cva(
  'w-full rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 shadow-[0_1px_3px_rgba(16,24,40,0.05)] dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500',
  {
    variants: {
      variant: {
        default: 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-700 dark:focus:border-primary-400',
        error:   'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30 dark:bg-red-900/10',
        success: 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-900/10',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      helperText,
      leftAddon,
      rightAddon,
      hint,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const effectiveVariant = error ? 'error' : variant;

    return (
      <div className="w-full">
        {(label || hint) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && (
              <label
                htmlFor={inputId}
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {label}
                {props.required && (
                  <span className="text-red-500 ml-0.5">*</span>
                )}
              </label>
            )}
            {hint && (
              <span className="text-xs text-gray-400 dark:text-gray-500">{hint}</span>
            )}
          </div>
        )}
        <div className="relative">
          {leftAddon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              {leftAddon}
            </div>
          )}
          <input
            id={inputId}
            className={inputVariants({
              variant: effectiveVariant,
              size,
              className: [
                leftAddon  ? 'pl-10' : '',
                rightAddon ? 'pr-10' : '',
                className,
              ].filter(Boolean).join(' '),
            })}
            ref={ref}
            {...props}
          />
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
              {rightAddon}
            </div>
          )}
          {error && !rightAddon && (
            <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400 pointer-events-none" />
          )}
        </div>
        {error && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ─── TextArea ─── */
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 shadow-[0_1px_3px_rgba(16,24,40,0.05)] resize-none dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:focus:border-primary-400 dark:placeholder:text-gray-500 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''} ${className ?? ''}`}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

/* ─── Select ─── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder = 'Select an option', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          id={inputId}
          className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 shadow-[0_1px_3px_rgba(16,24,40,0.05)] dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 ${error ? 'border-red-400 focus:border-red-500' : ''} ${className ?? ''}`}
          ref={ref}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
