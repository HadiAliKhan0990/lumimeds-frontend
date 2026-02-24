import { createSlice } from '@reduxjs/toolkit';

export type DashboardProductType = {
  productName: string;
  patientCount: number;
};

export type GenderStates = {
  male?: number;
  female?: number;
  other?: number;
  total?: number;
};

export type AgeStates = {
  eighteenToTwentyTwo: number;
  twentyThreeToTwentyNine: number;
  thirtyToThirtyNine: number;
  fortyToFortyNine: number;
  fiftyToFiftyNine: number;
  sixtyToSixtyFour: number;
  sixtyFivePlus: number;
  total: number;
};

export interface DashboardStates {
  stats?: {
    activePatients?: {
      total?: number;
      percentage?: number;
    };
    subscriptionRenewals?: {
      total?: number;
      percentage?: number;
    };
    newOrders?: {
      total?: number;
      percentage?: number;
    };
    subscriptionCancellations?: {
      total?: number;
      percentage?: number;
    };
    failedRenewals?: {
      total?: number;
      percentage?: number;
    };
    productStats?: {
      products: DashboardProductType[];
      total?: number;
    };
    genderStats?: GenderStates;
    ageStats?: AgeStates;
  };
  period?: {
    current?: {
      start?: string;
      end?: string;
    };
    previous?: {
      start?: string;
      end?: string;
    };
  };
}

const initialState: DashboardStates = {};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboardStates: (state, action) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setDashboardStates } = dashboardSlice.actions;

export default dashboardSlice.reducer;
