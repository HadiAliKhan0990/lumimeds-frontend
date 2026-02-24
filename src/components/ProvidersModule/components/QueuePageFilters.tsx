'use client';
import Search, { SearchProps } from '@/components/Dashboard/Search';
import ReactSelect, { CSSObjectWithLabel, MultiValue } from 'react-select';
import { useDebounceHandler } from '@/hooks/useDebounceHandler';
import React, { useEffect, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { useMounted } from '@/hooks/usemounted';
import { StatusLabel } from '@/types/appointment';
import { ProductTypeFilter } from '@/types/approved';

export const commonStylesQuePageFilters = {
  control: (baseStyles: CSSObjectWithLabel) => ({
    ...baseStyles,
    width: '100%',
    borderRadius: '6px',
    borderColor: '#adb5bd',
  }),
  singleValue: (baseStyles: CSSObjectWithLabel) => ({
    ...baseStyles,
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menu: (baseStyles: CSSObjectWithLabel) => ({
    ...baseStyles,
    zIndex: 1000,
    minWidth: 130,
  }),
};

interface QueuePageDateFilterProps {
  onDateChange: (date: string) => void;
  value: string;
}

interface QueuePageStatusFilterProps {
  onStatusChange: (status: { label: string; value: keyof StatusLabel }) => void;
  value: { label: string; value: keyof StatusLabel };
}

interface QueuePageSortFilterProps {
  onSortChange: (sortBy?: { label: string; value: string }, sortOrder?: string) => void;
  value: { label: string; value: string };
  sortOptions?: { label: string; value: string; sortOrder?: string }[];
}

export interface QueuePageSearchFilterProps extends SearchProps {
  onSearch: (value: string) => void;
}

export const QueuePageSearchFilter = ({ onSearch, value, ...props }: QueuePageSearchFilterProps) => {
  const [searchValue, setSearchValue] = useState('');

  const { debouncedHandler } = useDebounceHandler();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);

    const searchSetter = () => onSearch(e.target.value);

    debouncedHandler(1000, searchSetter);
  };

  useEffect(() => {
    setSearchValue((value as string) ?? '');
  }, [value]);

  return (
    <Search
      placeholder='Search'
      className='flex-grow-1 flex-md-grow-0'
      {...props}
      value={searchValue}
      onChange={handleSearch}
    />
  );
};

export const statusLabels: Record<keyof StatusLabel, string> = {
  scheduled: 'Scheduled',
  pending_confirmation: 'Pending',
  completed: 'Completed',
  patient_no_show: 'Patient No-Show',
  doctor_no_show: 'Doctor No-Show',
  canceled: 'Canceled',
  rescheduled: 'Rescheduled',
  reverted: 'Reverted',
  Sent_To_Pharmacy: 'Sent To Pharmacy',
  Drafted: 'Drafted',
};

const statusOptions = Object.entries(statusLabels).map(([k, v]) => ({ label: v, value: k }));

export const QueuePageStatusFilter = ({ onStatusChange, value }: QueuePageStatusFilterProps) => {
  const { windowWidth } = useWindowWidth();

  const { mounted } = useMounted();

  const isLaptop = mounted && windowWidth > 768;

  const handleStatusChange = (option: { label: string; value: keyof StatusLabel }) => {
    onStatusChange(option as { label: string; value: keyof StatusLabel });
  };

  return (
    <div className={`flex-grow-1 flex-md-grow-0 ${isLaptop ? 'w-160px' : 'w-auto'}`}>
      <ReactSelect
        styles={{
          ...commonStylesQuePageFilters,
          menu: (baseStyles: CSSObjectWithLabel) => ({
            ...baseStyles,
            minWidth: 200,
            zIndex: 1000,
            right: 0,
            left: 'auto',
          }),
        }}
        options={[{ label: 'Status', value: '' }, ...statusOptions] as { label: string; value: keyof StatusLabel }[]}
        value={value ? { label: value.label, value: value.value } : undefined}
        onChange={(option) => handleStatusChange(option as { label: string; value: keyof StatusLabel })}
        placeholder='Status'
      />
    </div>
  );
};

const defaultSortOptions = [
  { label: 'Sort By', value: '', sortOrder: '' },
  { label: 'Newest', value: 'assignedAt+', sortOrder: 'DESC' },
  { label: 'Oldest', value: 'assignedAt-', sortOrder: 'ASC' },
];

export const QueuePageSortFilter = ({
  onSortChange,
  value,
  sortOptions = defaultSortOptions as { label: string; value: string; sortOrder?: string }[],
}: QueuePageSortFilterProps) => {
  const { windowWidth } = useWindowWidth();
  const { mounted } = useMounted();

  const isLaptop = mounted && windowWidth > 768;

  const handleSortChange = (option: { label: string; value: string; sortOrder?: string }) => {
    onSortChange(option, option.sortOrder);
  };

  return (
    <div className={`flex-grow-1 flex-md-grow-0 ${isLaptop ? 'w-160px' : 'w-auto'}`}>
      <ReactSelect
        styles={{
          ...commonStylesQuePageFilters,
          menu: (baseStyles: CSSObjectWithLabel) => ({
            ...baseStyles,
            minWidth: 100,
            zIndex: 1000,
          }),
        }}
        options={sortOptions}
        value={value}
        onChange={(option) => handleSortChange(option as { label: string; value: string; sortOrder: string })}
        placeholder='Sort By'
      />
    </div>
  );
};

export const QueuePageDateFilter = ({ onDateChange, value }: QueuePageDateFilterProps) => {
  const handleDateChange = (date: Date | null) => {
    if (!date) {
      onDateChange('');
      return;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
  };

  return (
    <div className='tw-relative flex-grow-1 flex-md-grow-0'>
      <ReactDatePicker
        maxDate={new Date()}
        clearButtonClassName='q-date-picker-clear-button'
        isClearable
        clearButtonTitle='Clear'
        selected={value ? new Date(value) : null}
        placeholderText='Select Date'
        onChange={handleDateChange}
        dateFormat='MM/dd/yyyy'
        className={`form-control shadow-none ${value ? '' : 'date-input'}`}
        wrapperClassName='w-100'
        popperClassName='z-1000-important'
      />
    </div>
  );
};

interface QueuePageDatePresetFilterProps {
  onDatePresetChange: (option: { label: string; value: string } | null) => void;
  onCustomDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  selectedPreset?: { label: string; value: string } | null;
  customDateRange?: [Date | null, Date | null];
  showCustomPicker?: boolean;
}

export const QueuePageDatePresetFilter = ({
  onDatePresetChange,
  onCustomDateRangeChange,
  selectedPreset,
  customDateRange,
  showCustomPicker,
}: QueuePageDatePresetFilterProps) => {
  const { windowWidth } = useWindowWidth();
  const { mounted } = useMounted();

  const isLaptop = mounted && windowWidth > 768;

  const datePresetOptions = [
    { label: 'All Dates', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last7Days' },
    { label: 'Last 30 Days', value: 'last30Days' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Custom Range', value: 'custom' },
  ];

  return (
    <div className={`flex-grow-1 flex-md-grow-0 ${isLaptop ? 'w-160px' : 'w-auto'} tw-relative`}>
      <ReactSelect
        styles={{
          ...commonStylesQuePageFilters,
          menu: (baseStyles: CSSObjectWithLabel) => ({
            ...baseStyles,
            minWidth: 150,
            zIndex: 1000,
          }),
        }}
        options={datePresetOptions}
        value={selectedPreset || datePresetOptions[0]}
        onChange={onDatePresetChange}
        placeholder='Date Range'
      />
      {selectedPreset?.value === 'custom' && showCustomPicker && (
        <div className='tw-absolute tw-top-full tw-left-0 tw-w-full tw-z-[100] tw-mt-2'>
          <ReactDatePicker
            selectsRange
            startDate={customDateRange?.[0] || null}
            endDate={customDateRange?.[1] || null}
            onChange={(dates) => {
              const [start, end] = dates as [Date | null, Date | null];
              onCustomDateRangeChange(start, end);
            }}
            inline
            shouldCloseOnSelect={true}
            maxDate={new Date()}
          />
        </div>
      )}
    </div>
  );
};

interface QueuePageProductTypeFilterProps {
  onProductTypeChange?: ((option: { label: string; value: ProductTypeFilter | '' } | null) => void) | null;
  value?: { label: string; value: ProductTypeFilter | '' } | null;
}

const productTypeOptions = [
  { label: 'All Products', value: '' },
  { label: 'Weight Loss', value: 'weight_loss' as ProductTypeFilter },
  { label: 'Longevity', value: 'longevity' as ProductTypeFilter },
];

export const QueuePageProductTypeFilter = ({ onProductTypeChange, value }: QueuePageProductTypeFilterProps) => {
  const { windowWidth } = useWindowWidth();
  const { mounted } = useMounted();

  const isLaptop = mounted && windowWidth > 768;

  return (
    <div className={`flex-grow-1 flex-md-grow-0 ${isLaptop ? 'w-160px' : 'w-auto'}`}>
      <ReactSelect
        styles={{
          ...commonStylesQuePageFilters,
          menu: (baseStyles: CSSObjectWithLabel) => ({
            ...baseStyles,
            minWidth: 150,
            zIndex: 1000,
          }),
        }}
        options={productTypeOptions}
        value={value || productTypeOptions[0]}
        onChange={(option) => onProductTypeChange?.(option as { label: string; value: ProductTypeFilter | '' } | null)}
        placeholder='Product Type'
      />
    </div>
  );
};

interface QueuePageOrderStatusFilterProps {
  onStatusChange: (statuses: string[]) => void;
  value: string[];
}

interface StatusOption {
  label: string;
  value: string;
}

export const QueuePageOrderStatusFilter = ({ onStatusChange, value }: QueuePageOrderStatusFilterProps) => {
  const { windowWidth } = useWindowWidth();
  const { mounted } = useMounted();

  const isLaptop = mounted && windowWidth > 768;

  const statusOptions: StatusOption[] = [
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Submitted', value: 'Sent_To_Pharmacy' },
  ];

  const selectedValues = statusOptions.filter((option) => value.includes(option.value));

  const handleChange = (selected: MultiValue<StatusOption>) => {
    if (!selected || selected.length === 0) {
      onStatusChange([]);
    } else {
      onStatusChange(selected.map((item) => item.value));
    }
  };

  return (
    <div className={`flex-grow-1 flex-md-grow-0 ${isLaptop ? 'w-200px' : 'w-auto'}`}>
      <ReactSelect
        isMulti
        styles={{
          ...commonStylesQuePageFilters,
          menu: (baseStyles: CSSObjectWithLabel) => ({
            ...baseStyles,
            minWidth: 200,
            zIndex: 1000,
          }),
          valueContainer: (baseStyles: CSSObjectWithLabel) => ({
            ...baseStyles,
            flexWrap: 'nowrap',
            overflow: 'hidden',
            maxWidth: '100%',
          }),
          multiValue: (baseStyles: CSSObjectWithLabel) => ({
            ...baseStyles,
            flexShrink: 0,
          }),
          multiValueLabel: (baseStyles: CSSObjectWithLabel) => ({
            ...baseStyles,
            whiteSpace: 'nowrap',
          }),
        }}
        options={statusOptions}
        value={selectedValues}
        onChange={handleChange}
        placeholder='Filter Status'
        isClearable
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
      />
    </div>
  );
};
