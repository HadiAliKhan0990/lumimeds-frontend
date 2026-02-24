'use client';

import VideoPlayIcon from '@/components/Icon/VideoPlayIcon';
import { QuePageBulkActionPallete } from '@/components/ProvidersModule/components/QuePageBulkActionPallete';
import {
  QueuePageDateFilter,
  QueuePageSearchFilter,
  QueuePageProductTypeFilter,
  commonStylesQuePageFilters,
} from '@/components/ProvidersModule/components/QueuePageFilters';
import { QueuePageFiltersWrapper } from '@/components/ProvidersModule/components/QueuePageFiltersContainer';
import {
  QueuePageFiltersTitle,
  QueuePageTitleAndFiltersWrapper,
} from '@/components/ProvidersModule/components/QueuePageTitleAndFiltersContainer';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { useMounted } from '@/hooks/usemounted';
import { StatusLabel } from '@/types/appointment';
import { ProductTypeFilter } from '@/types/approved';
import ReactSelect, { CSSObjectWithLabel } from 'react-select';

const APPOINTMENT_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending_confirmation' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Rescheduled', value: 'rescheduled' },
];

interface AppointmentsFiltersProps {
  onSearch?: (value: string) => void;
  onDateChange?: (date: string) => void;
  onStatusChange?: (status: { label: string; value: keyof StatusLabel }) => void;
  onSortChange?: (sort: string) => void;
  onProductTypeChange?: (option: { label: string; value: ProductTypeFilter | '' } | null) => void;
  appointmentCount?: number;
  onAssignToAdmin: (notes: string, callBack: () => void) => void;
  onSelectAll: () => void;
  isAllChecked: boolean;
  selectedDate?: string;
  selectedStatus?: { label: string; value: keyof StatusLabel };
  selectedSort?: string;
  selectedProductType?: { label: string; value: ProductTypeFilter | '' } | null;
  search?: string;
  isRevertingOrders: boolean;
  shouldAllowConfirmModal: boolean;
}

const AppointmentsStatusFilter = ({
  onStatusChange,
  value,
}: {
  onStatusChange: (status: { label: string; value: string }) => void;
  value: { label: string; value: string };
}) => {
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
            minWidth: 200,
            zIndex: 1000,
            right: 0,
            left: 'auto',
          }),
        }}
        options={[{ label: 'Status', value: '' }, ...APPOINTMENT_STATUS_OPTIONS]}
        value={value ? { label: value.label, value: value.value } : undefined}
        onChange={(option) => onStatusChange(option as { label: string; value: string })}
        placeholder='Status'
      />
    </div>
  );
};

export const AppointmentsFilters: React.FC<AppointmentsFiltersProps> = ({
  onSearch,
  onDateChange,
  onStatusChange,
  onProductTypeChange,
  // onSortChange,
  appointmentCount,
  onAssignToAdmin,
  onSelectAll,
  isAllChecked,
  selectedDate,
  selectedStatus,
  selectedProductType,
  // selectedSort,
  search,
  isRevertingOrders,
  shouldAllowConfirmModal,
}) => {
  return (
    <QueuePageTitleAndFiltersWrapper>
      <QueuePageFiltersTitle
        pageTitle={
          <div className='tw-flex tw-flex-wrap tw-gap-x-2 tw-gap-y-0 tw-items-center'>
            <span>Upcoming Sync Appointments </span>
            {appointmentCount !== undefined ? (
              <span className='text-muted fw-normal fs-6'>({appointmentCount} Today)</span>
            ) : null}{' '}
          </div>
        }
        icon={
          <span className='tw-self-start sm:tw-self-center tw-mt-0.5 sm:tw-mt-0'>
            <VideoPlayIcon className='text-muted' size={24} />
          </span>
        }
      />
      <QueuePageFiltersWrapper>
        <QueuePageSearchFilter
          key='search-filter'
          onSearch={(value: string) => onSearch?.(value)}
          value={search ?? ''}
        />
        <AppointmentsStatusFilter
          key='status-filter'
          onStatusChange={(status: { label: string; value: string }) =>
            onStatusChange?.(status as { label: string; value: keyof StatusLabel })
          }
          value={selectedStatus as { label: string; value: string }}
        />
        <QueuePageDateFilter
          key='date-filter'
          onDateChange={(date: string) => onDateChange?.(date)}
          value={selectedDate as string}
        />
        <QueuePageProductTypeFilter
          key='product-type-filter'
          onProductTypeChange={onProductTypeChange}
          value={selectedProductType}
        />
      </QueuePageFiltersWrapper>
      <div className='tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-w-full'>
        <QuePageBulkActionPallete
          onAssign={({ notes, callBack }: { notes: string; callBack: () => void }) => onAssignToAdmin(notes, callBack)}
          onSelectAll={onSelectAll}
          isAllChecked={isAllChecked}
          isAssigningToAdmin={isRevertingOrders}
          shoudAlloConfirmModal={shouldAllowConfirmModal}
        />
      </div>
    </QueuePageTitleAndFiltersWrapper>
  );
};
