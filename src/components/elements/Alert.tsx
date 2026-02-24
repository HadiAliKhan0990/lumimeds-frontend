'use client';

import { ReactNode } from 'react';
import { HiOutlineInformationCircle, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

type AlertVariant = 'info' | 'warning' | 'success' | 'error';

const VARIANT_STYLES: Record<
  AlertVariant,
  {
    container: string;
    iconWrapper: string;
    icon: ReactNode;
    title: string;
    description: string;
  }
> = {
  info: {
    container: 'tw-border-blue-100 tw-bg-blue-50',
    iconWrapper: 'tw-text-blue-600 tw-bg-blue-100',
    icon: <HiOutlineInformationCircle className='tw-h-5 tw-w-5' aria-hidden='true' />,
    title: 'tw-text-blue-900',
    description: 'tw-text-blue-800',
  },
  warning: {
    container: 'tw-border-yellow-100 tw-bg-yellow-50',
    iconWrapper: 'tw-text-yellow-600 tw-bg-yellow-100',
    icon: <HiOutlineExclamationTriangle className='tw-h-5 tw-w-5' aria-hidden='true' />,
    title: 'tw-text-yellow-900',
    description: 'tw-text-yellow-800',
  },
  success: {
    container: 'tw-border-green-100 tw-bg-green-50',
    iconWrapper: 'tw-text-green-600 tw-bg-green-100',
    icon: <HiOutlineCheckCircle className='tw-h-5 tw-w-5' aria-hidden='true' />,
    title: 'tw-text-green-900',
    description: 'tw-text-green-800',
  },
  error: {
    container: 'tw-border-red-100 tw-bg-red-50',
    iconWrapper: 'tw-text-red-600 tw-bg-red-100',
    icon: <HiOutlineXCircle className='tw-h-5 tw-w-5' aria-hidden='true' />,
    title: 'tw-text-red-900',
    description: 'tw-text-red-800',
  },
};

export interface AlertProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  variant?: AlertVariant;
  className?: string;
}

export default function Alert({
  title,
  description,
  actions,
  icon,
  variant = 'info',
  className = '',
}: Readonly<AlertProps>) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={`tw-flex tw-gap-3 tw-rounded-lg tw-border tw-p-4 ${styles.container} ${className}`}>
      <span
        className={`tw-flex tw-h-9 tw-w-9 tw-flex-shrink-0 tw-items-center tw-justify-center tw-rounded-full ${styles.iconWrapper}`}
      >
        {icon ?? styles.icon}
      </span>
      <div className='tw-flex-1 tw-space-y-3'>
        <div className='tw-space-y-1'>
          <p className={`tw-text-sm tw-font-semibold tw-uppercase ${styles.title}`}>{title}</p>
          {description ? <div className={`tw-text-sm ${styles.description}`}>{description}</div> : null}
        </div>
        {actions ? <div className='tw-flex tw-flex-wrap tw-gap-2'>{actions}</div> : null}
      </div>
    </div>
  );
}
