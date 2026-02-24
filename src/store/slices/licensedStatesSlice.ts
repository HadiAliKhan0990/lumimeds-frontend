import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetcher } from '@/lib/fetcher';
import type { RootState } from '@/store';
// TODO: Migrate to dynamic states from API using useStates hook
// For now, keeping static imports for backward compatibility in async thunks
// @deprecated Use dynamic states from API

export type StateItem = {
  id: string;
  name: string;
  licenseNumber: string;
  expiration: string;
};

type LicensedStatesState = {
  states: StateItem[];
  loading: boolean;
  error: string | null;
  search: string;
  doctorName: string | null;
};

const initialState: LicensedStatesState = {
  states: [],
  loading: false,
  error: null,
  search: '',
  doctorName: null,
};

export const fetchLicensedStates = createAsyncThunk<
  { doctorName: string | null; items: StateItem[] },
  { providerId?: string },
  { state: RootState }
>('licensedStates/fetchLicensedStates', async ({ providerId }, thunkApi) => {
  const root = thunkApi.getState();
  const resolvedProviderId =
    providerId || root.provider?.provider?.id || root.provider?.id || root.user?.user?.id || root.user?.id;

  if (!resolvedProviderId) {
    throw new Error('Provider not found');
  }

  // Fetch states from API to convert codes to names
  const statesRes = await fetcher<{ data: Array<{ name: string; code: string }> }>(
    '/pharmacy/states',
    { method: 'POST' }
  );

  const validStates = statesRes?.data || [];
  const codeToNameMap = new Map(validStates.map((s) => [s.code, s.name]));

  type LicenseDto = { state: string; licenseNumber: string; expirationDate: string; id?: string };
  const res = await fetcher<{ data?: { name?: string; licenses?: LicenseDto[] } }>(
    `/providers/${resolvedProviderId}/licenses`,
    { method: 'GET' }
  );

  const payload = res?.data || {};
  const licenses = (payload?.licenses as LicenseDto[]) ?? [];
  const items: StateItem[] = licenses.map((lic) => {
    const stateCode = lic.state;
    const fullName = codeToNameMap.get(stateCode) ?? stateCode;
    if (!lic.id) {
      throw new Error(`License for state ${stateCode} is missing UUID from backend`);
    }
    return {
      id: String(lic.id),
      name: fullName,
      licenseNumber: lic.licenseNumber,
      expiration: lic.expirationDate,
    };
  });

  return { doctorName: payload?.name ?? null, items };
});

export const addLicensedState = createAsyncThunk<
  StateItem,
  { name: string; licenseNumber: string; expiration: string; providerId?: string },
  { state: RootState; rejectValue: string }
>('licenses/add', async (payload, thunkApi) => {
  try {
    const root = thunkApi.getState();

    // Fetch states from API to validate
    const statesRes = await fetcher<{ data: Array<{ name: string; code: string }> }>(
      '/pharmacy/states',
      { method: 'POST' }
    );

    const validStates = statesRes?.data || [];
    const stateData = validStates.find((s) => s.name === payload.name);

    if (!stateData) {
      return thunkApi.rejectWithValue('Invalid state selection. Please choose a valid state.');
    }

    const stateCode = stateData.code;

    const providerId =
      payload.providerId || root.provider?.provider?.id || root.provider?.id || root.user?.user?.id || root.user?.id;

    if (!providerId) {
      return thunkApi.rejectWithValue('Provider not found');
    }

    type LicenseDto = { state: string; licenseNumber: string; expirationDate: string; id?: string };
    type ProviderLicensesResponse = { name?: string; licenses?: LicenseDto[] };
    const res = await fetcher<{
      success?: boolean;
      message?: string;
      statusCode?: number;
      data?: ProviderLicensesResponse;
    }>(`/providers/${providerId}/licenses/add-state`, {
      method: 'POST',
      data: {
        state: stateCode,
        licenseNumber: payload.licenseNumber,
        expirationDate: payload.expiration,
      },
    });

    if (res?.success === false || (res?.statusCode && res.statusCode >= 400)) {
      return thunkApi.rejectWithValue(res?.message || 'Failed to add licensed state');
    }

    const licenses = res?.data?.licenses ?? [];
    const created = licenses.find((lic) => lic.state === stateCode);

    if (!created?.id) {
      return thunkApi.rejectWithValue('Failed to add licensed state - no ID returned');
    }

    // Use the state name from the API response or fallback to payload name
    const fullName = validStates.find((s) => s.code === created.state)?.name ?? payload.name;

    return {
      id: created?.id ? String(created.id) : '',
      name: fullName,
      licenseNumber: created?.licenseNumber ?? payload.licenseNumber,
      expiration: created?.expirationDate ?? payload.expiration,
    } as StateItem;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add licensed state';
    return thunkApi.rejectWithValue(errorMessage);
  }
});

export const updateLicensedState = createAsyncThunk<
  StateItem,
  { id: string; data: Omit<StateItem, 'id'>; providerId?: string },
  { state: RootState; rejectValue: string }
>('licenses/update', async ({ id, data, providerId }, thunkApi) => {
  try {
    const root = thunkApi.getState();

    const resolvedProviderId =
      providerId || root.provider?.provider?.id || root.provider?.id || root.user?.user?.id || root.user?.id;

    if (!resolvedProviderId) {
      return thunkApi.rejectWithValue('Provider not found');
    }

    // Fetch states from API to validate and convert names to codes
    const statesRes = await fetcher<{ data: Array<{ name: string; code: string }> }>(
      '/pharmacy/states',
      { method: 'POST' }
    );

    const validStates = statesRes?.data || [];
    const nameToCodeMap = new Map(validStates.map((s) => [s.name, s.code]));

    const current = root.licensedStates.states as StateItem[];

    const licensesPayload = current.map((s) => {
      const isTarget = s.id === id;
      const effective = isTarget ? { id, ...data } : s;
      const code = nameToCodeMap.get(effective.name);
      
      if (!code) {
        throw new Error(`Invalid state code in licenses payload: ${effective.name}`);
      }
      
      return {
        state: code,
        licenseNumber: effective.licenseNumber,
        expirationDate: effective.expiration,
      };
    });

    const response = await fetcher<{ success?: boolean; message?: string; statusCode?: number }>(
      `/providers/${resolvedProviderId}/licenses`,
      { method: 'PUT', data: { licenses: licensesPayload } }
    );

    if (response?.success === false || (response?.statusCode && response.statusCode >= 400)) {
      return thunkApi.rejectWithValue(response?.message || 'Failed to update licensed state');
    }

    return { id, ...data } as StateItem;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update licensed state';
    return thunkApi.rejectWithValue(errorMessage);
  }
});

export const deleteLicensedState = createAsyncThunk<
  string,
  { id: string; providerId: string },
  { state: RootState; rejectValue: string }
>('licenses/delete', async ({ id, providerId }, thunkApi) => {
  try {
    const root = thunkApi.getState();

    const resolvedProviderId =
      providerId || root.provider?.provider?.id || root.provider?.id || root.user?.user?.id || root.user?.id;

    if (!resolvedProviderId) {
      return thunkApi.rejectWithValue('Provider not found');
    }

    const response = await fetcher<{ success?: boolean; message?: string; statusCode?: number }>(
      `/providers/${resolvedProviderId}/licenses/${id}`,
      { method: 'DELETE' }
    );

    if (response?.success === false || (response?.statusCode && response.statusCode >= 400)) {
      return thunkApi.rejectWithValue(response?.message || 'Failed to remove licensed state');
    }

    return id;
  } catch (error: unknown) {
    const errorMessage = 'Failed to remove licensed state';
    console.log(error,'whatiserrormessage')
    return thunkApi.rejectWithValue(errorMessage);
  }
});

const slice = createSlice({
  name: 'licensedStates',
  initialState,
  reducers: {
    setStates(state, action: PayloadAction<StateItem[]>) {
      state.states = action.payload;
    },
    addState(state, action: PayloadAction<Omit<StateItem, 'id'>>) {
      const newState: StateItem = { id: crypto.randomUUID(), ...action.payload };
      state.states.push(newState);
    },
    updateState(state, action: PayloadAction<{ id: string; data: Omit<StateItem, 'id'> }>) {
      const idx = state.states.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) state.states[idx] = { id: action.payload.id, ...action.payload.data };
    },
    deleteState(state, action: PayloadAction<string>) {
      state.states = state.states.filter((s) => s.id !== action.payload);
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLicensedStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLicensedStates.fulfilled, (state, action) => {
        state.doctorName = action.payload.doctorName;
        state.states = action.payload.items;
        state.loading = false;
      })
      .addCase(fetchLicensedStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch';
      })
      .addCase(addLicensedState.fulfilled, (state, action) => {
        if (action.payload.id) {
          state.states.push(action.payload);
        }
      })
      .addCase(addLicensedState.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Failed to add licensed state';
      })
      .addCase(updateLicensedState.fulfilled, (state, action) => {
        const idx = state.states.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.states[idx] = action.payload;
      })
      .addCase(updateLicensedState.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Failed to update licensed state';
      })
      .addCase(deleteLicensedState.fulfilled, (state, action) => {
        state.states = state.states.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteLicensedState.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Failed to remove licensed state';
      });
  },
});

export const { setStates, addState, updateState, deleteState, setSearch, clearError } = slice.actions;

export const selectLicensedStates = (s: RootState) => s.licensedStates.states;
export const selectDoctorName = (s: RootState) => s.licensedStates.doctorName;
export const selectSearch = (s: RootState) => s.licensedStates.search;
export const selectLoading = (s: RootState) => s.licensedStates.loading;
export const selectError = (s: RootState) => s.licensedStates.error;

export default slice.reducer;
