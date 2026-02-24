'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ShadowScrollRenderProps {
  nextButtonProps: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isVisible: boolean;
  };
  backButtonProps: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isVisible: boolean;
  };
  containerProps: React.HTMLAttributes<HTMLDivElement> & {
    ref: React.RefObject<HTMLDivElement | null>;
  };
  hasOverflow: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

interface ShadowScrollProps {
  children: (props: ShadowScrollRenderProps) => React.ReactNode;
  scrollAmount?: number;
  nextButtonClassName?: string;
  backButtonClassName?: string;
  containerClassName?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const ShadowScroll: React.FC<ShadowScrollProps> = ({
  children,
  scrollAmount = 200,
  nextButtonClassName = '',
  backButtonClassName = '',
  containerClassName = '',
  orientation = 'horizontal',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkOverflow = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (orientation === 'horizontal') {
      const hasHorizontalOverflow = container.scrollWidth > container.clientWidth;
      setHasOverflow(hasHorizontalOverflow);

      if (hasHorizontalOverflow) {
        const scrollLeft = container.scrollLeft;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < maxScrollLeft - 1); // -1 for rounding errors
      } else {
        setCanScrollLeft(false);
        setCanScrollRight(false);
      }
    } else {
      const hasVerticalOverflow = container.scrollHeight > container.clientHeight;
      setHasOverflow(hasVerticalOverflow);

      if (hasVerticalOverflow) {
        const scrollTop = container.scrollTop;
        const maxScrollTop = container.scrollHeight - container.clientHeight;

        setCanScrollUp(scrollTop > 0);
        setCanScrollDown(scrollTop < maxScrollTop - 1); // -1 for rounding errors
      } else {
        setCanScrollUp(false);
        setCanScrollDown(false);
      }
    }
  }, [orientation]);

  const handleScroll = useCallback(() => {
    checkOverflow();
  }, [checkOverflow]);

  const scrollNext = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (orientation === 'horizontal') {
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    } else {
      container.scrollBy({
        top: scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [scrollAmount, orientation]);

  const scrollBack = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (orientation === 'horizontal') {
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    } else {
      container.scrollBy({
        top: -scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [scrollAmount, orientation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial check
    checkOverflow();

    // Set up ResizeObserver to detect size changes
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(container);

    // Also observe children changes
    const mutationObserver = new MutationObserver(() => {
      checkOverflow();
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Add scroll listener
    container.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      container.removeEventListener('scroll', handleScroll);
    };
  }, [checkOverflow, handleScroll]);

  const containerProps: React.HTMLAttributes<HTMLDivElement> & {
    ref: React.RefObject<HTMLDivElement | null>;
  } = {
    ref: containerRef,
    className: `${containerClassName} ${
      orientation === 'horizontal' ? 'tw-overflow-x-hidden' : 'tw-overflow-y-hidden'
    }`,
    onScroll: handleScroll,
  };

  const isBackButtonVisible = orientation === 'horizontal' ? canScrollLeft : canScrollUp;
  const isNextButtonVisible = orientation === 'horizontal' ? canScrollRight : canScrollDown;

  const backButtonProps: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isVisible: boolean;
  } = {
    onClick: scrollBack,
    disabled: !isBackButtonVisible,
    className: `${backButtonClassName} ${
      !isBackButtonVisible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    }`.trim(),
    type: 'button',
    'aria-label': orientation === 'horizontal' ? 'Scroll left' : 'Scroll up',
    isVisible: hasOverflow && isBackButtonVisible,
  };

  const nextButtonProps: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isVisible: boolean;
  } = {
    onClick: scrollNext,
    disabled: !isNextButtonVisible,
    className: `${nextButtonClassName} ${
      !isNextButtonVisible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    }`.trim(),
    type: 'button',
    'aria-label': orientation === 'horizontal' ? 'Scroll right' : 'Scroll down',
    isVisible: hasOverflow && isNextButtonVisible,
  };

  return children({
    nextButtonProps,
    backButtonProps,
    containerProps,
    hasOverflow,
    canScrollLeft,
    canScrollRight,
  });
};

export default ShadowScroll;
