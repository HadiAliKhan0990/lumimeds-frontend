'use client';

import { HTMLAttributes, ReactNode, useRef, useState } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode;
  align?: 'left' | 'right';
  triggerClassName?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
  triggerClassName,
  isOpen: controlledIsOpen,
  onOpenChange,
  ...rest
}: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = (value: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(value);
    }
    onOpenChange?.(value);
  };

  useOutsideClick({
    ref: dropdownRef,
    handler: () => setIsOpen(false),
  });

  const toggleDropdown = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    setIsOpen(!isOpen);
  };

  const alignmentClasses = align === 'left' ? 'tw-left-0' : 'tw-right-0';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown();
    }
  };

  return (
    <div className={`tw-relative tw-inline-block ${className || ''}`} ref={dropdownRef} {...rest}>
      <button
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        type='button'
        className={`tw-flex tw-items-center tw-justify-center tw-p-0 ${triggerClassName || ''}`}
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          role='menu'
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          className={`tw-absolute tw-z-50 tw-mt-2 tw-min-w-[200px] tw-bg-white tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-100 tw-py-2 ${alignmentClasses}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps<T extends React.ElementType = 'button'> {
  as?: T;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const DropdownItem = <T extends React.ElementType = 'button'>({
  as,
  children,
  onClick,
  className = '',
  type = 'button',
  ...rest
}: DropdownItemProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof DropdownItemProps<T>>) => {
  const Component = as ?? 'button';

  const baseClasses = `tw-w-full tw-flex tw-items-center tw-justify-start tw-gap-2 tw-text-left tw-rounded-none tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 hover:tw-bg-gray-100 tw-transition-colors tw-duration-150 tw-whitespace-nowrap active:tw-bg-neutral-300 disabled:tw-opacity-50 disabled:tw-pointer-events-none ${className}`;

  const props: Record<string, unknown> = {
    onClick,
    className: baseClasses,
    ...rest,
  };

  // Only add type prop for button elements
  if (Component === 'button' && !as) {
    props.type = type;
  }

  return <Component {...props}>{children}</Component>;
};
