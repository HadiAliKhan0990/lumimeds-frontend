import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortState } from '@/store/slices/sortSlice';
import { PlanType } from '@/types/medications';

export type ProductCategory = {
  id: string;
  medicineType: string;
  category: string;
  planType: PlanType;
  dosageType: string;
  summaryText: string;
  isArchived: boolean;
  key: string;
};

interface State {
  data: ProductCategory[];
  meta: SortState['meta'];
}

const initialState: State = {
  data: [],
  meta: { page: 1, limit: 30 },
};

export const productCategoriesSlice = createSlice({
  name: 'productTypes',
  initialState,
  reducers: {
    setProductCategoriesData: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setProductCategoriesData } = productCategoriesSlice.actions;

export default productCategoriesSlice.reducer;
