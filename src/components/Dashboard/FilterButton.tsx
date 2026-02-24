'use client';
import { FilterGroup, FilterVisibility } from '@/components/Dashboard/Table/includes/FilterGroup';
import { MetaPayload } from '@/lib/types';

interface FilterButtonProps {
  onFilterChange?: (params: MetaPayload) => void;
  showApplyButton?: boolean;
  visibility?: FilterVisibility;
  extendedSortOptions?: boolean;
  filters?: string[];
  onSearchEnter?: (params: MetaPayload) => void;
  filtersClassName?: string;
  defaultFilterValue?: string;
  defaultValues?: Partial<MetaPayload>; // <-- renamed and typed for saved filters
}

export default function FilterButton({
  onFilterChange,
  visibility = {
    showSort: true,
    showSearch: true,
    showStatusFilter: true,
  },
  extendedSortOptions = false,
  filters,
  onSearchEnter,
  defaultValues, // <-- receive saved filters
  filtersClassName,
}: Readonly<FilterButtonProps>) {
  return (
    <FilterGroup
      visibility={visibility}
      handleChange={onFilterChange || (() => {})}
      extendedSortOptions={extendedSortOptions}
      filters={filters}
      onSearchEnter={onSearchEnter}
      defaultValues={defaultValues} // <-- pass saved filters down to FilterGroup
      className={filtersClassName || 'filter_group row g-3 tw-justify-start align-items-center'}
    />
  );
}
