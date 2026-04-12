import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 active:from-primary-800 active:to-primary-700 shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0 focus-visible:ring-primary-500',
        secondary:
          'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 hover:-translate-y-px active:translate-y-0 focus-visible:ring-secondary-400',
        outline:
          'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600 active:bg-primary-100 hover:-translate-y-px active:translate-y-0 focus-visible:ring-primary-500',
        ghost:
          'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-400',
        danger:
          'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0 focus-visible:ring-red-500',
        success:
          'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0 focus-visible:ring-emerald-500',
        subtle:
          'bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200 focus-visible:ring-primary-400',
        link:
          'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline p-0 h-auto focus-visible:ring-primary-400',
        white:
          'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 shadow-sm hover:shadow focus-visible:ring-gray-400',
      },
      size: {
        xs: 'px-2.5 py-1.5 text-xs rounded-lg',
        sm: 'px-3 py-2 text-sm rounded-xl',
        md: 'px-4 py-2.5 text-sm rounded-xl',
        lg: 'px-6 py-3 text-base rounded-xl',
        xl: 'px-8 py-3.5 text-base rounded-2xl',
        icon: 'h-9 w-9 rounded-full',
        'icon-sm': 'h-8 w-8 rounded-full',
        'icon-lg': 'h-11 w-11 rounded-full',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      className={buttonVariants({ variant, size, fullWidth, className })}
      ref={ref}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>{children ?? 'Loading...'}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
);

Button.displayName = 'Button';
