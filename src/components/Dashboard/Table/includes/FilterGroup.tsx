'use client';

import Search from '@/components/Dashboard/Search';
import {
  setMeta,
  setSearch,
  setSearchString,
  setSortField,
  setSortFilter,
  setSortOrder,
  setSortStatus,
  setStatusArray,
  setSubscriptionType,
  setSubscriptionStatus,
  setSelectedCol,
  setDateRange,
  setDatePreset,
  setVisitType,
  setNewEmrFilter,
  setProductType,
} from '@/store/slices/sortSlice';
import { debounce } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RootState } from '@/store';
import { usePathname } from 'next/navigation';
import {
  AGENT_STATUSES,
  INVOICE_FILTERS,
  MEDICATION_FILTERS,
  MEDICATION_PRODUCTS_FILTERS,
  ORDER_STATUSES,
  ORDER_STATUSES_ADMIN,
  ORDER_STATUSES_PATIENT,
  PROVIDER_STATUSES,
  ROUTES,
  SUBSCRIPTION_FILTERS,
  SUBSCRIPTION_STATUS_FILTERS,
} from '@/constants';
import { formatStatusString } from '@/lib';
import { GroupBase, MultiValue, OptionsOrGroups, SingleValue } from 'react-select';
import { MetaPayload, OptionValue } from '@/lib/types';
import { convertStringCamelCaseHandler, removeSearchParamsObject } from '@/lib/helper';
import { ReactSelect } from '@/components/elements/ReactSelect';
import { PlanType } from '@/types/medications';
import {
  ADMIN_ORDER_DATE_PRESET_OPTIONS,
  findMatchingDatePreset,
  getDatePresetRange,
  isDatePresetKey,
} from '@/helpers/datePresets';
import { ReactDatePicker } from '@/components/elements';
import { format, parse } from 'date-fns';
import { DatePresetKey } from '@/types/datePresets';
import { WEIGHT_LOSS_LABEL, WELLNESS_LABEL } from '@/constants/factory';

export interface FilterVisibility {
  showSearch?: boolean;
  showSearchClassName?: string;
  showStatusFilter?: boolean;
  showStatusFilterClassName?: string;
  showSort?: boolean;
  showSortClassName?: string;
  showMultiSelect?: boolean;
  showMultiSelectClassName?: string;
  showArchiveFilter?: boolean;
  showArchiveFilterClassName?: string;
  showSubscriptionType?: boolean;
  showSubscriptionTypeClassName?: string;
  showSubscriptionStatusFilter?: boolean;
  showSubscriptionStatusFilterClassName?: string;
  showPharmacyTypeSelect?: boolean;
  showPharmacyTypeSelectClassName?: string;
  showAgentSelect?: boolean;
  showAgentSelectClassName?: string;
  showDateRange?: boolean;
  showDateRangeClassName?: string;
  showDatePresetClassName?: string;
  showSelectCol?: boolean;
  showSelectColClassName?: string;
  showVisitTypeFilter?: boolean;
  showVisitTypeFilterClassName?: string;
  showNewEmrFilter?: boolean;
  showNewEmrFilterClassName?: string;
  showProductTypeFilter?: boolean;
  showProductTypeFilterClassName?: string;
}

export const pharmacyTagTypeOptions: OptionsOrGroups<OptionValue, GroupBase<OptionValue>> = [
  { label: 'Auto', value: 'api' },
  { label: 'Manual', value: 'manual' },
];

interface Props {
  defaultValues?: Partial<MetaPayload>;

  defaultFilterValue?: string | null;
  isPatient?: boolean;
  handleChange: (arg: MetaPayload) => void;
  isLoading?: boolean;
  extendedSortOptions?: boolean;
  isPrescriptions?: boolean;
  visibility?: FilterVisibility;
  filters?: string[];
  sortFilters?: string[];
  sortFilterPlaceholder?: string;
  query?: string;
  role?: string;
  onSearchEnter?: (arg: MetaPayload) => void;
  className?: string;
}

export const FilterGroup = ({
  defaultFilterValue = 'Filters',
  isPatient = false,
  handleChange,
  isLoading,
  extendedSortOptions = false,
  isPrescriptions,
  visibility = {
    showSearch: true,
    showStatusFilter: true,
    showSort: true,
    showMultiSelect: true,
    showArchiveFilter: false,
  },
  filters,
  sortFilters,
  sortFilterPlaceholder,
  query,
  role,
  onSearchEnter,
  className,
}: Props) => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/\/$/, '');
  const [isMounted, setIsMounted] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const previousPathnameRef = useRef(normalizedPath);
  const previousOrderTypeRef = useRef<string | undefined>(undefined);
  const previousSearchableColumnsLengthRef = useRef(0);

  // accepted, approved, active for providers
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortFilter = useSelector((state: RootState) => state.sort.sortFilter);
  const statusArray = useSelector((state: RootState) => state.sort.statusArray);
  const search = useSelector((state: RootState) => state.sort.search);
  const searchString = useSelector((state: RootState) => state.sort.searchString);
  const subscriptionType = useSelector((state: RootState) => state.sort.subscriptionType);
  const subscriptionStatus = useSelector((state: RootState) => state.sort.subscriptionStatus);

  const searchableColumns = useSelector((state: RootState) => state.sort.searchableColumns);

  const selectedCol = useSelector((state: RootState) => state.sort.selectedCol);

  const pharmacyType = useSelector((state: RootState) => state.sort.pharmacyTagType);

  const selectedAgent = useSelector((state: RootState) => state.sort.selectedAgent);

  const orderFilterType = useSelector((state: RootState) => state.sort.orderFilterType);

  const dateRange = useSelector((state: RootState) => state.sort.dateRange);
  const datePreset = useSelector((state: RootState) => state.sort.datePreset);
  const visitType = useSelector((state: RootState) => state.sort.visitType);
  const newEmrFilter = useSelector((state: RootState) => state.sort.newEmrFilter);
  const productType = useSelector((state: RootState) => state.sort.productType);

  const userType = useSelector((state: RootState) => state.sort.userType);
  const orderType = useSelector((state: RootState) => state.sort.orderType);
  const medicationType = useSelector((state: RootState) => state.medication.medicationType);

  const startDate = dateRange?.[0];

  const endDate = dateRange?.[1];

  // Sync local date state with Redux

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (datePreset !== 'custom') {
      setShowCustomDatePicker(false);
    }
  }, [datePreset]);

  const computedSortFilters = useMemo(() => {
    if (filters && filters.length > 0) return filters;
    else if (
      (normalizedPath === ROUTES.ADMIN_ORDERS || normalizedPath === ROUTES.PATIENT_ORDERS) &&
      orderType === 'Orders'
    ) {
      if (normalizedPath === ROUTES.PATIENT_ORDERS) {
        return ORDER_STATUSES_PATIENT.map((status) => status.value);
      }
      return ORDER_STATUSES;
    }
    else if (normalizedPath === ROUTES.ADMIN_ORDERS && orderType === 'Subscriptions') return SUBSCRIPTION_FILTERS;
    else if (
      (normalizedPath === ROUTES.ADMIN_ORDERS || normalizedPath === ROUTES.PATIENT_ORDERS) &&
      orderType === 'Invoices'
    )
      return INVOICE_FILTERS;
    else if (userType === 'Provider') return PROVIDER_STATUSES;
    else if (userType === 'Agent') return AGENT_STATUSES;
    else if (normalizedPath === ROUTES.ADMIN_MEDICATIONS)
      return medicationType === 'Medications' ? MEDICATION_FILTERS : MEDICATION_PRODUCTS_FILTERS;
    else if (normalizedPath === ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS) return INVOICE_FILTERS;
    return [];
  }, [normalizedPath, userType, orderType, medicationType, filters]);

  // Restrict admin search to patient name/email only where applicable
  const isEmail = (input: string) => {
    const v = (input || '').trim();
    // Simple but practical email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  const normalizeName = (input: string) => {
    return (input || '')
      .replace(/[^a-zA-Z0-9\s'@.+_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const restrictSearchIfAdminPatientContext = (raw?: string): string | undefined => {
    if (!raw) return undefined;
    const isAdminPath = pathname.startsWith('/admin');
    const isAdminOrders = normalizedPath === ROUTES.ADMIN_ORDERS;
    const isAdminUsersPatients = normalizedPath === ROUTES.ADMIN_USERS && userType === 'Patient';
    const isAdminUsersProviders = normalizedPath === ROUTES.ADMIN_USERS && userType === 'Provider';

    // Apply restriction on admin orders, admin users (patients tab), and admin users (providers tab)
    if (!(isAdminPath && (isAdminOrders || isAdminUsersPatients || isAdminUsersProviders))) return raw;

    if (isEmail(raw)) return raw.trim();
    const name = normalizeName(raw);
    return name || undefined;
  };

  const effectiveSearchColumn = useMemo(() => {
    if (selectedCol) return selectedCol;

    const patientNameColumn = searchableColumns?.find(
      (col) => col.toLowerCase().includes('patient') && col.toLowerCase().includes('name')
    );
    if (patientNameColumn) return patientNameColumn;

    return searchableColumns?.find((col) => col === 'patientName') || searchableColumns?.[0] || null;
  }, [selectedCol, searchableColumns]);

  // Use refs to capture latest values without recreating the debounced function
  const latestValuesRef = useRef({
    sortField,
    sortOrder,
    sortStatus,
    statusArray,
    handleChange,
    selectedCol: selectedCol ?? null,
    effectiveSearchColumn: effectiveSearchColumn ?? null,
    pathname,
    normalizedPath,
    userType,
    subscriptionType,
    subscriptionStatus,
    pharmacyType,
    selectedAgent,
    startDate,
    endDate,
    search,
    visitType,
    newEmrFilter,
    productType,
  });

  useEffect(() => {
    latestValuesRef.current = {
      sortField,
      sortOrder,
      sortStatus,
      statusArray,
      handleChange,
      selectedCol,
      effectiveSearchColumn,
      pathname,
      normalizedPath,
      userType,
      subscriptionType,
      subscriptionStatus,
      pharmacyType,
      selectedAgent,
      startDate,
      endDate,
      search,
      visitType,
      newEmrFilter,
      productType,
    };
  }, [
    sortField,
    sortOrder,
    sortStatus,
    statusArray,
    handleChange,
    pathname,
    normalizedPath,
    userType,
    selectedCol,
    effectiveSearchColumn,
    subscriptionType,
    subscriptionStatus,
    pharmacyType,
    selectedAgent,
    startDate,
      endDate,
      search,
      visitType,
      newEmrFilter,
      productType,
  ]);

  // Create the debounced function once and reuse it
  const debouncedFn = useMemo(
    () =>
      debounce((value: string) => {
        const {
          sortField,
          sortOrder,
          sortStatus,
          statusArray,
          handleChange,
          pathname,
          normalizedPath,
          userType,
          effectiveSearchColumn,
          subscriptionType,
          subscriptionStatus,
          pharmacyType,
          selectedAgent,
          startDate,
          endDate,
          selectedCol,
          visitType,
          newEmrFilter,
          productType,
        } = latestValuesRef.current;

        let sanitized: string | undefined = value;
        if (value) {
          const isAdminPath = pathname.startsWith('/admin');
          const isAdminOrders = normalizedPath === ROUTES.ADMIN_ORDERS;
          const isAdminUsersPatients = normalizedPath === ROUTES.ADMIN_USERS && userType === 'Patient';
          const isAdminUsersProviders = normalizedPath === ROUTES.ADMIN_USERS && userType === 'Provider';

          if (isAdminPath && (isAdminOrders || isAdminUsersPatients || isAdminUsersProviders)) {
            if (isEmail(value)) {
              sanitized = value.trim();
            } else {
              const name = normalizeName(value);
              sanitized = name || undefined;
            }
          }
        } else {
          sanitized = undefined;
        }

        dispatch(setSearch(sanitized !== undefined && sanitized !== '' ? sanitized : undefined));
        dispatch(setMeta({ page: 1 }));

        // When search is empty, only use searchColumn if user explicitly selected one
        const searchColumnToUse = sanitized ? effectiveSearchColumn : selectedCol ? selectedCol : null;

        handleChange({
          search: sanitized,
          sortField,
          sortOrder,
          sortStatus,
          statusArray,
          subscriptionType,
          subscriptionStatus,
          pharmacyType,
          selectedAgent,
          startDate,
          endDate,
          searchColumn: searchColumnToUse,
          visitType,
          newEmrFilter,
          productType,
          meta: { page: 1, limit: 10 },
        });
      }, 750),
    [dispatch]
  );

  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  const getExtendedSortValue = () => {
    if (!sortField || !sortOrder) return 'default';
    return `${sortField}:${sortOrder}`;
  };

  const onSortChange = (value: string) => {
    if (extendedSortOptions) {
      if (!value || value === 'default') {
        dispatch(setSortField(undefined));
        dispatch(setSortOrder(undefined));
        dispatch(setMeta({ page: 1, limit: 10 }));
        handleChange({
          sortField: undefined,
          sortOrder: undefined,
          search,
          sortStatus,
          statusArray,
          subscriptionStatus,
          subscriptionType,
          startDate,
          endDate,
          searchColumn: effectiveSearchColumn,
          visitType,
          newEmrFilter,
          productType,
          meta: { page: 1, limit: 10 },
        });
        return;
      }

      if (value.includes(':')) {
        const [field, order] = value.split(':');
        dispatch(setSortField(field));
        dispatch(setSortOrder(order));
        dispatch(setMeta({ page: 1, limit: 10 }));
        handleChange({
          sortField: field,
          sortOrder: order,
          search,
          sortStatus,
          statusArray,
          subscriptionStatus,
          subscriptionType,
          startDate,
          endDate,
          searchColumn: effectiveSearchColumn,
          visitType,
          newEmrFilter,
          productType,
          meta: { page: 1, limit: 10 },
        });
        return;
      }

      // Safety fallback for unexpected values: reset
      dispatch(setSortField(undefined));
      dispatch(setSortOrder(undefined));
      dispatch(setMeta({ page: 1, limit: 10 }));
      handleChange({
        sortField: undefined,
        sortOrder: undefined,
        search,
        sortStatus,
        statusArray,
        subscriptionStatus,
        orderFilterType,
        subscriptionType,
        startDate,
        endDate,
        searchColumn: effectiveSearchColumn,
        visitType,
        newEmrFilter,
        productType,
        meta: { page: 1, limit: 10 },
      });
      return;
    }

    // Non-extended sort: values are 'ASC' | 'DESC' and placeholder ''
    if (!value) {
      dispatch(setSortOrder(undefined));
      dispatch(setMeta({ page: 1, limit: 10 }));
      handleChange({
        sortOrder: undefined,
        sortField,
        search,
        orderFilterType,
        sortStatus,
        statusArray,
        subscriptionType,
        subscriptionStatus,
        pharmacyType,
        selectedAgent,
        startDate,
        endDate,
        searchColumn: effectiveSearchColumn,
        visitType,
        newEmrFilter,
        productType,
        meta: { page: 1, limit: 10 },
      });
      return;
    }

    dispatch(setSortOrder(value));
    dispatch(setMeta({ page: 1, limit: 10 }));
    handleChange({
      sortOrder: value,
      sortField,
      search,
      sortStatus,
      statusArray,
      subscriptionStatus,
      subscriptionType,
      startDate,
      endDate,
      searchColumn: effectiveSearchColumn,
      visitType,
      newEmrFilter,
      productType,
      meta: { page: 1, limit: 10 },
    });
  };

  const onSearchChange = (value: string) => {
    if (!value && query) {
      removeSearchParamsObject(pathname, { r: role ?? '', q: query ?? '' });
    }

    dispatch(setSearchString(value));

    if (!value) {
      dispatch(setSearch(undefined));
      dispatch(setMeta({ page: 1, limit: 10 }));

      // When clearing search, don't pass searchColumn if user hasn't explicitly selected one
      const searchColumnToUse = selectedCol ? selectedCol : null;

      if (onSearchEnter) {
        onSearchEnter({
          search: undefined,
          sortField,
          sortOrder,
          sortStatus,
          statusArray,
          subscriptionType,
          pharmacyType,
          selectedAgent,
          startDate,
          endDate,
          searchColumn: searchColumnToUse,
          visitType,
          newEmrFilter,
          productType,
          meta: { page: 1, limit: 10 },
        });
      } else {
        handleChange({
          search: undefined,
          sortField,
          sortOrder,
          sortStatus,
          statusArray,
          subscriptionStatus,
          pharmacyType,
          selectedAgent,
          subscriptionType,
          startDate,
          endDate,
          searchColumn: searchColumnToUse,
          visitType,
          newEmrFilter,
          productType,
          meta: { page: 1, limit: 10 },
        });
      }
    } else {
      debouncedFn(value);
    }
  };

  const onSearchKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key !== 'Enter') return;
    const raw = (e.currentTarget.value || '').trim();
    const isAdminPath = pathname.startsWith('/admin');
    const isAdminOrders = normalizedPath === ROUTES.ADMIN_ORDERS;
    const isAdminUsersPatients = normalizedPath === ROUTES.ADMIN_USERS && userType === 'Patient';
    const isAdminUsersProviders = normalizedPath === ROUTES.ADMIN_USERS && userType === 'Provider';
    let sanitized: string | undefined = raw;
    if (raw) {
      if (isAdminPath && (isAdminOrders || isAdminUsersPatients || isAdminUsersProviders)) {
        if (isEmail(raw)) sanitized = raw;
        else {
          const name = normalizeName(raw);
          sanitized = name || undefined;
        }
      }
    } else {
      sanitized = undefined;
    }
    dispatch(setSearch(sanitized !== undefined && sanitized !== '' ? sanitized : undefined));
    dispatch(setMeta({ page: 1, limit: 10 }));
    onSearchEnter?.({
      search: sanitized,
      sortField,
      sortOrder,
      sortStatus,
      statusArray,
      pharmacyType,
      selectedAgent,
      subscriptionType,
      startDate,
      endDate,
      searchColumn: effectiveSearchColumn,
      visitType,
      newEmrFilter,
      meta: { page: 1, limit: 10 },
    });
  };
const onFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const { value } = e.currentTarget;
  dispatch(setMeta({ page: 1, limit: 10 }));

const appliedValue: string = value || 'default';

const appliedSortField = appliedValue.startsWith('Duration')
  ? `duration: ${appliedValue.match(/\d+/)?.[0]}`
  : undefined;

  if (normalizedPath === ROUTES.ADMIN_ORDERS && orderType === 'Subscriptions') {
    switch (appliedValue) {
      case 'Duration (1 Month)':
        dispatch(setSortField('duration: 1'));
        dispatch(setSortStatus(appliedValue));
        handleChange({
          sortField: 'duration: 1',
          pharmacyType,
          selectedAgent,
          search,
          sortOrder,
          orderFilterType,
          sortStatus: appliedValue,
          subscriptionType,
          subscriptionStatus,
          statusArray,
          startDate,
          endDate,
          searchColumn: effectiveSearchColumn,
          visitType,
          newEmrFilter,
          meta: { page: 1, limit: 10 },
        });
        break;
      case 'Duration (3 Months)':
        dispatch(setSortField('duration: 3'));
        dispatch(setSortStatus(appliedValue));
        handleChange({
          sortField: 'duration: 3',
          search,
          orderFilterType,
          sortOrder,
          sortStatus: appliedValue,
          statusArray,
          subscriptionType,
          subscriptionStatus,
          pharmacyType,
          selectedAgent,
          startDate,
          endDate,
          searchColumn: effectiveSearchColumn,
          visitType,
          newEmrFilter,
          meta: { page: 1, limit: 10 },
        });
        break;
      case 'Duration (6 Months)':
        dispatch(setSortField('duration: 6'));
        dispatch(setSortStatus(appliedValue));
        handleChange({
          sortField: 'duration: 6',
          search,
          sortOrder,
          orderFilterType,
          sortStatus: appliedValue,
          statusArray,
          subscriptionType,
          subscriptionStatus,
          pharmacyType,
          selectedAgent,
          startDate,
          endDate,
          searchColumn: effectiveSearchColumn,
          visitType,
          newEmrFilter,
          meta: { page: 1, limit: 10 },
        });
        break;
      default:
        dispatch(setSortField(appliedSortField ?? (appliedValue === 'default' ? null : appliedValue)));
        dispatch(setSortStatus(appliedValue));
        handleChange({
          sortField: appliedSortField ?? (appliedValue === 'default' ? undefined : appliedValue),
          search,
          sortOrder,
          orderFilterType,
          sortStatus: appliedValue,
          statusArray,
          subscriptionType,
          subscriptionStatus,
          pharmacyType,
          selectedAgent,
          startDate,
          endDate,
          searchColumn: effectiveSearchColumn,
          visitType,
          newEmrFilter,
          meta: { page: 1, limit: 10 },
        });
        break;
    }
  } else {
    dispatch(setSortStatus(appliedValue === 'default' ? '' : appliedValue));
    handleChange({
      sortStatus: appliedValue === 'default' ? '' : appliedValue,
      sortField,
      sortOrder,
      search,
      orderFilterType,
      statusArray,
      subscriptionType,
      subscriptionStatus,
      pharmacyType,
      selectedAgent,
      startDate,
      endDate,
      visitType,
      newEmrFilter,
      meta: { page: 1, limit: 10 },
    });
  }
};

  const handleArchiveFilterChange = (value: unknown) => {
    const sortFilter = value as SingleValue<OptionValue>;
    dispatch(setSortFilter(sortFilter));
    dispatch(setMeta({ page: 1 }));
    handleChange({
      sortFilter,
      sortField,
      sortOrder,
      sortStatus,
      orderFilterType,
      statusArray,
      search,
      subscriptionType,
      subscriptionStatus,
      pharmacyType,
      selectedAgent,
      startDate,
      endDate,
      visitType,
      newEmrFilter,
      meta: { page: 1, limit: 10 },
    });
  };

  function handleChangeSubscriptionType(target: unknown) {
    const { value } = target as OptionValue;
    dispatch(setSubscriptionType(value as PlanType));
    dispatch(setMeta({ page: 1, limit: 10 }));
    handleChange({
      sortFilter,
      sortField,
      sortOrder,
      sortStatus,
      statusArray,
      search,
      subscriptionType: value as PlanType,
      subscriptionStatus,
      pharmacyType,
      selectedAgent,
      startDate,
      endDate,
      visitType,
      newEmrFilter,
      meta: { page: 1, limit: 10 },
    });
  }

  function handleChangeSubscriptionStatus(target: unknown) {
    const option = target as OptionValue | null;
    const value = option?.value ? String(option.value) : null;
    dispatch(setSubscriptionStatus(value));
    dispatch(setMeta({ page: 1, limit: 10 }));
    handleChange({
      sortFilter,
      sortField,
      sortOrder,
      sortStatus,
      statusArray,
      search,
      subscriptionType,
      subscriptionStatus: value || undefined,
      pharmacyType,
      selectedAgent,
      startDate,
      endDate,
      visitType,
      newEmrFilter,
      meta: { page: 1, limit: 10 },
    });
  }

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;

    const startDateValue = start ? format(start, 'yyyy-MM-dd') : '';
    const endDateValue = end ? format(end, 'yyyy-MM-dd') : '';
    const startDate = startDateValue || null;
    const endDate = endDateValue || null;

    // When both dates cleared
    if (!startDate && !endDate) {
      setShowCustomDatePicker(false);
      dispatch(setDateRange([null, null]));
      dispatch(setDatePreset(null));
      dispatch(setMeta({ page: 1, limit: 30 }));
      handleChange({
        selectedAgent,
        sortField,
        sortOrder,
        sortStatus,
        statusArray,
        search,
        subscriptionType,
        pharmacyType,
        orderFilterType,
        startDate: null,
        endDate: null,
        searchColumn: effectiveSearchColumn,
        visitType,
        newEmrFilter,
        productType,
        meta: { page: 1, limit: 30 },
      });
      return;
    }

    dispatch(setDateRange([startDate, endDate]));

    if (!startDate || !endDate) {
      dispatch(setDatePreset('custom'));
      setShowCustomDatePicker(true);
      return;
    }

    const matchedPreset = findMatchingDatePreset(startDate, endDate) ?? 'custom';
    dispatch(setDatePreset(matchedPreset));
    setShowCustomDatePicker(false);
    dispatch(setMeta({ page: 1, limit: 30 }));

    handleChange({
      selectedAgent,
      sortField,
      sortOrder,
      sortStatus,
      statusArray,
      search,
      subscriptionType,
      subscriptionStatus,
      pharmacyType,
      orderFilterType,
      startDate,
      endDate,
      searchColumn: effectiveSearchColumn,
      visitType,
      newEmrFilter,
      productType,
      meta: { page: 1, limit: 30 },
    });
  };

  const handleDatePresetChange = (option: unknown) => {
    const value = (option as OptionValue | null)?.value;

    if (!value) {
      setShowCustomDatePicker(false);
      dispatch(setDatePreset(null));
      dispatch(setDateRange([null, null]));
      dispatch(setMeta({ page: 1, limit: 30 }));
      handleChange({
        selectedAgent,
        sortField,
        sortOrder,
        sortStatus,
        statusArray,
        search,
        subscriptionType,
        pharmacyType,
        orderFilterType,
        startDate: null,
        endDate: null,
        searchColumn: effectiveSearchColumn,
        visitType,
        newEmrFilter,
        productType,
        meta: { page: 1, limit: 30 },
      });
      return;
    }

    if (!isDatePresetKey(String(value))) {
      return;
    }

    const presetValue = value as DatePresetKey;

    if (presetValue === 'custom') {
      dispatch(setDatePreset('custom'));
      dispatch(setDateRange([null, null]));
      setShowCustomDatePicker(true);
      return;
    }

    const range = getDatePresetRange(presetValue);

    if (!range) return;

    const startDate = range.startDate;
    const endDate = range.endDate;

    dispatch(setDatePreset(presetValue));
    dispatch(setDateRange([startDate, endDate]));
    dispatch(setMeta({ page: 1, limit: 30 }));

    handleChange({
      selectedAgent,
      sortField,
      sortOrder,
      sortStatus,
      statusArray,
      search,
      subscriptionType,
      pharmacyType,
      orderFilterType,
      startDate,
      endDate,
      searchColumn: effectiveSearchColumn,
      visitType,
      newEmrFilter,
      productType,
      meta: { page: 1, limit: 30 },
    });
  };

  const datePresetOptions = useMemo(
    () =>
      ADMIN_ORDER_DATE_PRESET_OPTIONS.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    []
  );

  const visitTypeOptions = useMemo(
    () => [
      { label: 'Video', value: 'video' },
      { label: 'Document', value: 'document' },
      { label: 'Both', value: 'both' },
    ],
    []
  );

  const handleVisitTypeChange = (option: unknown) => {
    const value = (option as OptionValue | null)?.value as 'video' | 'document' | 'both' | null;
    dispatch(setVisitType(value || null));
    dispatch(setMeta({ page: 1 }));
    handleChange({
      visitType: value || null,
      sortField,
      sortOrder,
      sortStatus,
      statusArray,
      search,
      subscriptionType,
      subscriptionStatus,
      pharmacyType,
      selectedAgent,
      orderFilterType,
      startDate,
      endDate,
      searchColumn: effectiveSearchColumn,
      newEmrFilter,
      meta: { page: 1, limit: 10 },
    });
  };

  const emrFilterOptions = useMemo(
    () => [
      { label: 'NewEMR', value: 'newEmr' },
      { label: 'TelePath', value: 'telepath' },
      { label: 'Both', value: 'both' },
    ],
    []
  );

  const handleNewEmrFilterChange = (option: unknown) => {
    const value = (option as OptionValue | null)?.value as 'newEmr' | 'telepath' | 'both' | null;
    dispatch(setNewEmrFilter(value || null));
    dispatch(setMeta({ page: 1 }));
    handleChange({
      newEmrFilter: value || null,
      visitType,
      sortField,
      sortOrder,
      sortStatus,
      statusArray,
      search,
      subscriptionType,
      subscriptionStatus,
      pharmacyType,
      selectedAgent,
      orderFilterType,
      startDate,
      endDate,
      productType,
      searchColumn: effectiveSearchColumn,
      meta: { page: 1, limit: 10 },
    });
  };

  const productTypeOptions = useMemo(
    () => [
      { label: WEIGHT_LOSS_LABEL, value: 'weight_loss' },
      { label: WELLNESS_LABEL, value: 'longevity' },
    ],
    []
  );

  const handleProductTypeChange = (option: unknown) => {
    const value = (option as OptionValue | null)?.value as 'weight_loss' | 'longevity' | null;
    dispatch(setProductType(value || null));
    dispatch(setMeta({ page: 1 }));
    handleChange({
      productType: value || null,
      visitType,
      newEmrFilter,
      sortField,
      sortOrder,
      sortStatus,
      statusArray,
      search,
      subscriptionType,
      subscriptionStatus,
      pharmacyType,
      selectedAgent,
      orderFilterType,
      startDate,
      endDate,
      searchColumn: effectiveSearchColumn,
      meta: { page: 1, limit: 10 },
    });
  };

  const isOrders = normalizedPath === ROUTES.ADMIN_ORDERS && (orderType === 'Orders' || orderType === 'Renewals');

  

  const sortItems = useMemo(() => {
    if (isPrescriptions) {
      return [
        { value: 'createdAt:ASC', label: 'Date (Oldest)' },
        { value: 'createdAt:DESC', label: 'Date (Newest)' },
        { value: 'status:ASC', label: 'Status (ASC)' },
        { value: 'status:DESC', label: 'Status (DESC)' },
      ].sort((a, b) => a.label.localeCompare(b.label));
    }

    return [
      { value: 'orderUniqueId:ASC', label: 'Order ID (Ascending)' },
      { value: 'orderUniqueId:DESC', label: 'Order ID (Descending)' },
      { value: 'customer:ASC', label: 'Customer Name (A-Z)' },
      { value: 'customer:DESC', label: 'Customer Name (Z-A)' },
      { value: 'createdAt:DESC', label: 'Date (Newest)' },
      { value: 'createdAt:ASC', label: 'Date (Oldest)' },
      { value: 'amount:DESC', label: 'Amount (High to Low)' },
      { value: 'amount:ASC', label: 'Amount (Low to High)' },
      { value: 'status:ASC', label: 'Status (A-Z)' },
      { value: 'status:DESC', label: 'Status (Z-A)' },
    ].sort((a, b) => a.label.localeCompare(b.label));
  }, [isPrescriptions]);

  const sortFiltersOptions: OptionsOrGroups<OptionValue, GroupBase<OptionValue>> = useMemo(() => {
    return (
      sortFilters
        ?.map((filter) => ({
          label: filter,
          value: filter,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)) || []
    );
  }, [sortFilters]);

  const subscriptionTypeOptions = useMemo(() => {
    const options = [PlanType.ONE_TIME, PlanType.RECURRING];
    return options
      .map((title) => ({ label: PlanType.ONE_TIME === title ? 'One Time' : 'Recurring', value: title }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const subscriptionStatusOptions = useMemo(() => {
    const statusLabels: Record<string, string> = {
      active: 'Active',
      paused: 'Paused',
      canceled: 'Cancelled',
      past_due: 'Expired',
      cancel_scheduled: 'Cancel Scheduled',
    };
    const mappedStatuses = SUBSCRIPTION_STATUS_FILTERS.map((status) => ({
      label: statusLabels[status] || formatStatusString(status),
      value: status,
    }));

    mappedStatuses.push({
      label: 'Pause Scheduled',
      value: 'pause_scheduled',
    });
    
    return mappedStatuses;
  }, []);

  const handleSelectColChange = (newValue: unknown) => {
    if (!newValue) {
      dispatch(setSelectedCol(null));
      // When user explicitly clears the column, also clear the search
      dispatch(setSearch(undefined));
      dispatch(setSearchString(''));
    } else {
      const { value } = newValue as OptionValue;
      dispatch(setSelectedCol(value as string));
    }

    let searchColumn: string | null = null;
    if (newValue) {
      searchColumn = (newValue as OptionValue).value as string;
    } else {
      // When user explicitly clears, don't default back to patientName
      searchColumn = null;
    }

    handleChange({
      statusArray,
      sortField,
      sortOrder,
      sortStatus,
      search: newValue ? search : undefined, // Clear search when column is cleared
      // subscriptionStatus,
      subscriptionType,
      subscriptionStatus,
      orderFilterType,
      startDate,
      endDate,
      searchColumn,
      visitType,
      newEmrFilter,
      productType,
    });
  };

  const mappedSearchableColumns = useMemo(() => {
    return (
      searchableColumns
        ?.map((column: string) => ({
          label: convertStringCamelCaseHandler(column, 'normal'),
          value: column,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)) || []
    );
  }, [searchableColumns]);

  useEffect(() => {
    dispatch(setStatusArray(undefined));
  }, [normalizedPath]);

  // Initialize selectedCol to patientName on admin orders page when navigating to it or changing tabs
  useEffect(() => {
    const isAdminOrders = normalizedPath === ROUTES.ADMIN_ORDERS;
    const wasAdminOrders = previousPathnameRef.current === ROUTES.ADMIN_ORDERS;
    const isNavigatingToPage = isAdminOrders && !wasAdminOrders;
    const orderTypeChanged = orderType !== previousOrderTypeRef.current;
    const columnsJustLoaded =
      searchableColumns && searchableColumns.length > 0 && previousSearchableColumnsLengthRef.current === 0;

    // Set default when: navigating to the page OR when orderType changes (switching tabs) OR when columns just loaded
    if (
      isAdminOrders &&
      searchableColumns &&
      searchableColumns.length > 0 &&
      (isNavigatingToPage || orderTypeChanged || columnsJustLoaded)
    ) {
      const patientNameColumn = searchableColumns.find(
        (col) => col.toLowerCase().includes('patient') && col.toLowerCase().includes('name')
      );
      const defaultColumn = patientNameColumn || searchableColumns.find((col) => col === 'patientName');

      if (defaultColumn) {
        dispatch(setSelectedCol(defaultColumn));
      }
    }

    // Update the refs for next render
    previousPathnameRef.current = normalizedPath;
    previousOrderTypeRef.current = orderType;
    previousSearchableColumnsLengthRef.current = searchableColumns?.length || 0;
  }, [normalizedPath, orderType, searchableColumns, dispatch]);

  useEffect(() => {
    if (!query) {
      dispatch(setSearch(''));
      dispatch(setSearchString(''));
      dispatch(setSortField(undefined));
      dispatch(setSortOrder(undefined));
      dispatch(setSortStatus(undefined));
      dispatch(setStatusArray(undefined));
    }
  }, [orderType, dispatch, query, userType, medicationType, pathname]);

  useEffect(() => {
    dispatch(setSearchString(query ?? ''));

    if (query && !isLoading) {
      const sanitized = restrictSearchIfAdminPatientContext(query);
      dispatch(setSearch(sanitized));
      dispatch(setMeta({ page: 1, limit: 10 }));
      handleChange({
        search: sanitized,
        subscriptionType,
        subscriptionStatus,
        orderFilterType,
        sortField,
        sortOrder,
        sortStatus,
        statusArray,
        startDate,
        endDate,
        searchColumn: effectiveSearchColumn,
        visitType,
        newEmrFilter,
        productType,
        meta: { page: 1, limit: 10 },
      });
    }
  }, [query, dispatch, isLoading]);

  // Don't render complex appointments on server to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className={`${className || 'filter_group row g-3 justify-content-end align-items-center'}`}>
        {visibility.showSearch && (
          <div className={`${visibility.showSearchClassName || 'col-md-6 col-lg-4 col-xl-3'}`}>
            <Search value={''} placeholder='Search...' onChange={() => { }} onKeyDown={() => { }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className || 'filter_group row g-3 justify-content-end align-items-center'}>
      {/* Row 1: Search | Select Column | Visit Type | New EMR */}
      {visibility.showSearch && (
        <div className={visibility.showSearchClassName || 'col-lg-4 col-xl-3'}>
          <Search
            value={searchString ?? ''}
            isLoading={isLoading}
            placeholder='Search...'
            onChange={(e) => onSearchChange(e.currentTarget.value)}
            onKeyDown={onSearchKeyDown}
          />
        </div>
      )}
      {visibility.showSelectCol && (
        <div className={`${visibility.showSelectColClassName || 'col-md-6 col-lg-4 col-xl-3'}`}>
          <ReactSelect
            isDisabled={!searchableColumns || searchableColumns.length === 0}
            value={
              selectedCol
                ? {
                    label: convertStringCamelCaseHandler(selectedCol, 'normal'),
                    value: selectedCol,
                  }
                : null
            }
            onChange={handleSelectColChange}
            options={mappedSearchableColumns}
            placeholder='Column'
            isClearable
            isSearchable
          />
        </div>
      )}
      {visibility.showVisitTypeFilter && isOrders && (
        <div className={`${visibility.showVisitTypeFilterClassName || 'col-md-6 col-lg-3 col-xl-3'}`}>
          <ReactSelect
            value={visitType ? visitTypeOptions.find((opt) => opt.value === visitType) || null : null}
            onChange={handleVisitTypeChange}
            options={visitTypeOptions}
            placeholder='Visit Type'
            isClearable
            isSearchable={false}
          />
        </div>
      )}
      {visibility.showNewEmrFilter && isOrders && (
        <div className={`${visibility.showNewEmrFilterClassName || 'col-md-6 col-lg-3 col-xl-3'}`}>
          <ReactSelect
            value={newEmrFilter ? emrFilterOptions.find((opt) => opt.value === newEmrFilter) || null : null}
            onChange={handleNewEmrFilterChange}
            options={emrFilterOptions}
            placeholder='New EMR'
            isClearable
            isSearchable={false}
          />
        </div>
      )}

      {/* Row 2: Select Date | Status (multi-select) | Product Type | Sort by */}
      {visibility.showDateRange && isOrders && (
        <div className={visibility.showDatePresetClassName || 'col-md-6 col-lg-3 col-xl-4'}>
          <div className='tw-relative'>
            <ReactSelect
              value={datePreset ? datePresetOptions.find((option) => option.value === datePreset) || null : null}
              onChange={handleDatePresetChange}
              options={datePresetOptions}
              placeholder='Select Date'
              isClearable
              isSearchable={false}
            />

            {datePreset === 'custom' && showCustomDatePicker && (
              <div className='tw-absolute tw-top-full tw-left-0 tw-w-full tw-z-[100] tw-mt-2'>
                <ReactDatePicker
                  selectsRange
                  startDate={startDate ? parse(startDate, 'yyyy-MM-dd', new Date()) : null}
                  endDate={endDate ? parse(endDate, 'yyyy-MM-dd', new Date()) : null}
                  onChange={(update) => handleDateRangeChange(update)}
                  inline={isOrders && datePreset === 'custom'}
                  shouldCloseOnSelect
                  placeholderText={isOrders && datePreset === 'custom' ? undefined : 'Date'}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {visibility.showDateRange && !isOrders && (
        <div className={visibility.showDateRangeClassName || 'col-lg-6 col-xl-3'}>
          <ReactDatePicker
            popperClassName='!tw-z-[100]'
            selectsRange={true}
            startDate={startDate ? parse(startDate, 'yyyy-MM-dd', new Date()) : null}
            endDate={endDate ? parse(endDate, 'yyyy-MM-dd', new Date()) : null}
            onChange={(update) => handleDateRangeChange(update)}
            isClearable={true}
            placeholderText='Date'
          />
        </div>
      )}

      {visibility.showMultiSelect && isOrders && (
        <div className={`${visibility.showMultiSelectClassName || 'col-lg-4 col-xl-5'}`}>
          <ReactSelect
            value={statusArray}
            isMulti
            isSearchable
            options={[
              ...(normalizedPath === ROUTES.PATIENT_ORDERS ? ORDER_STATUSES_PATIENT : ORDER_STATUSES_ADMIN),
            ].sort((a, b) => a.label.localeCompare(b.label))}
            placeholder='Status...'
            onChange={(newValue) => {
              dispatch(setStatusArray(newValue));
              dispatch(setMeta({ page: 1 }));
              handleChange({
                statusArray: newValue as MultiValue<OptionValue>,
                sortField,
                sortOrder,
                sortStatus,
                search,
                subscriptionType,
                subscriptionStatus,
                orderFilterType,
                startDate,
                endDate,
                searchColumn: effectiveSearchColumn,
                visitType,
                newEmrFilter,
                productType,
                meta: { page: 1, limit: 10 },
              });
            }}
            styles={{
              valueContainer: (baseStyles) => ({
                ...baseStyles,
                flexWrap: 'nowrap',
                overflow: 'hidden',
              }),
              multiValue: (baseStyles) => ({
                ...baseStyles,
                flexShrink: 0,
                maxWidth: '120px',
                backgroundColor: '#EBF0FB',
                borderRadius: '5px',
              }),
              multiValueLabel: (baseStyles) => ({
                ...baseStyles,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#1E40AF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 475,
                fontSize: '12px',
                lineHeight: '18px',
              }),
              multiValueRemove: (baseStyles) => ({
                ...baseStyles,
                color: '#113B98',
              }),
            }}
          />
        </div>
      )}

      {visibility.showSort && (
        <div className={visibility.showSortClassName || 'col-lg-4 col-xl-3'}>
          {extendedSortOptions ? (
            <ReactSelect
              value={
                getExtendedSortValue() === 'default'
                  ? null
                  : sortItems.find((item) => item.value === getExtendedSortValue()) || null
              }
              onChange={(option) => {
                const value = (option as OptionValue)?.value;
                onSortChange(value ? String(value) : 'default');
              }}
              options={sortItems}
              placeholder='Sort By'
              isClearable={!isPatient}
              isSearchable
            />
          ) : (
            <ReactSelect
              value={
                sortOrder === 'ASC'
                  ? { value: 'ASC', label: 'ASC' }
                  : sortOrder === 'DESC'
                  ? { value: 'DESC', label: 'DESC' }
                  : null
              }
              onChange={(option) => {
                const value = (option as OptionValue)?.value;
                onSortChange(value ? String(value) : '');
              }}
              options={[
                { value: 'ASC', label: 'ASC' },
                { value: 'DESC', label: 'DESC' },
              ]}
              placeholder='Sort By'
              isClearable={!isPatient}
              isSearchable
            />
          )}
        </div>
      )}

      {visibility.showProductTypeFilter && (isOrders || (normalizedPath === ROUTES.ADMIN_ORDERS && (orderType === 'Refills' || orderType === 'Subscriptions'))) && (
        <div className={`${visibility.showProductTypeFilterClassName || 'col-md-6 col-lg-3 col-xl-3'}`}>
          <ReactSelect
            value={productType ? productTypeOptions.find((opt) => opt.value === productType) || null : null}
            onChange={handleProductTypeChange}
            options={productTypeOptions}
            placeholder='Product Type'
            isClearable
            isSearchable={false}
          />
        </div>
      )}

      {visibility.showSubscriptionType && (
        <div className={`${visibility.showSubscriptionTypeClassName || 'col-lg-4 col-xl-3'}`}>
          <ReactSelect
            value={{
              label: subscriptionType === PlanType.ONE_TIME ? 'One Time' : 'Recurring',
              value: subscriptionType,
            }}
            onChange={handleChangeSubscriptionType}
            options={subscriptionTypeOptions}
            placeholder='Select subscription type'
            className='text-start'
          />
        </div>
      )}
      {visibility.showSubscriptionStatusFilter && (
        <div className={`${visibility.showSubscriptionStatusFilterClassName || 'col-lg-4 col-xl-3'}`}>
          <ReactSelect
            value={
              subscriptionStatus
                ? subscriptionStatusOptions.find((opt) => opt.value === subscriptionStatus) || null
                : null
            }
            onChange={handleChangeSubscriptionStatus}
            options={subscriptionStatusOptions}
            placeholder='Select status'
            className='text-start'
            isClearable={true}
          />
        </div>
      )}
      {visibility.showStatusFilter && computedSortFilters?.length > 0 && !isOrders && (
        <div className={`${visibility.showStatusFilterClassName || 'col-lg-4 col-xl-5'}`}>
          <ReactSelect
            value={sortStatus ? { value: sortStatus, label: formatStatusString(sortStatus) } : null}
            onChange={(option) => {
              const value = (option as OptionValue)?.value ?? 'default';
              onFilterChange({ currentTarget: { value } } as React.ChangeEvent<HTMLSelectElement>);
            }}
            options={computedSortFilters
              .map((filter) => ({
                value: filter,
                label: formatStatusString(filter),
              }))
              .sort((a, b) => a.label.localeCompare(b.label))}
            placeholder={defaultFilterValue || 'Filters'}
            isClearable
            isSearchable={false}
          />
        </div>
      )}
      {/* {(normalizedPath === ROUTES.ADMIN_ORDERS || normalizedPath === ROUTES.PATIENT_ORDERS) &&
            orderType === 'Orders' && (
              <div className='col-lg-4 col-xl-3'>
                <ReactSelect
                  isClearable
                  placeholder='Order Type...'
                  value={orderFilterType ? { value: orderFilterType, label: capitalizeFirst(orderFilterType) } : null}
                  onChange={(option) => {
                    const value = option ? (option as OptionValue).value : undefined;

                    dispatch(setOrderFilterType(value));
                    handleChange({
                      orderFilterType: value as string,
                      meta: { page: 1, limit: 10 },
                      search,
                      sortStatus,
                      sortOrder,
                      sortField,
                      startDate,
                      endDate,
                    });
                  }}
                  options={[
                    { value: 'refill', label: 'Refill' },
                    { value: 'subscription', label: 'Subscription' },
                  ]}
                  isSearchable={false}
                />
              </div>
            )} */}
      {visibility.showArchiveFilter && sortFilters && sortFilters.length > 0 && (
        <div className={`${visibility.showArchiveFilterClassName || 'col-lg-4 col-xl-3'}`}>
          <ReactSelect
            isClearable
            isSearchable={false}
            placeholder={sortFilterPlaceholder}
            options={sortFiltersOptions}
            value={sortFilter}
            onChange={handleArchiveFilterChange}
            isDisabled={isLoading}
          />
        </div>
      )}
    </div>
  );
};
