import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Patient } from "./patientSlice";

export interface VideoCall {
	patient: Patient | null;
	date: string | null;
	agent: string | null;
	leadsFrom: string | null;
	notes: string | null;
	status: string | null;
}

const initialState: VideoCall = {
	patient: null,
	date: null,
	agent: null,
	leadsFrom: null,
	notes: null,
	status: null,
};

export const videoCallSlice = createSlice({
	name: "videoCall",
	initialState,
	reducers: {
		setVideoCall: (state, action: PayloadAction<VideoCall>) => {
			Object.assign(state, action.payload);
		},
	},
});

export const { setVideoCall } = videoCallSlice.actions;

export default videoCallSlice.reducer;
