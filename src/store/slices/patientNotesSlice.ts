import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PatientNote } from './patientNoteSlice';

export interface NotesState {
  data?: PatientNote[];
  meta?: {
    total?: number;
    limit?: number;
    page?: number;
    totalPages?: number;
  };
  sortField?: string;
  refetchTrigger?: number;
}

const initialState: NotesState = {};

export const patientNotesSlice = createSlice({
  name: 'patientNotes',
  initialState,
  reducers: {
    setPatientNotes: (state, action: PayloadAction<PatientNote[]>) => {
      state.data = action.payload;
    },
    setNotesMeta: (state, action: PayloadAction<NotesState['meta']>) => {
      state.meta = action.payload;
    },
    triggerNotesRefetch: (state) => {
      state.refetchTrigger = Date.now();
    },
  },
});

export const { setPatientNotes, setNotesMeta, triggerNotesRefetch } = patientNotesSlice.actions;

export default patientNotesSlice.reducer;
