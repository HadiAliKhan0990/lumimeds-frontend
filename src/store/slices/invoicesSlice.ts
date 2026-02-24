import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invoice } from '@/store/slices/invoiceSlice';
import { SortState } from '@/store/slices/sortSlice';

interface State {
  data?: Invoice[];
  meta?: SortState['meta'];
}

const initialState: State = {};

export const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setInvoicesData: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
    setInvoices: (state, action: PayloadAction<State['data']>) => {
      state.data = action.payload;
    },
    setMetaData: (state, action: PayloadAction<State['meta']>) => {
      state.meta = action.payload;
    },
    // New action for infinite scrolling - appends data to existing invoices
    appendInvoicesData: (state, action: PayloadAction<State>) => {
          if (state.data) {
            const existingIds = new Set(state.data.map((invoice) => invoice.id));
    
            const uniqueNewInvoices = (action.payload.data || []).filter((invoice) => !existingIds.has(invoice.id));
    
            // Only append truly unique orders
            state.data = [...state.data, ...uniqueNewInvoices];
          } else {
            // If no existing data, just set the new data
            state.data = action.payload.data;
          }
    
          state.meta = action.payload.meta;
        },
  },
});

export const { setInvoices, setInvoicesData, setMetaData, appendInvoicesData } = invoicesSlice.actions;

export default invoicesSlice.reducer;
