import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: string[] = [];

export const selectedRowsSlice = createSlice({
	name: "selectedRows",
	initialState,
	reducers: {
		selectRow: (state, action: PayloadAction<string>) => {
			if (!state.includes(action.payload)) {
				state.push(action.payload);
			}
		},
		unselectRow: (state, action: PayloadAction<string>) => {
			const index = state.indexOf(action.payload);
			if (index > -1) {
				state.splice(index, 1);
			}
		},
		toggleRow: (state, action: PayloadAction<string>) => {
			const index = state.indexOf(action.payload);
			if (index > -1) {
				state.splice(index, 1);
			} else {
				state.push(action.payload);
			}
		},
		selectAll: (state, action: PayloadAction<string[]>) => {
			return action.payload;
		},
		unselectAll: () => {
			return [];
		},
	},
});

export const { selectRow, unselectRow, toggleRow, selectAll, unselectAll } =
	selectedRowsSlice.actions;

export default selectedRowsSlice;
