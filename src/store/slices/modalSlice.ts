import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ModalType {
  modalType:
    | 'Add New Medication'
    | 'Manage Types'
    | 'Manage Pharmacies'
    | 'Add New Product Type'
    | 'Add New Pharmacy'
    | 'Register New Provider'
    | 'Invite New Provider'
    | 'Invite New Admin'
    | 'Process Confirmation'
    | 'Doctor Assignment'
    | 'Archive User'
    | 'Archive Providers'
    | 'Restore User'
    | 'Add Patient Note'
    | 'Archived Notes'
    | 'Edit Patient Note'
    | 'Add Order Note'
    | 'Edit Order Note'
    | 'Archived Order Notes'
    | 'Edit Patient Address'
    | 'Edit Patient Contact Details'
    | 'Edit Patient Medical History'
    | 'Edit Patient Body Metrics'
    | 'Edit Patient General Details'
    | 'Dosage Confirmation'
    | 'Pharmacy Confirmation'
    | 'Chatroom Status Confirmation'
    | 'View Order Detail'
    | 'View Patient Product Detail'
    | 'Order Details'
    | 'Connect Calendly'
    | 'Provider Survey Thanks'
    | 'Add Agent'
    | 'Edit Agent'
    | 'View Note Details'
    | 'Telepath History'
    | 'Provider Patient Chat'
    | 'Edit Survey Name'
    | 'Get In Touch'
    | 'Trustpilot Logs'
    | undefined;
  cb?: () => void;
  ctx?: unknown;
  isModalOpen?: boolean;
  type?: 'Chart' | 'Patient';
}

const initialState: ModalType = {
  modalType: undefined,
  cb: undefined,
  type: undefined,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setModal: (state, action: PayloadAction<ModalType>) => {
      return action.payload;
    },
    setIsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    setModalType: (state, action: PayloadAction<'Chart' | 'Patient' | undefined>) => {
      state.type = action.payload;
    },
  },
});

export const { setModal, setIsModalOpen, setModalType } = modalSlice.actions;

export default modalSlice.reducer;
