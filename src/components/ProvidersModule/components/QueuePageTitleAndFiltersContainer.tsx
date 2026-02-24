'use client';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import React, { ReactNode } from 'react';

export interface QueuePageTitleAndFiltersWrapperProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string;
}

export const QueuePageTitleAndFiltersWrapper = ({
  children,
  className,
  ...props
}: QueuePageTitleAndFiltersWrapperProps) => {
  return (
    <div {...props} className={`tw-flex tw-gap-2 tw-justify-between tw-items-center tw-flex-wrap ${className}`}>
      {children}
    </div>
  );
};

export interface QueuePageFiltersTitleProps extends React.ComponentPropsWithoutRef<'div'> {
  pageTitle: ReactNode;
  icon: React.ReactNode;
}

export const QueuePageFiltersTitle = ({ pageTitle, icon, children, ...props }: QueuePageFiltersTitleProps) => {
  const { windowWidth } = useWindowWidth();

  const isSmallScreen = windowWidth < 560;
  return (
    <div
      {...props}
      className={`d-flex gap-2 justify-content-between align-items-center ${isSmallScreen ? 'flex-grow-1' : ''}`}
    >
      <div className='d-flex gap-2 align-items-center'>
        {icon}
        <span className={`fw-bold ${isSmallScreen ? 'fs-6' : 'fs-4'}`}>{pageTitle}</span>
        {children}
      </div>
    </div>
  );
};
