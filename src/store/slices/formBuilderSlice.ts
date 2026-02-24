import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface State {
  mappingModels: string[];
}

const initialState: State = {
  mappingModels: [],
};

export const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    setMappingModels: (state, action: PayloadAction<State['mappingModels']>) => {
      state.mappingModels = action.payload;
    },
  },
});

export const { setMappingModels } = formBuilderSlice.actions;

export default formBuilderSlice.reducer;
