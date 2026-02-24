import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Patient } from "./patientSlice";
import { SinglePatient } from "@/lib/types";

export interface PatientNote {
  	isDeleted?: boolean | null;
	id?: string | null;
	title?: string | null;
	description?: string | null;
	patient?: Patient | SinglePatient | null;
	visibleToPatient?: boolean | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

const initialState: PatientNote = {
	id: null,
	title: null,
	description: null,
	patient: null,
	visibleToPatient: null,
	createdAt: null,
	updatedAt: null,
};

export const patientNoteSlice = createSlice({
	name: "patientNote",
	initialState,
	reducers: {
		setPatientNote: (state, action: PayloadAction<PatientNote | null>) => {
			Object.assign(state, action.payload);
		},
	},
});

export const { setPatientNote } = patientNoteSlice.actions;

export default patientNoteSlice.reducer;
