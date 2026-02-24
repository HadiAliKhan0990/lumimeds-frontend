import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Pharmacy {
	id: string | null;
	name: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

const initialState: Pharmacy = {
	id: null,
	name: null,
	createdAt: null,
	updatedAt: null,
};

export const pharmacySlice = createSlice({
	name: "pharmacy",
	initialState,
	reducers: {
		setPharmacy: (state, action: PayloadAction<Pharmacy>) => {
			return action.payload;
		},
	},
});

export const { setPharmacy } = pharmacySlice.actions;

export default pharmacySlice.reducer;
