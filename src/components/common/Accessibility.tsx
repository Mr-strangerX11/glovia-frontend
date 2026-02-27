"use client";

import React, { useEffect, useState } from 'react';

interface SkipLinkProps {
  children: React.ReactNode;
  targetId: string;
}

export function SkipLink({ children, targetId }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
    >
      {children}
    </a>
  );
}

// Live region for screen readers
export function LiveRegion({ 
  message, 
  politeness = 'polite' 
}: { 
  message: string; 
  politeness?: 'polite' | 'assertive';
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Keyboard navigation helper
export function KeyboardNavigation({
  onEscape,
  onEnter,
  onArrowDown,
  onArrowUp,
  onArrowLeft,
  onArrowRight,
}: {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowDown?: () => void;
  onArrowUp?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'Escape':
          onEscape?.();
          break;
        case 'Enter':
          onEnter?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onArrowDown?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          onArrowUp?.();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onArrowLeft?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onArrowRight?.();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter, onArrowDown, onArrowUp, onArrowLeft, onArrowRight]);

  return null;
}

// Focus trap component for modals
export function FocusTrap({ 
  children, 
  isActive 
}: { 
  children: React.ReactNode; 
  isActive: boolean;
}) {
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (isActive) {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => el.offsetParent !== null);
      
      setFocusableElements(elements);
      setFocusedIndex(0);
      
      if (elements.length > 0) {
        elements[0].focus();
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || focusableElements.length === 0) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Tab') {
        event.preventDefault();
        
        const newIndex = event.shiftKey 
          ? (focusedIndex - 1 + focusableElements.length) % focusableElements.length
          : (focusedIndex + 1) % focusableElements.length;
        
        setFocusedIndex(newIndex);
        focusableElements[newIndex]?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, focusedIndex, focusableElements]);

  return <>{children}</>;
}

// Visually hidden but accessible
export function VisuallyHidden({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// Loading indicator with accessible description
export function LoadingSpinner({ 
  size = 'md',
  label = 'Loading'
}: { 
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div role="status" aria-label={label}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-primary`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Icon button with accessibility
export function AccessibleIconButton({
  icon,
  label,
  onClick,
  disabled = false,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {icon}
    </button>
  );
}

