import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

const initialState: ProductTypesResponseData = {
  olympiaPlans: undefined,
  glp_1_gip_plans: undefined,
  glp_1_plans: undefined,
  nad_plans: undefined
};

export const medicationsProductsData = createSlice({
  name: 'medicationsProductsData',
  initialState,
  reducers: {
    setMedicationsProductsData: (state, action: PayloadAction<ProductTypesResponseData | undefined>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setMedicationsProductsData } = medicationsProductsData.actions;

export default medicationsProductsData.reducer;
