import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortState } from '@/store/slices/sortSlice';
import { BillingInterval, PlanType } from '@/types/medications';

export interface Product {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  image?: string | null;
  openpayProductId?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  telegra?: string | null;
  telepath?: string | null;
  openpay?: string | null;
  priceType: 'subscription' | 'payment';
  price: {
    amount?: number | null;
    billingInterval?: number | null;
  };
  category: {
    id: string;
    category: string;
    planType: PlanType;
    medicineType: {
      name: string;
    };
  } | null;
  metadata: {
    planTier: string | null;
    intervalCount: number;
    billingInterval: BillingInterval;
    isKlarnaEnabled?: boolean;
  };
  tagline: string | null;
  checkoutLink: string | null;
  isIntakeFormRequired?: boolean | null;

  forms?: {
    intake_form?: {
      form_id?: string | null;
      isSubmissionRequired?: boolean | null;
    } | null;
    intake_form_id?: string | null;
    refill_form_id?: string | null;
    renewal_form?: {
      form_id?: string | null;
      isSubmissionRequired?: boolean | null;
    } | null;
    renewal_form_id?: string | null;
    interest_form_id?: string | null;
    other_forms?: Array<{
      form_id?: string | null;
      isSubmissionRequired?: boolean | null;
    }> | null;
  };
}

export type ProductsType = {
  data: Product[];
  meta: SortState['meta'];
};

interface InitialState {
  products?: ProductsType;
}

const initialState: InitialState = {};

export const medicationsProductsSlice = createSlice({
  name: 'medicationsProducts',
  initialState,
  reducers: {
    setMedicationsProducts: (state, action: PayloadAction<InitialState['products']>) => {
      state.products = action.payload;
    },
    appendMedicationsProducts: (state, action: PayloadAction<InitialState['products']>) => {
      if (state.products && action.payload) {
        const existingIds = new Set(state.products.data.map((product) => product.id));
        const uniqueNewProducts = (action.payload.data || []).filter((product) => !existingIds.has(product.id));

        state.products.data = [...state.products.data, ...uniqueNewProducts];
        state.products.meta = action.payload.meta;
      } else if (action.payload) {
        state.products = action.payload;
      }
    },
  },
});

export const { setMedicationsProducts, appendMedicationsProducts } = medicationsProductsSlice.actions;

export default medicationsProductsSlice.reducer;
