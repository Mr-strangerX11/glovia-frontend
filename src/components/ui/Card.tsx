import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-2xl border bg-white transition-all duration-300 overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-gray-100 bg-white shadow-soft dark:bg-gray-900 dark:border-gray-800',
        glass:   'bg-white/80 backdrop-blur-md border-white/30 shadow-lg dark:bg-gray-900/80 dark:border-gray-700/40',
        flat:    'border-gray-100 bg-white shadow-none dark:bg-gray-900 dark:border-gray-800',
        outlined:'border-gray-200 bg-white shadow-none dark:bg-transparent dark:border-gray-700',
        colored: 'border-primary-100 bg-gradient-to-br from-primary-50 to-white shadow-soft dark:from-primary-900/10 dark:to-gray-900 dark:border-primary-900/30',
        dark:    'border-gray-800 bg-gray-900 shadow-soft text-gray-100',
      },
      shadow: {
        none: '',
        sm:   'shadow-elevation-1 hover:shadow-elevation-2',
        md:   'shadow-elevation-2 hover:shadow-elevation-3',
        lg:   'shadow-elevation-3 hover:shadow-elevation-4',
      },
      hover: {
        true:  'hover:-translate-y-1 cursor-pointer',
        false: '',
      },
      padding: {
        none:  '',
        sm:    'p-4',
        md:    'p-5',
        lg:    'p-6',
        xl:    'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      shadow:  'sm',
      hover:   false,
      padding: 'none',
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, shadow, hover, padding, children, ...props }, ref) => (
    <div
      className={cardVariants({ variant, shadow, hover, padding, className })}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export const CardHeader = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({
  className = '',
  as: Tag = 'h3',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h2' | 'h3' | 'h4' }) => (
  <Tag
    className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}
    {...props}
  >
    {children}
  </Tag>
);

export const CardDescription = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={`text-sm text-gray-500 dark:text-gray-400 mt-0.5 ${className}`}
    {...props}
  >
    {children}
  </p>
);

export const CardContent = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);
