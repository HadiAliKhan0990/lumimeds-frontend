import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ShippingService = {
  id: number;
  name: string;
};

export type PharmacyProduct = {
  form: string | null;
  prodId: string;
  strength: string | null;
  prodName: string;
  name?: string;
  externalProdId?: string;
  controlled: string | null;
  clinicName: string | null;
  finalPrice: string | null;
  availability: string | null;
  concentration: string | null;
  dispenseSize: string | null;
  scheduleCode: string | null;
  quantityUnits: string | null;
  controlledStates: string | null;
  identifier?: string | null;
};

export enum EnumRxType {
  NEW = 'NEW',
  REFILL = 'REFILL',
}

export type PharmacyName =
  | 'axtell'
  | 'script rx'
  | 'olympia'
  | 'optiorx'
  | 'drug crafters'
  | 'beaker'
  | 'valiant'
  | 'premier rx'
  | 'cre8'
  | 'boothwyn'
  | 'first choice';

export type PublicPharmacy = {
  id: string;
  name: PharmacyName;
  forbiddenStates: string[];
  shippingServices: ShippingService[];
  products: PharmacyProduct[];
  pharmacyProducts?: PharmacyProduct[];
  quantity?: string[] | null;
  dosage?: {
    semaglutide: number[];
    tirzepatide: number[];
    nad: {
      im: number[];
      sq: number[];
    };
  } | null;
  supplyDays?: number[] | null;
  pharmacyType?: 'manual' | 'api';
};

export interface DosageMapping {
  total_mg: string;
  dosage: string;
  plan_code: string;
  products: DosageMappingProduct[];
}

export interface DosageMappingProduct {
  id: string;
  qty: string;
  name: string;
  vial: DosageMappingVial;
  price: string;
  scheduleCode: string;
}

export interface DosageMappingVial {
  size: string;
  qty: string;
}

const initialState: {
  pharmacies: PublicPharmacy[];
  pharmaciesMaps: Record<string, PublicPharmacy> | null;
} = {
  pharmacies: [],
  pharmaciesMaps: null,
};

export const adminPharmaciesSlice = createSlice({
  name: 'adminPharmacies',
  initialState,
  reducers: {
    setPharmacies: (state, action: PayloadAction<PublicPharmacy[]>) => {
      state.pharmacies = action.payload;
    },
    setPharmaciesMaps: (state, action: PayloadAction<Record<string, PublicPharmacy>>) => {
      state.pharmaciesMaps = action.payload;
    },
  },
});

export const { setPharmacies, setPharmaciesMaps } = adminPharmaciesSlice.actions;

export default adminPharmaciesSlice.reducer;
