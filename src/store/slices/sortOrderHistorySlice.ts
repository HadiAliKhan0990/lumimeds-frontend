import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MultiValue } from 'react-select';

export type TabTypes = 'Patient' | 'Provider' | 'Admin';

export interface SortState {
  search?: string;
  sortField?: string;
  sortOrder?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  sortStatus?: string | null;
  userType?: TabTypes | null;
  orderType?: 'Orders' | 'Subscriptions' | 'Invoices' | 'Promos & Discounts';
  statusArray?: MultiValue<{
    label: string;
    value: string;
  }>;
}

const initialState: SortState = {
  userType: 'Patient',
  orderType: 'Orders',
  meta: {
    total: 0,
    page: 1,
    limit: 3,  
    totalPages: 0
  }
};

export const sortOrderHistorySlice = createSlice({
  name: 'sortOrderHistory',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
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
    setUserType: (state, action: PayloadAction<'Patient' | 'Provider' | 'Admin' | null>) => {
      state.userType = action.payload;
    },
    setOrderType: (state, action) => {
      state.orderType = action.payload;
    },
    setStatusArray: (state, action) => {
      state.statusArray = action.payload;
    },
  },
});

export const { setSearch, setSortField, setSortOrder, setMeta, setSortStatus, setUserType, setOrderType, setStatusArray } = sortOrderHistorySlice.actions;

export default sortOrderHistorySlice.reducer;
