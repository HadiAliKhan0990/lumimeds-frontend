import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Patient } from "./patientSlice";

export interface Sale {
	patient: Patient | null;
	agent: string | null;
	code: number | null;
	commission: string | null;
}

const initialState: Sale = {
	patient: null,
	agent: null,
	code: null,
	commission: null,
};

export const saleSlice = createSlice({
	name: "sale",
	initialState,
	reducers: {
		setSale: (state, action: PayloadAction<Sale>) => {
			Object.assign(state, action.payload);
		},
	},
});

export const { setSale } = saleSlice.actions;

export default saleSlice.reducer;
