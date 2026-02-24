'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadSync, queueEncryptedSave } from '@/lib/encryptedStorage';
import { IS_SURVEY_COMPLETED, LUMIMEDS_CHECKOUT_USER, SUBMISSION_ID, SURVEY_CATEGORY } from '@/constants/intakeSurvey';
import { ProductType } from '@/store/slices/productTypeSlice';
import { CouponDataType } from '@/store/slices/checkoutApiSlice';
import { PaymentMethod } from '@/lib/types';

export type CheckoutUser = {
  email: string;
  phone: string;
  patientId: string;
};

export type SurveyCategoryType = 'weight_loss' | 'longevity';

interface State {
  product: ProductType | null;
  invoiceId?: string;
  customerId?: string;
  subscriptionIds?: string[];
  originalAmount?: number;
  amountAfterDiscount?: number;
  discountAmount?: number;
  discountType?: string;
  submissionId?: string;
  intakeAmount?: number;
  medicalFormUrl?: string;
  telepathInstructionsUrl?: string | null;
  checkoutUser?: CheckoutUser;
  isSurveyCompleted?: boolean;
  surveyCategory?: SurveyCategoryType;
  showVideoConsultation?: boolean;
  paymentMethod: PaymentMethod;
  userEmail?: string;
}

const initialState = {
  submissionId: loadSync<string>(SUBMISSION_ID) || '',
  product: null,
  checkoutUser: loadSync<CheckoutUser>(LUMIMEDS_CHECKOUT_USER) || undefined,
  isSurveyCompleted: loadSync<boolean>(IS_SURVEY_COMPLETED) || false,
  surveyCategory: loadSync<SurveyCategoryType>(SURVEY_CATEGORY) || undefined,
  showVideoConsultation: false,
  paymentMethod: 'Card',
} as State;

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCheckout: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
    setCouponData: (state, action: PayloadAction<CouponDataType>) => {
      Object.assign(state, { ...state, ...action.payload });
    },
    setSubmissionId: (state, action) => {
      queueEncryptedSave(SUBMISSION_ID, action.payload);
      state.submissionId = action.payload;
    },
    setIntakeAmount: (state, action) => {
      state.intakeAmount = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethod = action.payload;
    },
    setCheckoutUser: (state, action: PayloadAction<CheckoutUser | undefined>) => {
      queueEncryptedSave(LUMIMEDS_CHECKOUT_USER, action.payload || {});
      state.checkoutUser = action.payload;
    },
    setIsSurveyCompleted: (state, action: PayloadAction<boolean>) => {
      queueEncryptedSave(IS_SURVEY_COMPLETED, action.payload);
      state.isSurveyCompleted = action.payload;
    },
    setSurveyCategory: (state, action: PayloadAction<SurveyCategoryType>) => {
      queueEncryptedSave(SURVEY_CATEGORY, action.payload);
      state.surveyCategory = action.payload;
    },
    setShowVideoConsultation: (state, action: PayloadAction<boolean>) => {
      state.showVideoConsultation = action.payload;
    },
    clearCheckout: (state) => {
      localStorage.removeItem(SUBMISSION_ID);
      localStorage.removeItem(LUMIMEDS_CHECKOUT_USER);
      localStorage.removeItem(IS_SURVEY_COMPLETED);
      localStorage.removeItem(SURVEY_CATEGORY);
      state.submissionId = '';
      state.checkoutUser = undefined;
      state.isSurveyCompleted = false;
      state.surveyCategory = undefined;
    },
  },
});

export const {
  setCheckout,
  setCouponData,
  setSubmissionId,
  setIntakeAmount,
  setCheckoutUser,
  setIsSurveyCompleted,
  setSurveyCategory,
  setShowVideoConsultation,
  clearCheckout,
  setPaymentMethod,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
