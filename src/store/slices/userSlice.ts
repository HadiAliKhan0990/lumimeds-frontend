import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id?: string | null;
  email?: string | null;
  role?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  contactNumber?: string | null;
  phoneNumber?: string | null;
  isSuperAdmin?: boolean | null;
  user?: {
    id?: string | null;
    password?: string | null;
  };
  createdAt?: string | null;
  updatedAt?: string | null;
  isFirstLogin?: boolean | null;
  isAvailable?: boolean | null;
  isPaused?: boolean | null;
  status?: string | null;
  patientId?: string | null;
  gender?: string | null;
  npiNumber?: string | null;
  deaNumber?: string | null;
  spiNumber?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
  };
}

const initialState: User = {
  id: null,
  email: null,
  role: null,
  firstName: null,
  lastName: null,
  contactNumber: null,
  phoneNumber: null,
  isSuperAdmin: null,
  user: {
    id: null,
    password: null,
  },
  createdAt: null,
  updatedAt: null,
  isFirstLogin: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      return Object.assign(state, action.payload);
    },
    setIsFirstLogin: (state, action: PayloadAction<boolean>) => {
      state.isFirstLogin = action.payload;
    },
  },
});

export const { setUser, setIsFirstLogin } = userSlice.actions;

export default userSlice.reducer;
