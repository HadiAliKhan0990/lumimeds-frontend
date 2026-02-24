'use client';

import { HTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  index: number | string;
  value: number | string;
}

export default function TabPanel({ children, value, index, ...other }: Readonly<TabPanelProps>) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <AnimatePresence mode='wait'>
          <motion.div
            key={String(index)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
