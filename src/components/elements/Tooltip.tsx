'use client';

import { HTMLAttributes, useState, useRef, useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { calculateTooltipPosition, TooltipPosition } from '@/helpers/tooltip';

interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  position?: TooltipPosition;
  delay?: number;
  content: ReactNode;
}

export const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
  ...rest
}: Readonly<TooltipProps>) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const hasPositionedRef = useRef(false);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
    // Reset positioning flag when tooltip hides
    hasPositionedRef.current = false;
  };

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current && !hasPositionedRef.current) {
      // Use double requestAnimationFrame to ensure the tooltip is fully rendered and laid out
      // This prevents size changes on mobile due to layout reflows
      let rafId2: number;

      const rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => {
          if (!triggerRef.current || !tooltipRef.current) return;

          const triggerRect = triggerRef.current.getBoundingClientRect();
          const tooltipRect = tooltipRef.current.getBoundingClientRect();

          // Only calculate if tooltip has actual dimensions (prevents measuring before render)
          if (tooltipRect.width > 0 && tooltipRect.height > 0) {
            const { top, left, finalPosition } = calculateTooltipPosition(triggerRect, tooltipRect, position);
            setTooltipPosition({ top, left });
            setAdjustedPosition(finalPosition);
            hasPositionedRef.current = true;
          }
        });
      });

      return () => {
        cancelAnimationFrame(rafId1);
        if (rafId2) cancelAnimationFrame(rafId2);
      };
    }
  }, [isVisible, position]);

  // Arrow classes with more prominent styling
  const arrowClasses = {
    top: 'tw-top-full tw-left-1/2 tw-transform tw--translate-x-1/2 tw-border-t-neutral-700 tw-border-l-transparent tw-border-r-transparent tw-border-b-transparent',
    bottom:
      'tw-bottom-full tw-left-1/2 tw-transform tw--translate-x-1/2 tw-border-b-neutral-700 tw-border-l-transparent tw-border-r-transparent tw-border-t-transparent',
    left: 'tw-left-full tw-top-1/2 tw-transform tw--translate-y-1/2 tw-border-l-neutral-700 tw-border-t-transparent tw-border-b-transparent tw-border-r-transparent',
    right:
      'tw-right-full tw-top-1/2 tw-transform tw--translate-y-1/2 tw-border-r-neutral-700 tw-border-t-transparent tw-border-b-transparent tw-border-l-transparent',
    'top-left':
      'tw-top-full tw-left-3/4 tw-transform tw--translate-x-1/2 tw-border-t-neutral-700 tw-border-l-transparent tw-border-r-transparent tw-border-b-transparent',
    'top-right':
      'tw-top-full tw-left-1/4 tw-transform tw--translate-x-1/2 tw-border-t-neutral-700 tw-border-l-transparent tw-border-r-transparent tw-border-b-transparent',
    'bottom-left':
      'tw-bottom-full tw-left-3/4 tw-transform tw--translate-x-1/2 tw-border-b-neutral-700 tw-border-l-transparent tw-border-r-transparent tw-border-t-transparent',
    'bottom-right':
      'tw-bottom-full tw-left-1/4 tw-transform tw--translate-x-1/2 tw-border-b-neutral-700 tw-border-l-transparent tw-border-r-transparent tw-border-t-transparent',
  };

  return (
    <div
      ref={triggerRef}
      className={`tw-relative tw-inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}

      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            ref={tooltipRef}
            className='tw-fixed tw-z-[9999] tw-will-change-transform tw-px-3 tw-py-2 tw-text-sm tw-text-white tw-bg-neutral-700 tw-rounded-lg tw-shadow-2xl tw-max-w-xs tw-break-words'
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
            role='tooltip'
            initial={{ opacity: 0, scale: 0.85, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -8 }}
            transition={{
              duration: 0.15,
              ease: [0.4, 0, 0.2, 1], // Tailwind's ease-out
            }}
          >
            {content}
            {/* Tooltip arrow */}
            <div className={`tw-absolute tw-w-0 tw-h-0 tw-border-[8px] ${arrowClasses[adjustedPosition]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
