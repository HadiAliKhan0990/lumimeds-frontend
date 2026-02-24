import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessageTemplateType } from '@/store/slices/messageTemplatesApiSlice';

interface State {
  data: MessageTemplateType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: State = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 30,
    totalPages: 0,
  },
};

export const messageTemplatesSlice = createSlice({
  name: 'messageTemplates',
  initialState,
  reducers: {
    setMessageTemplates: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
    setMessageTemplatesData: (state, action: PayloadAction<State['data']>) => {
      state.data = action.payload;
    },
    setMessageTemplatesMeta: (state, action: PayloadAction<State['meta']>) => {
      state.meta = action.payload;
    },
    appendMessageTemplates: (state, action: PayloadAction<State['data']>) => {
      if (!state.data) {
        state.data = action.payload || [];
      } else if (action.payload) {
        const existingIds = new Set(state.data.map((d) => d.id));
        const newTemplates = action.payload.filter((d) => !existingIds.has(d.id));
        state.data = [...state.data, ...newTemplates];
      }
    },
    prependMessageTemplate: (state, action: PayloadAction<MessageTemplateType>) => {
      state.data = [action.payload, ...state.data];
      state.meta.total += 1;
    },
    updateMessageTemplateInList: (state, action: PayloadAction<MessageTemplateType>) => {
      const index = state.data.findIndex((template) => template.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...action.payload };
      }
    },
    deleteMessageTemplateFromList: (state, action: PayloadAction<string>) => {
      const index = state.data.findIndex((template) => template.id === action.payload);
      if (index !== -1) {
        state.data.splice(index, 1);
        state.meta.total = Math.max(0, state.meta.total - 1);
      }
    },
  },
});

export const {
  setMessageTemplates,
  setMessageTemplatesData,
  setMessageTemplatesMeta,
  appendMessageTemplates,
  prependMessageTemplate,
  updateMessageTemplateInList,
  deleteMessageTemplateFromList,
} = messageTemplatesSlice.actions;

export default messageTemplatesSlice.reducer;
