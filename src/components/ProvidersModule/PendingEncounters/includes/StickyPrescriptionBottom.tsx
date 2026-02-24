'use client';
import React, { useState } from 'react';
import { Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
// import { incrementApprovedStats } from '@/store/slices/providerSlice';
import { RootState } from '@/store';
import Image from 'next/image';
import { clearFormData, setSubmitting, setValidationErrors } from '@/store/slices/formDataSlice';
import { validatePrescriptionForm } from '@/lib/validation/prescriptionFormValidation';
import { MdBrokenImage } from 'react-icons/md';
import { CircularProgress, Modal as TailwindCustomModal } from '@/components/elements';
import { usePathname } from 'next/navigation';
import { TIRZEPATIDE_DOSAGE_LABELS } from '@/lib/constants';

interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  plan: string;
  image?: string;
  directions?: string;
  notesToPatient?: string;
  notesToStaff?: string;
}

interface StickyPrescriptionBottomProps {
  prescriptions?: PrescriptionItem[]; // Make optional since we'll get data from API
  orderId?: string; // Add orderId prop like AcceptRejectRXForm
  onApprove: (prescriptionId: string) => Promise<void>;
  onReject: (rejectionReasonOrDiscard: string) => void;
  onModifyDosage: (prescriptionId: string) => void;
  isChangeMode?: boolean; // To change button labels for editing existing prescriptions
}

export const StickyPrescriptionBottom: React.FC<StickyPrescriptionBottomProps> = ({
  prescriptions,
  orderId,
  onApprove,
  onReject,
  onModifyDosage,
  isChangeMode = false,
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const dispatch = useDispatch();
  const [openVideoConfirmationModal, setOpenVideoConfirmationModal] = useState(false);

  const isPendingEncounterPage = usePathname().includes('/provider/pending-encounters');

  const handleToggleVideoConfirmationModal = () => setOpenVideoConfirmationModal((prev) => !prev);
  // Get form data from Redux store
  const formData = useSelector((state: RootState) => state.formData);

  // Get orders data from Redux store (same as AcceptRejectRXForm)
  const orders = useSelector((state: RootState) => state.patientOrders?.data) ?? [];

  // Find specific order by orderId (same pattern as AcceptRejectRXForm)
  const foundOrder = orders.find((order) => order?.id === orderId);

  // Transform specific order to component format
  const dynamicPrescriptions = foundOrder
    ? [
        {
          id: foundOrder.id || '',
          medication: foundOrder.requestedProductName || 'Unknown Medication',
          dosage: '2.2mg /weekly', // Default dosage - could be extracted from prescriptionInstructions
          image: foundOrder.image || '', // Use image from API response
          directions:
            foundOrder.prescriptionInstructions?.[0]?.directions ||
            formData.directions ||
            prescriptions?.[0]?.directions ||
            '',
          notesToPatient: formData.notesToPatient || 'No notes for patient', // Use form data only
          notesToStaff: formData.notesToStaff || 'No notes for staff', // Use form data only
        },
      ]
    : [];

  // Use dynamic data if available, fallback to props
  const displayPrescriptions = dynamicPrescriptions.length > 0 ? dynamicPrescriptions : prescriptions || [];

  // Initialize expanded prescriptions with all prescription IDs (open by default)
  const [expandedPrescriptions, setExpandedPrescriptions] = useState<Set<string>>(() => {
    const initialPrescriptions = dynamicPrescriptions.length > 0 ? dynamicPrescriptions : prescriptions || [];
    return new Set(initialPrescriptions.map((p) => p.id));
  });

  const toggleExpanded = (prescriptionId: string) => {
    setExpandedPrescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(prescriptionId)) {
        newSet.delete(prescriptionId);
      } else {
        newSet.add(prescriptionId);
      }
      return newSet;
    });
  };

  const handleApprove = async () => {
    if (isApproving) return;

    try {
      // Validate form before submission
      const validation = validatePrescriptionForm(formData);

      if (!validation.isValid) {
        // Set validation errors in Redux state so they show in the form
        dispatch(setValidationErrors(validation.errors));
        toast.error('Please fill in all required fields correctly');
        return;
      }

      handleToggleVideoConfirmationModal();
    } catch (error) {
      console.error('Error approving prescription:', error);
      toast.error('Failed to approve prescription');
      dispatch(setSubmitting(false));
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (isChangeMode) {
      dispatch(clearFormData());
      onReject('discard');
      return;
    }

    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (isRejecting) return;

    try {
      setIsRejecting(true);
      dispatch(setSubmitting(true));

      // Use parent's callback instead of making our own API call
      // This will handle the API call, close sidebar, and refetch data
      await onReject(rejectionReason || 'Rejected by provider');

      dispatch(clearFormData());
      dispatch(setSubmitting(false));
      setShowRejectModal(false);
      setRejectionReason('');
      setIsRejecting(false);
    } catch (error) {
      console.error('Error rejecting prescription:', error);
      toast.error('Failed to reject prescription');
      dispatch(setSubmitting(false));
      setIsRejecting(false);
    }
  };

  const handleApproveWrapper = async () => {
    try {
      setIsApproving(true);
      dispatch(setSubmitting(true));
      await onApprove('prescription-id');
      dispatch(clearFormData());
      dispatch(setSubmitting(false));
      setIsApproving(false);
      handleToggleVideoConfirmationModal();
    } catch (error) {
      if (error instanceof Error) toast.error(error?.message ?? 'Failed to approve prescription');
      dispatch(setSubmitting(false));
      setIsApproving(false);
      handleToggleVideoConfirmationModal();
    }
  };

  return (
    <>
      <div className='tw-bg-[#FFFDF6] tw-left-0 tw-right-0 tw-bottom-0 tw-sticky -tw-mx-4 tw-z-50'>
        <div className='d-flex flex-column gap-3 p-3'>
          {displayPrescriptions.map((prescription, index) => (
            <div key={prescription.id || index}>
              <div
                className='tw-flex [@media(min-width:1350px)]:tw-items-center tw-justify-between tw-flex-col [@media(min-width:1350px)]:tw-flex-row tw-gap-3'
                key={prescription.id}
              >
                <div className='tw-flex tw-items-center tw-justify-between tw-flex-wrap md:tw-flex-nowrap tw-w-full xl:tw-w-[90%] [@media(min-width:1350px)]:tw-w-auto'>
                  <div className='tw-flex tw-items-center tw-gap-2 tw-flex-1 tw-min-w-0'>
                    <div className='!tw-bg-[#CDDFFF] tw-rounded-lg tw-py-2 tw-px-4 tw-flex-shrink-0 '>
                      {prescription.image && !failedImages.has(prescription.id) ? (
                        <Image
                          src={prescription.image}
                          alt={prescription.medication}
                          className='tw-object-contain'
                          width={26}
                          height={35}
                          onError={() => {
                            setFailedImages((prev) => new Set(prev).add(prescription.id));
                          }}
                        />
                      ) : (
                        <OverlayTrigger placement='top' overlay={<Tooltip>{prescription.medication}</Tooltip>}>
                          <div className=''>
                            <MdBrokenImage className='tw-text-gray-400 tw-min-h-9 tw-min-w-7' />
                          </div>
                        </OverlayTrigger>
                      )}
                    </div>
                    <div className='tw-flex tw-flex-col tw-items-start tw-min-w-0 tw-flex-1 tw-max-w-full tw-overflow-hidden'>
                      <span className='fw-medium text-dark px-2 tw-truncate tw-block tw-max-w-full tw-whitespace-nowrap'>
                        {prescription.medication}
                      </span>
                      {expandedPrescriptions.has(prescription.id) && (
                        <span className='fw-medium text-dark px-2 tw-truncate tw-text-sm tw-max-w-full tw-block tw-whitespace-nowrap'>
                          {formData.medication
                            ? formData.medication.charAt(0).toUpperCase() + formData.medication.slice(1).toLowerCase()
                            : 'No medication specified'}
                          {formData.dosage && (() => {
                            const isTirzepatide = formData.medication?.toLowerCase() === 'tirzepatide';
                            if (isTirzepatide && TIRZEPATIDE_DOSAGE_LABELS[formData.dosage.toString()]) {
                              return ` ${TIRZEPATIDE_DOSAGE_LABELS[formData.dosage.toString()]}mg Weekly`;
                            }
                            return ` ${formData.dosage}mg Weekly`;
                          })()}
                          <span className='tw-text-gray-500'> (Prescribed)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`d-flex align-items-center tw-justify-between tw-gap-2 xl:tw-gap-24 [@media(min-width:1350px)]:tw-gap-16 tw-flex-shrink-0 tw-mt-2 ${
                      expandedPrescriptions.has(prescription.id) ? 'md:-tw-mt-5' : 'md:tw-mt-0'
                    }`}
                  >
                    <Button
                      variant='link'
                      className='text-primary p-0 text-decoration-none tw-whitespace-nowrap tw-text-sm'
                      onClick={() => onModifyDosage(prescription.id)}
                    >
                      Change Dosage
                    </Button>

                    <Button
                      variant='outline-secondary'
                      className='rounded-sm !tw-p-2 !tw-font-light'
                      onClick={() => toggleExpanded(prescription.id)}
                    >
                      {expandedPrescriptions.has(prescription.id) ? <FaChevronUp /> : <FaChevronDown />}
                    </Button>
                  </div>
                </div>

                <div className='tw-flex tw-gap-2 tw-w-full xl:tw-w-auto'>
                  <Button
                    variant='outline-secondary'
                    className='rounded-1 tw-px-3 tw-py-2 text-nowrap tw-flex-1 xl:tw-flex-initial'
                    onClick={() => handleReject()}
                    disabled={isApproving || isRejecting}
                    style={{ cursor: isApproving || isRejecting ? 'not-allowed' : 'pointer' }}
                  >
                    {isChangeMode ? 'Discard' : 'Reject RX'}
                  </Button>
                  <Button
                    variant='primary'
                    className='rounded-1 d-flex align-items-center justify-content-center gap-2 text-nowrap tw-px-3 tw-py-2 tw-flex-1 xl:tw-flex-initial'
                    onClick={() => handleApprove()}
                    disabled={isApproving || isRejecting}
                    style={{ cursor: isApproving || isRejecting ? 'not-allowed' : 'pointer' }}
                  >
                    {isApproving ? (
                      <span className='text-sm text-nowrap'>{isChangeMode ? 'Saving...' : 'Approving...'}</span>
                    ) : isChangeMode ? (
                      'Save Changes'
                    ) : (
                      'Approve RX'
                    )}
                    {!isApproving && <Image src='/assets/svg/double-tick.svg' alt='Approve' width={21} height={20} />}
                  </Button>
                </div>
              </div>

              {/* Expanded Content - Medication, Dosage, and Notes */}
              {expandedPrescriptions.has(prescription.id) && (
                <div className='mt-3 tw-text-[13px] tw-font-normal tw-max-w-[700px]'>
                  <div className=''>
                    <div className='d-flex tw-min-w-0'>
                      <span className='fw-medium tw-whitespace-nowrap tw-flex-shrink-0'>Directions:</span>
                      <p className='mb-0 tw-ml-1 tw-text-gray-500 tw-truncate tw-min-w-0'>
                        {prescription.directions || 'No directions provided'}
                      </p>
                    </div>
                    <div className='d-flex align-items-center tw-min-w-0'>
                      <span className='fw-medium tw-whitespace-nowrap tw-flex-shrink-0'>Notes to Patient:</span>
                      <p className='mb-0 tw-ml-1 tw-text-gray-500 tw-truncate tw-min-w-0'>
                        {prescription.notesToPatient || 'No notes for patient'}
                      </p>
                    </div>
                  </div>
                  <div className='d-flex align-items-center tw-min-w-0'>
                    <span className='fw-medium tw-whitespace-nowrap tw-flex-shrink-0'>Notes to Staff:</span>
                    <p className='mb-0 tw-ml-1 tw-text-gray-500 tw-truncate tw-min-w-0'>
                      {prescription.notesToStaff || 'No notes for staff'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}

      <TailwindCustomModal
        isOpen={openVideoConfirmationModal}
        onClose={handleToggleVideoConfirmationModal}
        title='Approval Confirmation'
        headerClassName='!tw-text-start tw-border-b tw-border-b-gray-200 !tw-p-3'
      >
        <div className='tw-flex tw-flex-col tw-gap-2 tw-py-5 '>
          <p className='tw-text-xl tw-text-center'>
            {isPendingEncounterPage ? `Would you like to approve the RX?` : `Was this consult done on video?`}
          </p>
          <div className='tw-flex tw-gap-2'>
            <button
              onClick={handleToggleVideoConfirmationModal}
              className='tw-text-lg tw-flex-grow tw-bg-transparent tw-text-primary tw-border tw-border-primary tw-rounded hover:tw-bg-primary hover:tw-text-white tw-transition-all'
            >
              No
            </button>
            <button
              disabled={isApproving}
              onClick={handleApproveWrapper}
              className='tw-flex tw-justify-center tw-items-center tw-text-lg tw-flex-grow tw-bg-primary tw-text-white  tw-rounded disabled:tw-opacity-50 disabled:tw-pointer-events-none'
            >
              {isApproving ? <CircularProgress /> : 'Yes'}
            </button>
          </div>
        </div>
      </TailwindCustomModal>

      {/* Rejection/Discard Modal */}

      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isChangeMode ? 'Discard Changes' : 'Reject Prescription'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='mb-3'>
            <label className='form-label'>{isChangeMode ? 'Reason for Discarding' : 'Rejection Reason'}</label>
            <textarea
              className='form-control'
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={
                isChangeMode
                  ? 'Please provide a reason for discarding these changes...'
                  : 'Please provide a reason for rejecting this prescription...'
              }
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='outline-primary'
            onClick={() => setShowRejectModal(false)}
            disabled={isRejecting}
            style={{ cursor: isRejecting ? 'not-allowed' : 'pointer' }}
          >
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={handleConfirmReject}
            disabled={!rejectionReason.trim() || isRejecting}
            style={{ cursor: !rejectionReason.trim() || isRejecting ? 'not-allowed' : 'pointer' }}
          >
            {isRejecting ? (
              <span style={{ whiteSpace: 'nowrap' }}>{isChangeMode ? 'Discarding...' : 'Rejecting...'}</span>
            ) : isChangeMode ? (
              'Discard Changes'
            ) : (
              'Reject Prescription'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
