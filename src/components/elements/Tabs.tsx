'use client';

import { motion } from 'framer-motion';
import React, { HTMLAttributes } from 'react';

export interface Tab {
  label: string | React.ReactNode;
  value: number | string;
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  tabs: Tab[];
  activeTab: number | string;
  onTabChange: (value: number | string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange, className = '', ...props }: Readonly<TabsProps>) {
  return (
    <div className={`tw-flex tw-text-nowrap ${className}`} {...props}>
      {tabs.map((tab) => (
        <button
          type='button'
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`tw-relative tw-px-3 tw-py-2 tw-bg-transparent tw-border-0 tw-font-medium tw-transition-colors tw-duration-200 tw-cursor-pointer ${
            activeTab === tab.value ? 'tw-text-primary' : 'tw-text-muted hover:tw-text-primary'
          }`}
        >
          {tab.label}
          {activeTab === tab.value && (
            <motion.div
              layoutId='activeTabIndicator'
              className='tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-h-0.5 tw-bg-primary'
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
