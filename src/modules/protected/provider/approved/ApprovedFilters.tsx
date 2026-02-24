'use client';

import ApprovedHeadingIcon from '@/components/Icon/ApprovedHeadingIcon';
import {
  QueuePageSearchFilter,
  QueuePageDatePresetFilter,
  QueuePageOrderStatusFilter,
  QueuePageSortFilter,
  QueuePageProductTypeFilter,
} from '@/components/ProvidersModule/components/QueuePageFilters';
import {
  QueuePageTitleAndFiltersWrapper,
  QueuePageFiltersTitle,
} from '@/components/ProvidersModule/components/QueuePageTitleAndFiltersContainer';
import { QueuePageFiltersWrapper } from '@/components/ProvidersModule/components/QueuePageFiltersContainer';
import { ProductTypeFilter } from '@/types/approved';

interface ApprovedFiltersProps {
  onSearch: (value: string) => void;
  onDatePresetChange?: (option: { label: string; value: string } | null) => void;
  onCustomDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
  onStatusChange?: (statuses: string[]) => void;
  onSortChange?: (sortBy?: { label: string; value: string }, sortOrder?: string) => void;
  onProductTypeChange?: (option: { label: string; value: ProductTypeFilter | '' } | null) => void;
  approvedCount?: number;
  selectedDatePreset?: { label: string; value: string } | null;
  customDateRange?: [Date | null, Date | null];
  showCustomDatePicker?: boolean;
  selectedStatuses?: string[];
  selectedSort: { label: string; value: string };
  selectedProductType?: { label: string; value: ProductTypeFilter | '' } | null;
  search?: string;
}

export const ApprovedFilters: React.FC<ApprovedFiltersProps> = ({
  onSearch,
  onDatePresetChange,
  onCustomDateRangeChange,
  onStatusChange,
  onSortChange,
  onProductTypeChange,
  approvedCount = 0,
  selectedDatePreset,
  customDateRange,
  showCustomDatePicker,
  selectedStatuses = [],
  search,
  selectedSort,
  selectedProductType,
}) => {
  return (
    <QueuePageTitleAndFiltersWrapper>
      <QueuePageFiltersTitle
        pageTitle={
          <div className='tw-flex tw-flex-wrap tw-gap-x-2 tw-gap-y-0 tw-items-center'>
            <span>Approved Rx</span>
            <span className='text-muted fw-normal fs-6'>{`(${approvedCount} Today)`}</span>
          </div>
        }
        icon={<ApprovedHeadingIcon className='text-muted' size={18} />}
      />
      <QueuePageFiltersWrapper>
        <QueuePageSearchFilter onSearch={onSearch} value={search ?? ''} />
        <QueuePageDatePresetFilter
          onDatePresetChange={(option) => onDatePresetChange?.(option)}
          onCustomDateRangeChange={(start, end) => onCustomDateRangeChange?.(start, end)}
          selectedPreset={selectedDatePreset}
          customDateRange={customDateRange}
          showCustomPicker={showCustomDatePicker}
        />
        <QueuePageOrderStatusFilter
          onStatusChange={(statuses) => onStatusChange?.(statuses)}
          value={selectedStatuses}
        />
        <QueuePageProductTypeFilter
          onProductTypeChange={onProductTypeChange}
          value={selectedProductType}
        />
        <QueuePageSortFilter
          sortOptions={[
            { label: 'Sort By', value: '' },
            {
              value: 'approvalDate:DESC',
              label: 'Newest',
              sortOrder: 'DESC',
            },
            {
              value: 'approvalDate:ASC',
              label: 'Oldest',
              sortOrder: 'ASC',
            },
          ]}
          onSortChange={(sortBy, sortOrder) => onSortChange?.(sortBy, sortOrder)}
          value={selectedSort}
        />
      </QueuePageFiltersWrapper>
    </QueuePageTitleAndFiltersWrapper>
  );
};
