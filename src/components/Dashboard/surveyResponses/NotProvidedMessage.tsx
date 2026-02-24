'use client';

import { HTMLAttributes } from 'react';

/**
 * Reusable component for displaying "Not Provided" message
 * Used when survey response answers are empty or not available
 */
export function NotProvidedMessage({ className = '', ...props }: Readonly<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span className={`tw-text-muted tw-text-sm tw-italic ${className}`} {...props}>
      Not Provided
    </span>
  );
}
