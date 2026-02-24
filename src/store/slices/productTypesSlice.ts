import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductType } from '@/store/slices/productTypeSlice';

const initialState: ProductType[] = [];

export const productTypesSlice = createSlice({
  name: 'productTypes',
  initialState,
  reducers: {
    setProductTypes: (state, action: PayloadAction<ProductType[]>) => {
      return action.payload;
    },
  },
});

export const { setProductTypes } = productTypesSlice.actions;

export default productTypesSlice.reducer;
