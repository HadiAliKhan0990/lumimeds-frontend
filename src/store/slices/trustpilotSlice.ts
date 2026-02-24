import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { trustpilotApi, TrustpilotBusinessUnit, TrustpilotReview } from '@/services/trustpilot/trustpilotApi';

export interface TrustpilotState {
  businessUnit: TrustpilotBusinessUnit | null;
  reviews: TrustpilotReview[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp of last fetch
  cacheExpiry: number; // Cache duration in milliseconds (default: 1 hour)
}

const initialState: TrustpilotState = {
  businessUnit: null,
  reviews: [],
  loading: false,
  error: null,
  lastFetched: null,
  cacheExpiry: 60 * 60 * 1000, // 1 hour in milliseconds
};

// Async thunk to fetch Trustpilot data
export const fetchTrustpilotData = createAsyncThunk('trustpilot/fetchData', async (_, { rejectWithValue }) => {
  try {
    const [businessUnit, reviews] = await Promise.all([trustpilotApi.getBusinessUnit(), trustpilotApi.getReviews()]);

    return {
      businessUnit,
      reviews,
      timestamp: Date.now(),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Trustpilot data';
    return rejectWithValue(errorMessage);
  }
});

const trustpilotSlice = createSlice({
  name: 'trustpilot',
  initialState,
  reducers: {
    // Clear cache manually if needed
    clearCache: (state) => {
      state.businessUnit = null;
      state.reviews = [];
      state.lastFetched = null;
      state.error = null;
    },
    // Update cache expiry time
    setCacheExpiry: (state, action: PayloadAction<number>) => {
      state.cacheExpiry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrustpilotData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrustpilotData.fulfilled, (state, action) => {
        state.loading = false;
        state.businessUnit = action.payload.businessUnit;
        state.reviews = action.payload.reviews;
        state.lastFetched = action.payload.timestamp;
        state.error = null;
      })
      .addCase(fetchTrustpilotData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCache, setCacheExpiry } = trustpilotSlice.actions;

// Selectors
export const selectTrustpilotData = (state: { trustpilot: TrustpilotState }) => ({
  businessUnit: state.trustpilot.businessUnit,
  reviews: state.trustpilot.reviews,
  loading: state.trustpilot.loading,
  error: state.trustpilot.error,
});

export const selectIsCacheValid = (state: { trustpilot: TrustpilotState }) => {
  const { lastFetched, cacheExpiry } = state.trustpilot;
  if (!lastFetched) return false;

  const now = Date.now();
  return now - lastFetched < cacheExpiry;
};

export default trustpilotSlice.reducer;
