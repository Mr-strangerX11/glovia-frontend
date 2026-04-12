import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X, Zap } from 'lucide-react';

/* ─── Badge ─── */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors duration-200',
  {
    variants: {
      variant: {
        primary:   'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
        secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/40 dark:text-secondary-300',
        success:   'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
        warning:   'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        danger:    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
        info:      'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        gray:      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        outline:   'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
      },
      size: {
        xs: 'text-[10px] px-2 py-0.5',
        sm: 'text-xs px-2.5 py-0.5',
        md: 'text-xs px-3 py-1',
        lg: 'text-sm px-3.5 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size:    'md',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, children, icon, dot, ...props }, ref) => (
    <span className={badgeVariants({ variant, size, className })} ref={ref} {...props}>
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  )
);
Badge.displayName = 'Badge';

/* ─── Alert ─── */
const alertConfig = {
  success: {
    bg:      'bg-emerald-50 dark:bg-emerald-900/15',
    border:  'border-emerald-200 dark:border-emerald-800/60',
    icon:    CheckCircle2,
    iconCls: 'text-emerald-600 dark:text-emerald-400',
    title:   'text-emerald-900 dark:text-emerald-200',
    body:    'text-emerald-800 dark:text-emerald-300',
  },
  error: {
    bg:      'bg-red-50 dark:bg-red-900/15',
    border:  'border-red-200 dark:border-red-800/60',
    icon:    AlertCircle,
    iconCls: 'text-red-600 dark:text-red-400',
    title:   'text-red-900 dark:text-red-200',
    body:    'text-red-800 dark:text-red-300',
  },
  warning: {
    bg:      'bg-amber-50 dark:bg-amber-900/15',
    border:  'border-amber-200 dark:border-amber-800/60',
    icon:    AlertTriangle,
    iconCls: 'text-amber-600 dark:text-amber-400',
    title:   'text-amber-900 dark:text-amber-200',
    body:    'text-amber-800 dark:text-amber-300',
  },
  info: {
    bg:      'bg-blue-50 dark:bg-blue-900/15',
    border:  'border-blue-200 dark:border-blue-800/60',
    icon:    Info,
    iconCls: 'text-blue-600 dark:text-blue-400',
    title:   'text-blue-900 dark:text-blue-200',
    body:    'text-blue-800 dark:text-blue-300',
  },
  promo: {
    bg:      'bg-primary-50 dark:bg-primary-900/20',
    border:  'border-primary-200 dark:border-primary-800/60',
    icon:    Zap,
    iconCls: 'text-primary-600 dark:text-primary-400',
    title:   'text-primary-900 dark:text-primary-200',
    body:    'text-primary-800 dark:text-primary-300',
  },
} as const;

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof alertConfig;
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'info',
      title,
      description,
      dismissible,
      onDismiss,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(true);

    if (!visible) return null;

    const cfg = alertConfig[variant];
    const IconComponent = cfg.icon;

    return (
      <div
        ref={ref}
        role="alert"
        className={`${cfg.bg} ${cfg.border} border rounded-xl p-4 flex gap-3 animate-fade-in ${className ?? ''}`}
        {...props}
      >
        <span className={`mt-0.5 shrink-0 ${cfg.iconCls}`}>
          {icon ?? <IconComponent className="h-5 w-5" />}
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <p className={`font-semibold text-sm ${cfg.title}`}>{title}</p>
          )}
          {description && (
            <p className={`text-sm mt-0.5 ${cfg.body}`}>{description}</p>
          )}
          {children && (
            <div className={`text-sm mt-0.5 ${cfg.body}`}>{children}</div>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={() => { setVisible(false); onDismiss?.(); }}
            className="shrink-0 text-current opacity-40 hover:opacity-70 transition-opacity rounded-lg p-0.5"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';
