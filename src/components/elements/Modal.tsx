'use client';

import ReactDOM from 'react-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { CircularProgress } from './CircularProgress';

export interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  headerAction?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
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
  disabledBodyPadding?: boolean; // If true, the body will not have padding
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

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
  sm: 'tw-max-w-md',
  md: 'tw-max-w-xl',
  lg: 'tw-max-w-2xl',
  xl: 'tw-max-w-5xl',
  full: 'tw-max-w-full tw-mx-4',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  headerAction,
  children,
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
}: Readonly<ModalProps>) {
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
      onClose?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape') {
      onClose?.();
    }
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`tw-fixed tw-inset-0 tw-z-[9998] tw-flex tw-items-center tw-justify-center tw-p-4 ${wrapperClassName}`}
          initial='hidden'
          animate='visible'
          exit='exit'
          variants={backdropVariants}
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            className='tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-50'
            onClick={handleBackdropClick}
            variants={backdropVariants}
          />

          {/* Modal */}
          <motion.div
            className={`tw-relative tw-bg-white tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-h-[90vh] tw-flex tw-flex-col ${sizeClasses[size]} ${className}`}
            variants={modalVariants}
            layout
          >
            {/* Close Button - Absolutely positioned */}
            {showCloseButton && onClose && (
              <motion.button
                className='tw-absolute tw-top-2 disabled:tw-pointer-events-none tw-right-2 tw-z-10 tw-p-1.5 hover:tw-bg-gray-100 tw-rounded-full tw-transition-colors tw-duration-200'
                onClick={onClose}
                aria-label='Close modal'
                disabled={isLoading}
                variants={contentVariants}
              >
                <IoClose className='tw-w-6 tw-h-6' />
              </motion.button>
            )}

            {/* Header */}
            {title && (
              <motion.div
                className={`tw-flex-shrink-0 tw-p-4 tw-relative ${headerClassName}`}
                variants={contentVariants}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              >
                <span className={'tw-text-lg sm:tw-text-xl tw-font-semibold' + (headerAction ? ' tw-flex-grow' : '')}>
                  {title}
                </span>
                {headerAction}
              </motion.div>
            )}

            {/* Body */}
            <motion.div
              className={`tw-max-h-[500px] tw-overflow-y-auto ${disabledBodyPadding ? '' : 'tw-px-4'} ${bodyClassName}`}
              variants={contentVariants}
            >
              {isLoading ? (
                <div className='tw-flex tw-items-center tw-justify-center tw-py-8'>
                  <div className='tw-flex tw-flex-col tw-items-center tw-gap-3'>
                    <CircularProgress className='!tw-w-10 !tw-h-10' />
                    <span className='tw-text-gray-600 tw-text-sm'>{loadingText}</span>
                  </div>
                </div>
              ) : (
                children
              )}
            </motion.div>

            {/* Footer */}
            {(showFooter || footer) && (
              <motion.div
                className={`tw-flex-shrink-0 tw-flex tw-items-center tw-gap-3 tw-p-4 ${footerClassName}`}
                variants={contentVariants}
              >
                {footer}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalElement
  );
}

// Export variants for custom usage
export { backdropVariants, modalVariants, contentVariants };
