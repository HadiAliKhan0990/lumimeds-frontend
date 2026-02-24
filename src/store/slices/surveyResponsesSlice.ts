import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SurveyResponse } from "./surveyResponseSlice";

export const surveyResponses: SurveyResponse[] = [];

export const surveyResponsesSlice = createSlice({
	name: "surveyResponses",
	initialState: surveyResponses,
	reducers: {
		setSurveyResponses: (state, action: PayloadAction<SurveyResponse[]>) => {
			return action.payload;
		},
	},
});

export const { setSurveyResponses } = surveyResponsesSlice.actions;

export default surveyResponsesSlice.reducer;
