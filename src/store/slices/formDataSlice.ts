import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AcceptRejectRxSchema } from '@/lib/schema/acceptRejectRx';

interface FormDataState {
  // Form fields
  medication: string;
  dosage: string;
  refills: string;
  daysSupply: number;
  directions: string;
  notes: string;
  notesToPatient: string;
  notesToStaff: string;
  rejectionReason: string;
  route: string; // IM or SQ for NAD medication

  // Validation state
  isValid: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

const initialState: FormDataState = {
  // Form fields
  medication: '',
  dosage: '',
  refills: '',
  daysSupply: 0,
  directions: '',
  notes: '',
  notesToPatient: '',
  notesToStaff: '',
  rejectionReason: '',
  route: '',

  // Validation state
  isValid: false,
  errors: {},
  isSubmitting: false,
};

export const formDataSlice = createSlice({
  name: 'formData',
  initialState,
  reducers: {
    // Update individual fields
    updateField: (state, action: PayloadAction<{ field: keyof FormDataState; value: unknown }>) => {
      const { field, value } = action.payload;
      if (field in state) {
        (state as Record<string, unknown>)[field] = value;
      }
    },

    // Update multiple fields at once
    updateFields: (state, action: PayloadAction<Partial<FormDataState>>) => {
      Object.assign(state, action.payload);
    },

    // Legacy methods for backward compatibility
    updateNotesToPatient: (state, action: PayloadAction<string>) => {
      state.notesToPatient = action.payload;
    },
    updateNotesToStaff: (state, action: PayloadAction<string>) => {
      state.notesToStaff = action.payload;
    },

    // Validation actions
    setValidationErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.errors = action.payload;
      state.isValid = Object.keys(action.payload).length === 0;
    },

    setFormValid: (state, action: PayloadAction<boolean>) => {
      state.isValid = action.payload;
    },

    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },

    // Clear form data
    clearFormData: () => {
      return { ...initialState };
    },

    // Initialize form with values
    initializeForm: (state, action: PayloadAction<Partial<AcceptRejectRxSchema>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  updateField,
  updateFields,
  updateNotesToPatient,
  updateNotesToStaff,
  setValidationErrors,
  setFormValid,
  setSubmitting,
  clearFormData,
  initializeForm,
} = formDataSlice.actions;

export default formDataSlice.reducer;
