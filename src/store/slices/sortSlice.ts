import { OptionValue } from '@/lib/types';
import { PlanType } from '@/types/medications';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MultiValue } from 'react-select';
import { Agent } from '@/store/slices/agentApiSlice';
import { DatePresetKey } from '@/types/datePresets';

export type TabTypes = 'Patient' | 'Provider' | 'Admin' | 'Agent';
export type OrderType = 'Orders' | 'Subscriptions' | 'Invoices' | 'Promos & Discounts' | 'Refills' | 'Renewals';

export interface SortState {
  search?: string;
  sortField?: string;
  sortFilter: OptionValue | null;
  sortOrder?: string;
  meta?: {
    total?: number;
    page: number;
    limit?: number;
    totalPages?: number;
  };
  sortStatus?: string | null;
  // startDate?: string | null;
  // endDate?: string | null;
  searchColumn?: string | null;
  subscriptionStatus?: string | null;
  userType: TabTypes | null;
  statusArray?: MultiValue<OptionValue>;
  searchString: string;
  pharmacyType?: string;
  startDate?: string;
  endDate?: string;
  subscriptionType: PlanType;
  pharmacyTagType?: 'manual' | 'api';
  selectedAgent?: Agent | null;
  orderType?: OrderType;
  orderFilterType: string | null;
  intervalCount?: number | null;
  dateRange: (string | null)[];
  selectedCol: string | null;
  searchableColumns?: string[];
  datePreset?: DatePresetKey | 'custom' | null;
  visitType?: 'video' | 'document' | 'both' | null;
  newEmrFilter?: 'newEmr' | 'telepath' | 'both' | null;
  productType?: 'weight_loss' | 'longevity' | null;
}

const initialState: SortState = {
  userType: 'Patient',
  orderType: 'Orders',
  searchString: '',
  sortFilter: null,
  subscriptionType: PlanType.RECURRING,
  orderFilterType: null,
  intervalCount: null,
  dateRange: [null, null],
  selectedCol: null,
  searchableColumns: [],
  datePreset: null,
  visitType: null,
  newEmrFilter: 'newEmr',
  productType: null,
};

export const sortSlice = createSlice({
  name: 'sort',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setSubscriptionType: (state, action: PayloadAction<SortState['subscriptionType']>) => {
      state.subscriptionType = action.payload;
    },
    setSortFilter: (state, action) => {
      state.sortFilter = action.payload;
    },
    setSortField: (state, action) => {
      state.sortField = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setMeta: (state, action) => {
      state.meta = action.payload;
    },
    setSortStatus: (state, action) => {
      state.sortStatus = action.payload;
    },
    setSubscriptionStatus: (state, action) => {
      state.subscriptionStatus = action.payload;
    },
    setStatusArray: (state, action) => {
      state.statusArray = action.payload;
    },
    setSearchString: (state, action) => {
      state.searchString = action.payload;
    },
    setUserType: (state, action: PayloadAction<'Patient' | 'Provider' | 'Admin' | 'Agent' | null>) => {
      state.userType = action.payload;
    },
    setOrderType: (state, action) => {
      state.orderType = action.payload;
    },
    setPharmacyType: (state, action: PayloadAction<string>) => {
      state.pharmacyType = action.payload;
    },
    setPharmacyTagType: (state, action: PayloadAction<'manual' | 'api' | undefined>) => {
      state.pharmacyTagType = action.payload;
    },
    setSelectedAgent: (state, action: PayloadAction<Agent | null>) => {
      state.selectedAgent = action.payload;
    },
    resetSortSlice: (state) => {
      state.meta = {
        total: 0,
        page: 1,
        limit: 30,
        totalPages: 0,
      };
      state.sortField = '';
      state.sortOrder = '';
      state.sortStatus = '';
      state.subscriptionStatus = '';
      state.statusArray = [];
      state.searchString = '';
      state.pharmacyType = '';
      state.pharmacyTagType = undefined;
      state.selectedAgent = null;
      state.search = '';
      state.sortFilter = null;
      state.subscriptionType = PlanType.RECURRING;
      state.userType = 'Patient';
      state.orderType = 'Orders';
      state.orderFilterType = null;
      state.intervalCount = null;
      state.dateRange = [null, null];
      state.searchableColumns = [];
      state.selectedCol = null;
      state.datePreset = null;
      state.visitType = null;
      state.newEmrFilter = null;
      state.productType = null;
    },
    setOrderFilterType: (state, action) => {
      state.orderFilterType = action.payload;
    },
    setDateRange: (state, action: PayloadAction<(string | null)[]>) => {
      state.dateRange = action.payload;
    },
    setDatePreset: (state, action: PayloadAction<DatePresetKey | 'custom' | null>) => {
      state.datePreset = action.payload;
    },
    setSelectedCol: (state, action: PayloadAction<string | null>) => {
      state.selectedCol = action.payload;
    },
    setSearchableColumns: (state, action: PayloadAction<string[]>) => {
      state.searchableColumns = action.payload;
    },
    setIntervalCount: (state, action: PayloadAction<number | null>) => {
      state.intervalCount = action.payload;
    },
    setVisitType: (state, action: PayloadAction<'video' | 'document' | 'both' | null>) => {
      state.visitType = action.payload;
    },
    setNewEmrFilter: (state, action: PayloadAction<'newEmr' | 'telepath' | 'both' | null>) => {
      state.newEmrFilter = action.payload;
    },
    setProductType: (state, action: PayloadAction<'weight_loss' | 'longevity' | null>) => {
      state.productType = action.payload;
    },
  },
});

export const {
  setSearch,
  setSortFilter,
  setSortField,
  setSortOrder,
  setMeta,
  setSortStatus,
  setSubscriptionStatus,
  setUserType,
  setOrderType,
  setStatusArray,
  setSearchString,
  setPharmacyType,
  setSubscriptionType,
  setPharmacyTagType,
  setSelectedAgent,
  resetSortSlice,
  setOrderFilterType,
  setIntervalCount,
  setDateRange,
  setSelectedCol,
  setSearchableColumns,
  setDatePreset,
  setVisitType,
  setNewEmrFilter,
  setProductType,
} = sortSlice.actions;

export default sortSlice.reducer;
