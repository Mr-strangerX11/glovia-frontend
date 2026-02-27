"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'circular' | 'rectangular' | 'text';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-md',
        variant === 'text' && 'rounded h-4',
        animation === 'pulse' && 'animate-pulse',
        animation === 'wave' && 'animate-shimmer',
        className
      )}
      {...props}
    />
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Skeleton className="h-64 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" variant="text" />
        <Skeleton className="h-4 w-1/2" variant="text" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-20" variant="text" />
          <Skeleton className="h-8 w-8 rounded-full" variant="circular" />
        </div>
      </div>
    </div>
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full" variant="text" />
        </td>
      ))}
    </tr>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12" variant="circular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" variant="text" />
          <Skeleton className="h-3 w-1/2" variant="text" />
        </div>
      </div>
    </div>
  );
}

// Banner Skeleton
export function BannerSkeleton() {
  return (
    <div className="relative h-[300px] md:h-[500px] rounded-lg overflow-hidden">
      <Skeleton className="h-full w-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-64 mx-auto" variant="text" />
          <Skeleton className="h-5 w-48 mx-auto" variant="text" />
          <Skeleton className="h-10 w-32 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Image Skeleton with blur placeholder
export function ImageSkeleton({ 
  className, 
  aspectRatio = 'aspect-video' 
}: { 
  className?: string;
  aspectRatio?: string;
}) {
  return (
    <div className={cn('relative overflow-hidden', aspectRatio, className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer" />
    </div>
  );
}

// Button Skeleton
export function ButtonSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton 
      className={cn('h-10 w-24', className)} 
      variant="rectangular" 
    />
  );
}

// Text Skeleton (paragraph)
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn('h-4', i === lines - 1 && 'w-3/4')} 
          variant="text" 
        />
      ))}
    </div>
  );
}

