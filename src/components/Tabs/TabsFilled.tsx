'use client';

import { useState } from 'react';

interface Tab {
  title: string;
  value: string;
}

interface TabsFilledProps {
  tabs: Tab[];
  tabClassName?: (activeTab: string) => string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  tabsFlexContainerClassName?: string;
}

export default function TabsFilled({
  tabs,
  tabClassName = () => '',
  defaultValue,
  onChange,
  className = '',
  tabsFlexContainerClassName = '',
}: TabsFilledProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value || '');

  const handleTabClick = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <div className={`tw-w-fit ${className}`}>
      {/* Tabs Container */}
      <div
        className={`tw-inline-flex tw-gap-1 tw-border-b tw-border-light-gray tw-bg-white tw-p-1 tw-rounded-md ${tabsFlexContainerClassName}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`tw-px-2.5 tw-py-1 tw-rounded-md  tw-whitespace-nowrap tw-relative
              ${activeTab === tab.value ? 'tw-text-white/90 tw-bg-primary' : 'tw-text-muted hover:tw-bg-light-beige'}
              ${tabClassName(tab.value)}
            tw-transition-all`}
          >
            {tab.title}
          </button>
        ))}
      </div>
    </div>
  );
}
