'use client';

import ReactDOM from 'react-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { CircularProgress } from '@/components/elements';

export type SizeClasses = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'popup' | 'medication' | 'survey' | 'patientPopup';

interface OffcanvasProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  position?: 'left' | 'right';
  size?: SizeClasses;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  wrapperClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  footer?: ReactNode;
  showFooter?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  disabledBodyPadding?: boolean;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const getOffcanvasVariants = (position: 'left' | 'right'): Variants => ({
  hidden: {
    x: position === 'left' ? '-100%' : '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
      duration: 0.3,
    },
  },
  exit: {
    x: position === 'left' ? '-100%' : '100%',
    opacity: 0,
    transition: {
      duration: 0.25,
    },
  },
});

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      delay: 0.1,
    },
  },
  exit: { opacity: 0, y: 10 },
};

const sizeClasses = {
  sm: 'tw-w-full sm:tw-w-64',
  md: 'tw-w-full sm:tw-w-80',
  lg: 'tw-w-full sm:tw-w-96',
  xl: 'tw-w-full sm:tw-w-[28rem]',
  full: 'tw-w-full',
  popup: 'tw-w-full lg:tw-w-[998px]',
  medication: 'tw-w-full md:tw-w-[30%]',
  survey: 'tw-w-full md:tw-w-[40%]',
  patientPopup: 'tw-w-full md:tw-w-[calc(100%-144px)]',
};

export default function Offcanvas({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
  wrapperClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  footer,
  showFooter = false,
  isLoading = false,
  loadingText = 'Loading...',
  disabledBodyPadding = false,
}: Readonly<OffcanvasProps>) {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalElement(document.body);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = 'unset';
    }

    return () => {
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!portalElement) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      e.stopPropagation();
      onClose?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape') {
      onClose?.();
    }
  };

  const offcanvasVariants = getOffcanvasVariants(position);

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`tw-fixed tw-inset-0 tw-z-[9998] tw-p-2 tw-flex ${
            position === 'left' ? 'tw-justify-start' : 'tw-justify-end'
          } ${wrapperClassName}`}
          initial='hidden'
          animate='visible'
          exit='exit'
          variants={backdropVariants}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Backdrop */}
          <motion.div
            className='tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-z-10'
            variants={backdropVariants}
            onClick={handleBackdropClick}
          />

          {/* Offcanvas */}
          <motion.aside
            className={`tw-h-full tw-rounded-xl tw-bg-white tw-relative tw-z-20 tw-shadow-2xl tw-flex tw-flex-col tw-overflow-hidden ${sizeClasses[size]} ${className}`}
            variants={offcanvasVariants}
            layout
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {showCloseButton && onClose && (
              <motion.button
                className='tw-absolute tw-top-2 disabled:tw-pointer-events-none tw-right-2 tw-z-10 tw-p-1.5 hover:tw-bg-gray-100 tw-rounded-full tw-transition-all tw-duration-200'
                onClick={onClose}
                aria-label='Close offcanvas'
                disabled={isLoading}
                variants={contentVariants}
              >
                <IoClose className='tw-w-5 tw-h-5 sm:tw-w-6 sm:tw-h-6' />
              </motion.button>
            )}

            {/* Header */}
            {title && (
              <motion.div
                className={`tw-flex-shrink-0 tw-px-4 tw-py-3 tw-relative ${headerClassName}`}
                variants={contentVariants}
              >
                <span className='tw-text-base sm:tw-text-lg md:tw-text-xl tw-font-semibold tw-text-gray-900'>
                  {title}
                </span>
              </motion.div>
            )}

            {/* Body */}
            <motion.div
              className={`tw-flex-1 tw-overflow-y-auto ${disabledBodyPadding ? '' : 'tw-p-4'} ${bodyClassName}`}
              variants={contentVariants}
            >
              {isLoading ? (
                <div className='tw-flex tw-items-center tw-justify-center tw-py-8 tw-h-full'>
                  <div className='tw-flex tw-flex-col tw-items-center tw-gap-3'>
                    <CircularProgress className='!tw-w-10 !tw-h-10' />
                    <p className='tw-text-gray-600 tw-text-sm'>{loadingText}</p>
                  </div>
                </div>
              ) : (
                children
              )}
            </motion.div>

            {/* Footer */}
            {(showFooter || footer) && (
              <motion.div
                className={`tw-flex-shrink-0 tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-gap-3 tw-p-3 sm:tw-p-4 ${footerClassName}`}
                variants={contentVariants}
              >
                {footer}
              </motion.div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    portalElement
  );
}

// Export variants for custom usage
export { backdropVariants, getOffcanvasVariants, contentVariants };
