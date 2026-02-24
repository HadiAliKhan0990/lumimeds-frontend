import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Pharmacy } from "./pharmacySlice";

const initialState: Pharmacy[] = [];

export const pharmaciesSlice = createSlice({
	name: "pharmacies",
	initialState,
	reducers: {
		setPharmacies: (state, action: PayloadAction<Pharmacy[]>) => {
			return action.payload;
		},
	},
});

export const { setPharmacies } = pharmaciesSlice.actions;

export default pharmaciesSlice.reducer;
