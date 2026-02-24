'use client';

import { Modal as BModal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ModalType, setModal } from '@/store/slices/modalSlice';
import { AddNewMedication } from '@/components/Dashboard/modals/includes/AddNewMedication';
import { ManageTypes } from '@/components/Dashboard/modals/includes/ManageTypes';
import { ManagePharmacies } from '@/components/Dashboard/modals/includes/ManagePharmacies';
import { RegisterNewProvider } from '@/components/Dashboard/modals/includes/RegisterNewProvider';
import { InviteNewProvider } from '@/components/Dashboard/modals/includes/InviteNewProvider';
import { InviteNewAdmin } from '@/components/Dashboard/modals/includes/InviteNewAdmin';
import { ProcessConfirmation } from '@/components/Dashboard/modals/includes/ProcessConfirmation';
import { ArchiveUser } from '@/components/Dashboard/modals/includes/ArchiveUser';
import { ArchiveProviders } from '@/components/Dashboard/modals/includes/ArchiveProviders';
import { RestoreUser } from '@/components/Dashboard/modals/includes/RestoreUser';
import { AddPatientNote } from '@/components/Dashboard/modals/includes/AddPatientNote';
import { EditPatientNote } from '@/components/Dashboard/modals/includes/EditPatientNote';
import { AddOrderNote } from '@/components/Dashboard/modals/includes/AddOrderNote';
import { EditOrderNote } from '@/components/Dashboard/modals/includes/EditOrderNote';
import { ArchivedOrderNotes } from '@/components/Dashboard/modals/includes/ArchivedOrderNotes';
import { PatientEditAddress } from '@/components/Dashboard/modals/includes/PatientEditAddress';
import { PatientEditContactDetails } from '@/components/Dashboard/modals/includes/PatientEditContactDetails';
import { PatientEditMedicalHistory } from '@/components/Dashboard/modals/includes/PatientEditMedicalHistory';
import { PatientEditBodyMetrics } from '@/components/Dashboard/modals/includes/PatientEditBodyMetrics';
import { PatientEditGeneralDetails } from '@/components/Dashboard/modals/includes/PatientEditGeneralDetails';
import { DosageConfirmation } from '@/components/Dashboard/modals/includes/DosageConfirmation';
import { PharmacyConfirmation } from '@/components/Dashboard/modals/includes/PharmacyConfirmation';
import { ArchivedNotes } from '@/components/Dashboard/modals/includes/ArchivedNotes';
import { ChatRoomStatusConfirmation } from '@/components/Dashboard/modals/includes/ChatRoomStatusConfirmation';
import { ConnectCalendly } from '@/components/Dashboard/modals/includes/ConnectCalendly';
import { DoctorAssignmentModal } from '@/components/Dashboard/modals/includes/DoctorAssignmentModal';
import { ProviderSurveyThanksModal } from '@/components/Dashboard/modals/includes/ProviderSurveyThanksModal';
import { AddAgent } from '@/components/Dashboard/modals/includes/AddAgent';
import { EditAgent } from '@/components/Dashboard/modals/includes/EditAgent';
import { TelepathHistory } from '@/components/Dashboard/modals/includes/TelepathHistory';
import { ProviderPatientChatModal } from '@/components/Dashboard/modals/includes/ProviderPatientChatModal';
import { TrustpilotLogsModal } from '@/components/Dashboard/modals/includes/TrustpilotLogsModal';
import { ViewNoteDetails } from '@/components/Dashboard/modals/includes/ViewNoteDetails';
import { EditSurveyName } from '@/components/Dashboard/modals/includes/EditSurveyName';
import { GetInTouchModal } from '@/components/Dashboard/modals/includes/GetInTouchModal';

const ModalContent = ({ modalType }: { modalType: ModalType['modalType'] }) => {
  switch (modalType) {
    case 'Add New Medication':
      return <AddNewMedication />;
    case 'Manage Types':
      return <ManageTypes />;
    case 'Manage Pharmacies':
      return <ManagePharmacies />;
    case 'Register New Provider':
      return <RegisterNewProvider />;
    case 'Invite New Provider':
      return <InviteNewProvider />;
    case 'Invite New Admin':
      return <InviteNewAdmin />;
    case 'Process Confirmation':
      return <ProcessConfirmation />;
    case 'Doctor Assignment':
      return <DoctorAssignmentModal />;
    case 'Archive User':
      return <ArchiveUser />;
    case 'Archive Providers':
      return <ArchiveProviders />;
    case 'Restore User':
      return <RestoreUser />;
    case 'Dosage Confirmation':
      return <DosageConfirmation />;
    case 'Pharmacy Confirmation':
      return <PharmacyConfirmation />;
    case 'Connect Calendly':
      return <ConnectCalendly />;
    case 'Provider Survey Thanks':
      return <ProviderSurveyThanksModal />;
    case 'Add Agent':
      return <AddAgent />;
    case 'Edit Agent':
      return <EditAgent />;
    case 'Telepath History':
      return <TelepathHistory />;
    case 'Edit Survey Name':
      return <EditSurveyName />;
    case 'Get In Touch':
      return <GetInTouchModal />;
  }
};

// Modal types that should use larger size

export default function Modal() {
  const dispatch = useDispatch();
  const { modalType } = useSelector((state: RootState) => state.modal);

  // These modals wrap themselves with CustomModal, so render them directly
  if (modalType === 'Telepath History') {
    return <TelepathHistory />;
  }

  if (modalType === 'Edit Patient Address') {
    return <PatientEditAddress />;
  }

  if (modalType === 'Add Order Note') {
    return <AddOrderNote />;
  }

  if (modalType === 'Add Patient Note') {
    return <AddPatientNote />;
  }

  if (modalType === 'Edit Patient Note') {
    return <EditPatientNote />;
  }

  if (modalType === 'Edit Order Note') {
    return <EditOrderNote />;
  }

  if (modalType === 'Archived Notes') {
    return <ArchivedNotes />;
  }

  if (modalType === 'Archived Order Notes') {
    return <ArchivedOrderNotes />;
  }

  if (modalType === 'Edit Patient Contact Details') {
    return <PatientEditContactDetails />;
  }

  if (modalType === 'Edit Patient Medical History') {
    return <PatientEditMedicalHistory />;
  }

  if (modalType === 'Edit Patient Body Metrics') {
    return <PatientEditBodyMetrics />;
  }

  if (modalType === 'Edit Patient General Details') {
    return <PatientEditGeneralDetails />;
  }

  if (modalType === 'Provider Patient Chat') {
    return <ProviderPatientChatModal />;
  }
  if (modalType === 'Trustpilot Logs') {
    return <TrustpilotLogsModal />;
  }

  if (modalType === 'Chatroom Status Confirmation') {
    return <ChatRoomStatusConfirmation />;
  }

  if (modalType === 'View Note Details') {
    return <ViewNoteDetails />;
  }

  // All other modals use Bootstrap Modal
  if (!modalType) return null;

  return (
    <BModal
      show={!!modalType}
      centered
      scrollable
      onHide={() => dispatch(setModal({ modalType: undefined }))}
      contentClassName={'rounded-12'}
    >
      <BModal.Body>
        <ModalContent modalType={modalType} />
      </BModal.Body>
    </BModal>
  );
}
