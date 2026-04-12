'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  fullWidth?: boolean;
  noPadding?: boolean;
  hero?: React.ReactNode;
  heroVariant?: 'rose' | 'blue' | 'slate' | 'emerald' | 'purple' | 'none';
  compact?: boolean;
}

const heroGradients = {
  rose:    'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600',
  blue:    'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600',
  slate:   'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900',
  emerald: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700',
  purple:  'bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600',
  none:    '',
} as const;

export const PageLayout = ({
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  fullWidth = false,
  noPadding = false,
  hero,
  heroVariant,
  compact = false,
}: PageLayoutProps) => {
  const hasHero = !!heroVariant && heroVariant !== 'none';

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950">
      {/* Hero / Header Section */}
      {(title || breadcrumbs || hero) && (
        <>
          {hasHero ? (
            /* ─ Gradient hero bar ─ */
            <div className={`${heroGradients[heroVariant!]} pt-8 pb-20 relative overflow-hidden`}>
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
              <div className={fullWidth ? 'w-full px-4 sm:px-6 lg:px-8' : 'container'}>
                {breadcrumbs && (
                  <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/70" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-white transition-colors">
                      <Home className="h-4 w-4" />
                    </Link>
                    {breadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={idx}>
                        <ChevronRight className="h-3.5 w-3.5 text-white/40" />
                        {crumb.href ? (
                          <Link href={crumb.href} className="hover:text-white transition-colors font-medium">
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className="text-white font-semibold">{crumb.label}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>
                )}
                <div className="flex items-end justify-between gap-4 relative z-10">
                  <div>
                    {title && (
                      <h1 className={`font-bold text-white ${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}>
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="mt-1.5 text-sm text-white/75 max-w-lg">{subtitle}</p>
                    )}
                  </div>
                  {actions && (
                    <div className="flex shrink-0 items-center gap-2">{actions}</div>
                  )}
                </div>
                {hero}
              </div>
            </div>
          ) : (
            /* ─ Plain header bar ─ */
            <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className={fullWidth ? 'w-full px-4 sm:px-6 lg:px-8' : 'container'}>
                <div className={`${compact ? 'py-4' : 'py-6'}`}>
                  {breadcrumbs && (
                    <nav className="mb-3 flex items-center gap-1.5 text-xs text-gray-500" aria-label="Breadcrumb">
                      <Link href="/" className="hover:text-primary-600 transition-colors">
                        <Home className="h-3.5 w-3.5" />
                      </Link>
                      {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                          <ChevronRight className="h-3 w-3 text-gray-300" />
                          {crumb.href ? (
                            <Link href={crumb.href} className="hover:text-primary-600 transition-colors font-medium">
                              {crumb.label}
                            </Link>
                          ) : (
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{crumb.label}</span>
                          )}
                        </React.Fragment>
                      ))}
                    </nav>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {title && (
                        <h1 className={`font-bold text-gray-900 dark:text-gray-100 ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
                          {title}
                        </h1>
                      )}
                      {subtitle && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                      )}
                    </div>
                    {actions && (
                      <div className="flex shrink-0 items-center gap-2">{actions}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Content pulled up over hero */}
      <div
        className={[
          fullWidth ? 'w-full' : 'container',
          hasHero ? '-mt-10' : '',
          noPadding ? '' : 'pb-16',
          hasHero && !noPadding ? 'pt-0' : '',
          !hasHero && !noPadding ? 'py-8' : '',
        ].filter(Boolean).join(' ')}
      >
        {noPadding ? children : (
          <div className={noPadding ? '' : (hasHero ? '' : '')}>{children}</div>
        )}
      </div>
    </div>
  );
};

/* ─── PageSection ─── */
export const PageSection = ({
  children,
  title,
  subtitle,
  action,
  className = '',
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) => (
  <section className={`mb-8 ${className}`}>
    {(title || subtitle || action) && (
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          {title && <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

/* ─── PageGrid ─── */
export const PageGrid = ({
  children,
  cols = 3,
  gap = 'gap-6',
  className = '',
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: string;
  className?: string;
}) => {
  const colMap = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  };
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${colMap[cols]} ${gap} ${className}`}>
      {children}
    </div>
  );
};

/* ─── EmptyState ─── */
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
    {icon && (
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400">
        {icon}
      </div>
    )}
    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
    {description && (
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* ─── LoadingSpinner ─── */
export const LoadingSpinner = ({
  size = 'md',
  label,
  center = false,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  center?: boolean;
  className?: string;
}) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const borders = { sm: 'border-2', md: 'border-[3px]', lg: 'border-4' };
  return (
    <div className={`flex flex-col items-center gap-3 ${center ? 'justify-center min-h-[200px]' : ''} ${className}`}>
      <div className={`${sizes[size]} ${borders[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin dark:border-primary-800 dark:border-t-primary-400`} />
      {label && <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>}
    </div>
  );
};
