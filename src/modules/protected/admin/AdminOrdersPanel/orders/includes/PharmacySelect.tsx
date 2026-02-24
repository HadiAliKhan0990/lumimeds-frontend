'use client';

import { Order } from '@/store/slices/orderSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useTransition, memo, useMemo, useCallback } from 'react';
import { ROUTES } from '@/constants';
import { capitalizeFirst, serializeOrderFilters } from '@/lib/helper';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';
import { PharmacyType } from '@/lib/types';
import Select, { SingleValue, StylesConfig, ClassNamesConfig, GroupBase } from 'react-select';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface PharmacyOption {
  value: string;
  label: string;
  pharmacy: PublicPharmacy | PharmacyType;
}

interface Props {
  order: Order;
  isLoading?: boolean;
  selectedPharmacy?: string;
  onPharmacyChange?: (pharmacy: PublicPharmacy | PharmacyType) => void;
}

// Move style objects outside component to prevent recreation
const customStyles: StylesConfig<PharmacyOption, false, GroupBase<PharmacyOption>> = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    minHeight: '36px',
    borderRadius: '6px',
    backgroundColor: state.isDisabled ? '#f8f9fa' : '#fff',
    borderColor: '#ced4da',
    fontSize: '14px',
    opacity: state.isDisabled ? 0.5 : 1,
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    minWidth: '130px',
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: '#6c757d',
    fontSize: '14px',
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: '#212529',
    fontSize: '14px',
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    fontSize: '14px',
    backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e9ecef' : '#fff',
    color: state.isSelected ? '#fff' : '#212529',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#0d6efd',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
};

const customClassNames: ClassNamesConfig<PharmacyOption, false, GroupBase<PharmacyOption>> = {
  control: () => 'w-100 rounded-1',
  menu: () => 'shadow-sm border-0',
  placeholder: () => 'text-dark font-size-base',
  singleValue: () => 'text-dark font-size-base text-capitalize',
  option: () => 'text-break text-wrap text-start text-capitalize',
  noOptionsMessage: () => 'text-break text-wrap text-center',
};


function PharmacySelectComponent({
  order,
  isLoading,
  selectedPharmacy: selectedPharmacyProp,
  onPharmacyChange,
}: Readonly<Props>) {
  const { push } = useRouter();
  const [isPending, startTransition] = useTransition();

  // Use pharmacies from the order (sorted by product priority) if available
  // Otherwise fallback to general pharmacy list from Redux state
  const pharmaciesFromState = useSelector((state: RootState) => state.adminPharmacies.pharmacies);
  const pharmacies = order.pharmacies && order.pharmacies.length > 0 ? order.pharmacies : pharmaciesFromState;

  // Memoize options array to prevent recreation on every render
  const options: PharmacyOption[] = useMemo(
    () =>
      pharmacies.map((pharmacy) => ({
        value: pharmacy.id,
        label: `${capitalizeFirst(pharmacy.name)}${pharmacy?.pharmacyType === 'manual' ? ' (Manual)' : ''}`,
        pharmacy,
      })),
    [pharmacies],
  );

  // Memoize selectedOption calculation
  const selectedOption: PharmacyOption | null = useMemo(
    () => options.find((opt) => opt.pharmacy.name === selectedPharmacyProp) || null,
    [options, selectedPharmacyProp],
  );

  const isDisabled = isLoading || isPending;

  // Get current filter state from Redux
  const currentFilters = useSelector((state: RootState) => ({
    search: state.sort.search,
    sortField: state.sort.sortField,
    sortOrder: state.sort.sortOrder,
    statusArray: state.sort.statusArray,
    pharmacyType: state.sort.pharmacyType,
    selectedAgent: state.sort.selectedAgent,
    startDate: state.sort.dateRange?.[0] ?? null,
    endDate: state.sort.dateRange?.[1] ?? null,
    searchColumn: state.sort.selectedCol,
    visitType: state.sort.visitType,
    newEmrFilter: state.sort.newEmrFilter,
  }));

  // Memoize change handler
  const handlePharmacyChange = useCallback(
    (selectedOption: SingleValue<PharmacyOption>) => {
      if (!selectedOption) return;

      const pharmacy = selectedOption.pharmacy;

      if (pharmacy && onPharmacyChange) onPharmacyChange(pharmacy);

      startTransition(() => {
        // Serialize current filters to query params
        // const filterParams = serializeOrderFilters(currentFilters);
              const filterParams = serializeOrderFilters({
                ...currentFilters,
                statusArray: currentFilters.statusArray ? [...currentFilters.statusArray] : undefined,
              });
        // Build URL with pharmacy params and filter params
        const baseUrl = `${ROUTES.ADMIN_PHARMACY_FORWARD_PRESCRIPTION}?pharmacyId=${encodeURIComponent(
          pharmacy?.id ?? '',
        )}&orderId=${encodeURIComponent(order.id ?? '')}`;
        
        const filterQueryString = filterParams.toString();
        const finalUrl = filterQueryString ? `${baseUrl}&${filterQueryString}` : baseUrl;
        
        push(finalUrl);
      });
    },
    [onPharmacyChange, order.id, push, currentFilters],
  );

  const pharmacyName = selectedPharmacyProp || order?.pharmacyName || 'N/A';

  return (
    <OverlayTrigger overlay={<Tooltip id='pharmacy-tooltip'>{pharmacyName}</Tooltip>}>
      <div onClick={(event) => event.stopPropagation()}>
        <Select
          value={selectedOption}
          options={options}
          onChange={handlePharmacyChange}
          isDisabled={isDisabled}
          placeholder=''
          isSearchable={true}
          noOptionsMessage={() => 'No Pharmacies Found'}
          styles={customStyles}
          classNames={customClassNames}
        />
      </div>
    </OverlayTrigger>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const PharmacySelect = memo(PharmacySelectComponent, (prevProps, nextProps) => {
  // Only re-render if these props change (ignore onPharmacyChange callback)
  // Compare pharmacies array by value, not reference
  const pharmaciesEqual =
    (prevProps.order.pharmacies?.length ?? 0) === (nextProps.order.pharmacies?.length ?? 0) &&
    (prevProps.order.pharmacies?.every((p, i) => p.id === nextProps.order.pharmacies?.[i]?.id) ?? true);

  return (
    prevProps.order.id === nextProps.order.id &&
    pharmaciesEqual &&
    prevProps.selectedPharmacy === nextProps.selectedPharmacy &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.order.metadata?.intervalCount === nextProps.order.metadata?.intervalCount &&
    prevProps.order.shippedVials === nextProps.order.shippedVials
  );
});
