'use client';

import { Modal } from '@/components/elements';
import { SurveyPopupCard } from '@/components/Dashboard/admin/SurveyPopupCard';
import { AttachmentsList } from '@/components/Dashboard/admin/users/Patients/includes/AttachmentsList';
import { OrderNotesContentPatient } from '@/components/Dashboard/admin/users/Patients/includes/OrderNotesContentPatient';
import { OrdersList } from '@/components/Dashboard/admin/users/Patients/includes/OrdersList';
import PatientAttachments from '@/components/Dashboard/admin/users/Patients/includes/PatientAttachments';
import { PreviousEncountersCard } from '@/components/Dashboard/admin/users/Patients/includes/PreviousEncountersCard';
import { PatientDetailGroup } from '@/components/Dashboard/PatientDetailGroup';
import { EditSurveyModal } from './EditSurveyModal';
import { SurveyTrackingLogsModal } from './SurveyTrackingLogsModal';
import { PatientSurvey, PatientSurveyResponseType } from '@/lib/types';
import { AcceptRejectRXForm } from '@/components/ProvidersModule/PendingEncounters/includes/AcceptRejectRXForm';
import { StickyPrescriptionBottom } from '@/components/ProvidersModule/PendingEncounters/includes/StickyPrescriptionBottom';
import { OrderSelectionModal } from './OrderSelectionModal';
import { ROUTES } from '@/constants';
import { formatUSDate } from '@/helpers/dateFormatter';
import { transformApiResponseToUI } from '@/modules/protected/provider/appointments/AppointmentsData';
import { RootState } from '@/store';
import {
  setAppointments,
  decrementTodayCount as decrementAppointmentsTodayCount,
} from '@/store/slices/appointmentsRealTimeSlice';
import {
  setEncounters,
  triggerRefetch,
  decrementTodayCount as decrementEncountersTodayCount,
} from '@/store/slices/encountersRealTimeSlice';
import { clearFormData } from '@/store/slices/formDataSlice';
import { setModal } from '@/store/slices/modalSlice';
import { useLazyGetUnreadCountQuery } from '@/store/slices/notificationsApiSlice';
import {
  setAppointmentsCount,
  setApprovedCount,
  setPendingEncountersCount,
  setUnreadCount,
} from '@/store/slices/notificationsSlice';
import {
  ApprovePrescriptionPayload,
  PendingEncounter,
  useApprovePrescriptionMutation,
  useRevertOrdersMutation,
  RevertOrdersToAdminPayload,
  OrderRejectionNotesResponse,
} from '@/store/slices/ordersApiSlice';
import { useGetPatientsWithOrdersQuery, useGetSinglePatientQuery } from '@/store/slices/patientsApiSlice';
import {
  decrementAppointmentStats,
  decrementEncounterStats,
  incrementApprovedStats,
} from '@/store/slices/providerSlice';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { MdMoreVert } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import PatientBMIhistory from './PatientBMIhistory';
import PatientSidebarSkeleton from './PatientSidebarSkeleton';
import { PatientTopSidebarProvider } from './PatientTopSidebarProvider';

export type ActiveView = 'details' | 'messages';

export interface PatientPopupProps extends React.ComponentPropsWithoutRef<'div'> {
  showAcceptRejectRXForm?: boolean;
  showAcceptRejectRXFormActionButtons?: boolean;
  onAcceptRXForm?: () => void;
  onRejectRXForm?: () => void;
  onHide?: () => void;
  orderId?: string;
  allowEdit?: boolean;
  hideTriageButton?: boolean;
  disableActionButtons?: boolean;
}

function PatientData({
  showAcceptRejectRXForm,
  showAcceptRejectRXFormActionButtons,
  onAcceptRXForm,
  onRejectRXForm,
  onHide,
  orderId,
  allowEdit = false,
  hideTriageButton = false,
  disableActionButtons = false,
}: Readonly<PatientPopupProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const r = searchParams.get('r');
  const dispatch = useDispatch();

  const cameFromChat = Boolean(q && r);
  const cameFromOrders = searchParams.get('from') === 'orders';
  const cameFromSubscriptions = searchParams.get('from') === 'subscriptions';

  // Get current pathname to check route
  const pathname = usePathname();
  const isViewingFromProvider = pathname.includes('/provider');

  // Detect which page we're on for refetching
  const isOnPendingEncounters = pathname.includes('/provider/pending-encounters');
  const isOnAppointments = pathname.includes('/provider/appointments');
  const isOnApprovedPage = pathname.includes('/provider/approved');

  const patient = useSelector((state: RootState) => state.patient);
  const currentOrder = useSelector((state: RootState) => state.order);
  const orders = useSelector((state: RootState) => state.patientOrders.data);

  // Get real-time data for updates
  const currentEncounters = useSelector((state: RootState) => state.encountersRealTime?.encounters || []);
  const currentAppointments = useSelector((state: RootState) => state.appointmentsRealTime?.appointments || []);

  const [activeView, setActiveView] = useState<ActiveView>('details');

  const [showBMIHistory, setShowBMIHistory] = useState(false);
  const [isManagingAttachments, setIsManagingAttachments] = useState(false);
  const [showOrderSelectionModal, setShowOrderSelectionModal] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [triageNotes, setTriageNotes] = useState('');
  const [isProcessingTriage, setIsProcessingTriage] = useState(false);
  const [selectedOrderIdsForTriage, setSelectedOrderIdsForTriage] = useState<string[]>([]);

  interface EditingSurveyState {
    survey: PatientSurvey;
    responses: PatientSurveyResponseType[];
    surveyId?: string | null;
  }

  const [editingSurvey, setEditingSurvey] = useState<EditingSurveyState | null>(null);
  const [viewingLogsSurvey, setViewingLogsSurvey] = useState<PatientSurvey | null>(null);
  const { data, isFetching, isError, refetch } = useGetSinglePatientQuery(patient.id || '', {
    refetchOnMountOrArgChange: true,
    skip: !patient.id,
  });

  const [approvePrescription] = useApprovePrescriptionMutation();

  const [revertOrders] = useRevertOrdersMutation();
  const [triggerGetUnreadCount] = useLazyGetUnreadCountQuery();
  const { refetch: refetchAppointments } = useGetPatientsWithOrdersQuery(
    {},
    {
      skip: !isOnAppointments,
    }
  );

  const foundOrder = orders?.find((order) => order?.id === orderId);

  // Get form data from Redux store at component level
  const formData = useSelector((state: RootState) => state.formData);

  const refetchUnreadCounts = useCallback(async () => {
    try {
      const unreadCountRes = await triggerGetUnreadCount().unwrap();
      dispatch(setUnreadCount(unreadCountRes.count));
      if (unreadCountRes.pendingEncountersCount !== undefined) {
        dispatch(setPendingEncountersCount(unreadCountRes.pendingEncountersCount));
      }
      if (unreadCountRes.appointmentsCount !== undefined) {
        dispatch(setAppointmentsCount(unreadCountRes.appointmentsCount));
      }
      if (unreadCountRes.approvedCount !== undefined) {
        dispatch(setApprovedCount(unreadCountRes.approvedCount));
      }
    } catch (error) {
      console.error('Failed to refetch unread count:', error);
    }
  }, [dispatch, triggerGetUnreadCount]);

  const handleAcceptPrescription = async () => {
    if (!orderId) {
      toast.error('Order ID is required');
      return;
    }

    try {
      // Use form data from Redux store (already available at component level)
      const { medication, dosage, route, daysSupply, directions, notesToPatient, notesToStaff } = formData;

      const payload: ApprovePrescriptionPayload = {
        orderId: orderId,
        prescriptionInstructions: [
          {
            medication: medication,
            dosage: parseFloat(dosage) || 0,
            ...(medication.toLowerCase() === 'nad' && route ? { route } : {}),
            ...(daysSupply ? { daysSupply: typeof daysSupply === 'string' ? parseInt(daysSupply) : daysSupply } : {}),
            ...(directions ? { directions } : {}),
            notesToPatient: notesToPatient || '',
            notesToStaff: notesToStaff || '',
          },
        ],
      };

      const { success, message } = await approvePrescription(payload).unwrap();

      if (success) {
        toast.success(message || 'Prescription approved successfully');

        // Update dashboard stats - decrement pending encounters/appointments, increment approved stats
        if (isOnPendingEncounters) {
          dispatch(decrementEncounterStats());
          dispatch(decrementEncountersTodayCount());
        } else if (isOnAppointments) {
          dispatch(decrementAppointmentsTodayCount());
        }
        dispatch(incrementApprovedStats());
        await refetchUnreadCounts();
        onAcceptRXForm?.();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as { data?: { message?: string } })?.data?.message || 'Failed to approve prescription'
      );
    }
  };

  const handleRejectPrescription = async (rejectionReason: string) => {
    if (!orderId) {
      toast.error('Order ID is required');
      return;
    }

    try {
      const result = await revertOrders({
        orderIds: [orderId],
        notes: rejectionReason,
      }).unwrap();

      const responseData = (result as { data?: { message?: string; revertedOrders?: number } })?.data;
      const apiMessage =
        responseData?.message || (result as { message?: string })?.message || 'Order reverted successfully';

      if (responseData?.revertedOrders && responseData.revertedOrders > 0) {
        toast.success(apiMessage);
      } else {
        toast(apiMessage);
      }

      if (isOnPendingEncounters) {
        dispatch(decrementEncounterStats());
        dispatch(decrementEncountersTodayCount());
        const updatedEncounters = currentEncounters.filter((encounter: PendingEncounter) => encounter.id !== orderId);
        dispatch(setEncounters(updatedEncounters));
      } else if (isOnAppointments) {
        dispatch(decrementAppointmentStats());
        dispatch(decrementAppointmentsTodayCount());
        const updatedAppointments = currentAppointments.filter((appointment) => appointment.id !== orderId);
        dispatch(setAppointments(updatedAppointments));
      }

      await refetchUnreadCounts();
      onRejectRXForm?.();
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as { data?: { message?: string } })?.data?.message || 'Failed to revert order'
      );
    }
  };

  const orderRxStatus = useMemo(() => {
    if (!currentOrder?.rxStatus) {
      return '';
    }

    if (typeof currentOrder.rxStatus === 'string') {
      return currentOrder.rxStatus;
    }

    const statusValue =
      typeof currentOrder.rxStatus === 'object' && currentOrder.rxStatus !== null ? currentOrder.rxStatus.status : '';

    return typeof statusValue === 'string' ? statusValue : '';
  }, [currentOrder?.rxStatus]);

  const isTriageDisabled = useMemo(() => {
    if (!orderRxStatus) {
      return false;
    }

    const normalized = orderRxStatus.trim().toLowerCase();
    return normalized === 'place' || normalized === 'sent_to_pharmacy' || normalized === 'sent to pharmacy';
  }, [orderRxStatus]);

  const shouldDisableTriage = pathname.includes('/provider/approved') && isTriageDisabled;

  const handleTriageClick = () => {
    if (isViewingFromProvider && patient.id) {
      setShowOrderSelectionModal(true);
    } else {
      setShowTriageModal(true);
    }
  };

  const handleOrderSelectionConfirm = (selectedOrderIds: string[]) => {
    setSelectedOrderIdsForTriage(selectedOrderIds);
    setShowOrderSelectionModal(false);
    setShowTriageModal(true);
  };

  const handleCloseTriageModal = () => {
    setShowTriageModal(false);
    setTriageNotes('');
    setIsProcessingTriage(false);
    setSelectedOrderIdsForTriage([]);
  };

  const handleCloseOrderSelectionModal = () => {
    setShowOrderSelectionModal(false);
  };

  const handleConfirmTriage = async () => {
    try {
      const orderIdsToRevert =
        selectedOrderIdsForTriage.length > 0 ? selectedOrderIdsForTriage : orderId ? [orderId] : [];

      if (orderIdsToRevert.length === 0) {
        toast.error('No orders selected');
        return;
      }

      setIsProcessingTriage(true);

      const payload: RevertOrdersToAdminPayload = {
        orderIds: orderIdsToRevert,
        notes: triageNotes,
      };

      const result = await revertOrders(payload).unwrap();

      // Access the response data with proper typing
      // Note: useRevertOrdersMutation returns Response, but the actual response structure matches OrderRejectionNotesResponse
      const responseData = (result as OrderRejectionNotesResponse).data;
      const apiMessage = responseData?.message || result.message || 'Order triaged successfully';

      // Show the API message in toast and close modal
      if (responseData?.revertedOrders && responseData.revertedOrders > 0) {
        toast.success(apiMessage);
      } else {
        toast(apiMessage);
      }

      // Clear selections and close modal
      setShowTriageModal(false);
      setTriageNotes('');
      setIsProcessingTriage(false);
      setSelectedOrderIdsForTriage([]);

      // Update dashboard stats - decrement for each reverted order
      const revertedCount = responseData?.revertedOrders || orderIdsToRevert.length;
      if (isOnPendingEncounters) {
        for (let i = 0; i < revertedCount; i++) {
          dispatch(decrementEncounterStats());
        }
      } else if (isOnAppointments) {
        for (let i = 0; i < revertedCount; i++) {
          dispatch(decrementAppointmentStats());
        }
      }

      // Update real-time store to remove the reverted order immediately
      if (isOnPendingEncounters) {
        // Remove the reverted encounter from real-time store
        const updatedEncounters = currentEncounters.filter((encounter: PendingEncounter) => encounter.id !== orderId);
        dispatch(setEncounters(updatedEncounters));
      } else if (isOnAppointments) {
        // Remove the reverted appointment from real-time store
        const updatedAppointments = currentAppointments.filter((appointment) => appointment.id !== orderId);
        dispatch(setAppointments(updatedAppointments));
      }

      // Close the patient popup sidebar using the onHide callback
      if (onHide) {
        onHide();
      }

      if (isOnPendingEncounters) {
        // Trigger refetch in pending encounters page using Redux action
        dispatch(triggerRefetch());
      } else if (isOnAppointments) {
        // Refetch appointments with fresh data (same pattern as appointments page)
        try {
          const freshData = await refetchAppointments();

          // Update real-time store with fresh API data
          if (freshData.data) {
            const transformedData = transformApiResponseToUI(freshData.data);
            dispatch(setAppointments(transformedData));
          }
        } catch (error) {
          console.error('Error refetching listing data:', error);
        }
      }
    } catch (error) {
      console.error('Error triaging order:', error);
      toast.error('Failed to triage order to admin');
      setIsProcessingTriage(false);
    }
  };

  // const isManageDisabled = data?.orderStatus?.toLowerCase() !== 'pending';
  const isManageDisabled = disableActionButtons;

  const isViewingFromDoctor = usePathname().includes('/provider');

  const sortedSurveys =
    data?.surveys?.data?.map((survey) => ({
      ...survey,
      responses: [...survey.responses].sort((a, b) => Number(a.position || 0) - Number(b.position || 0)),
    })) || [];

  const handleDropdownAction = (action: ActiveView) => {
    setActiveView(action);
  };

  // Handle survey editing - works for all survey types
  const handleEditSurvey = (survey: PatientSurvey) => {
    let surveyIdToUse = survey.surveyId;
    // Handle survey editing - for PRODUCT_REFILL, use survey.id; otherwise use survey.surveyId
    if (survey.type?.type === 'PRODUCT_REFILL') surveyIdToUse = survey.id;

    setEditingSurvey({
      survey,
      responses: survey.responses || [],
      surveyId: surveyIdToUse,
    });
  };

  const handleCloseEditSurvey = () => {
    setEditingSurvey(null);
    refetch(); // Refetch patient data to get updated surveys
  };

  const handleViewLogs = (survey: PatientSurvey) => {
    setViewingLogsSurvey(survey);
  };

  const handleCloseViewLogs = () => {
    setViewingLogsSurvey(null);
  };

  // const handleArchiveNotes = async () => {
  //   try {
  //     const ids = selectedNotes
  //       .map((note) => note.id)
  //       .filter((id): id is string => typeof id === 'string' && id.length > 0);

  //     const { success, message } = await archivePatientNotes({ ids, isDeleted: true }).unwrap();

  //     if (success) {
  //       toast.error(message);
  //     } else {
  //       toast.success(message || 'Patient Notes Archived Successfully!');
  //       setSelectedNotes([]);
  //     }
  //   } catch (e) {
  //     toast.error(isAxiosError(e) ? e.response?.data.message : (e as Error).data.message || 'Error archiving notes!');
  //   }
  // };

  // const handleDeleteNotes = async () => {
  //   try {
  //     const ids = selectedNotes
  //       .map((note) => note.id)
  //       .filter((id): id is string => typeof id === 'string' && id.length > 0);
  //     const { success, message } = await deletePatientNotes(ids).unwrap();
  //     if (success) {
  //       toast.error(message);
  //     } else {
  //       toast.success(message || 'Patient Note(s) Deleted Successfully!');
  //       setSelectedNotes([]);
  //     }
  //   } catch (error) {
  //     toast.error(
  //       isAxiosError(error)
  //         ? error.response?.data.message
  //         : (error as Error).data.message || 'Error deleting Patient Notes!'
  //     );
  //   }
  //   setActiveView(action);
  // };

  const buttonBack = useMemo(() => {
    if (cameFromOrders) {
      return (
        <Link className='btn btn-outline-primary' href={ROUTES.ADMIN_ORDERS}>
          &larr; Back to Orders
        </Link>
      );
    } else if (cameFromSubscriptions) {
      return (
        <Link className='btn btn-outline-primary' href={ROUTES.ADMIN_ORDERS + '?tab=Subscriptions'}>
          &larr; Back to Subscriptions
        </Link>
      );
    } else if (cameFromChat) {
      return (
        <button type='button' className='btn btn-outline-primary' onClick={() => router.back()}>
          &larr; Back to Messages
        </button>
      );
    }
  }, [cameFromOrders, cameFromSubscriptions, cameFromChat]);

  useEffect(() => {
    if (cameFromChat) {
      setActiveView('messages');
    }
  }, [cameFromChat]);

  // Clear form data when popup is closed
  const isPopupOpen = useSelector((state: RootState) => state.popup);

  useEffect(() => {
    // Clear form data when popup is closed (not when it opens)
    if (!isPopupOpen) {
      dispatch(clearFormData());
    }
  }, [isPopupOpen, dispatch]);

  if (isFetching) {
    return <PatientSidebarSkeleton showRxFormSkeleton={showAcceptRejectRXForm} />;
  }

  if (isError) {
    return (
      <div className='d-flex align-items-center justify-content-center flex-column w-100 h-100 max-w-415 mx-auto'>
        <span className={'text-muted fw-medium text-64 mb-5'}>:(</span>
        <span className={'text-black fw-medium'}>Error fetching user data</span>
        <span className={'text-muted fw-medium my-4'}>Unable to load user details. Please try again.</span>
        <button onClick={refetch} className={'btn w-100 btn-primary'}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      {buttonBack && <div className='mb-3'>{buttonBack}</div>}
      <div className='d-flex align-items-center justify-content-between gap-3'>
        <div className='d-flex align-content-center justify-content-between w-100 gap-3 mb-4'>
          <div className='d-flex align-items-center justify-content-between w-100 flex-wrap'>
            <div className='d-flex align-items-center gap-2 flex-wrap'>
              {/* Patient Name */}
              <h1 className='m-0 text-capitalize text-xl fw-bold text-dark'>
                {data?.general?.firstName} {data?.general?.lastName}
              </h1>

              {/* Separator */}
              <div className='vr tw-my-auto tw-h-5 !tw-w-0.5'></div>
              <div className='tw-flex tw-gap-1'>
                <span className='text-capitalize text-xl fw-bold text-dark'>{data?.general?.gender}</span>
                <span className='text-dark tw-text-xs tw-mt-1'>{data?.general?.age}Y</span>
              </div>

              {/* Separator */}
              <div className='vr tw-my-auto tw-h-5 !tw-w-0.5'></div>
              <span className='text-dark text-xl fw-bold text-dark'>
                {data?.general?.dob ? formatUSDate(data.general.dob) : ''}
              </span>

              {/* Location Tag */}
              {data?.address?.shippingAddress?.state && (
                <span className='badge text-dark border !tw-font-medium'>{data.address.shippingAddress.state}</span>
              )}

              {/* Treatment Program Tag */}
              {/* {data?.general?.requiredTreatment && (
                <span className='badge bg-dark text-white !tw-font-medium'>{data.general.requiredTreatment}</span>
              )} */}
              {/* Medicine Type Tag */}
              {foundOrder?.requestedProductName && (
                <span
                  className='badge !tw-bg-[#3F434B] text-white !tw-font-medium'
                  style={{ whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'left' }}
                >
                  {foundOrder.requestedProductName}
                </span>
              )}
            </div>
            <div>
              {!hideTriageButton && (
                <button
                  className='btn btn-outline-primary btn-sm mt-2 mt-xl-0'
                  onClick={handleTriageClick}
                  disabled={shouldDisableTriage || disableActionButtons}
                >
                  Triage
                </button>
              )}
              <button
                className={`btn btn-outline-primary btn-sm mt-2 mt-xl-0 ${!hideTriageButton ? 'ml-2' : ''}`}
                onClick={() =>
                  dispatch(
                    setModal({
                      modalType: 'Telepath History',
                      ctx: { patientId: patient.id, patientEmail: data?.contact?.email },
                    })
                  )
                }
                disabled={disableActionButtons}
              >
                Telepath History
              </button>
            </div>
          </div>

          <>
            {/* Regular buttons - shown on lg and larger screens */}
            {/* <div className='d-flex align-items-center gap-3 d-none d-lg-block'>
                <button className='btn btn-outline-primary'>Archive Patient</button>
              </div> */}

            {/* Dropdown menu - shown on screens smaller than lg */}
            <Dropdown className='d-lg-none'>
              <Dropdown.Toggle
                variant='light'
                className='p-0 d-flex align-items-center justify-content-center border-0 bg-transparent'
              >
                <MdMoreVert size={24} className='text-secondary' />
              </Dropdown.Toggle>

              <Dropdown.Menu className='border-secondary shadow rounded-12 py-2'>
                <Dropdown.Item
                  className={`py-2 px-3 ${activeView === 'messages' ? 'text-primary fw-medium' : ''}`}
                  onClick={() => {
                    handleDropdownAction('messages');
                  }}
                >
                  <span>Messages/Notes</span>
                </Dropdown.Item>
                <Dropdown.Item
                  className={`py-2 px-3 ${activeView === 'details' ? 'text-primary fw-medium' : ''}`}
                  onClick={() => {
                    handleDropdownAction('details');
                  }}
                >
                  <span>Patient Details</span>
                </Dropdown.Item>
                {/* <Dropdown.Item className='py-2 px-3'>
                    <span>Archive Patient</span>
                  </Dropdown.Item> */}
              </Dropdown.Menu>
            </Dropdown>
          </>
        </div>
      </div>

      <div className='row g-3 flex-grow-1'>
        {/* Left Sidebar */}
        <div className={`col-12 col-lg-8 overflow-auto ${activeView === 'messages' ? 'd-none d-lg-block' : 'd-block'}`}>
          {/* Detail Cards */}
          <div className='row g-3'>
            <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='Contact Details'
                fullWidth
                isAdmin={!isViewingFromProvider}
                actionButton={
                  <button
                    onClick={() =>
                      dispatch(
                        setModal({
                          modalType: 'Edit Patient Contact Details',
                          ctx: {
                            email: data?.contact?.email,
                            phoneNumber: data?.contact?.phone ?? '',
                          },
                        })
                      )
                    }
                    className={
                      'btn-no-style text-sm fw-medium ' + (isManageDisabled ? 'tw-text-blue-300' : 'text-primary')
                    }
                    disabled={isManageDisabled}
                  >
                    Manage
                  </button>
                }
              />
            </div>
            <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='General'
                isAdmin={!isViewingFromProvider}
              // actionButton={
              //   <button
              //     className={'btn-no-style text-sm fw-medium ' + (isManageDisabled ? '' : 'text-primary')}
              //     disabled={isManageDisabled}
              //     onClick={() =>
              //       dispatch(
              //         setModal({
              //           modalType: 'Edit Patient General Details',
              //           ctx: {
              //             ...data?.general,
              //           },
              //         })
              //       )
              //     }
              //   >
              //     Manage
              //   </button>
              // }
              />
            </div>
            {/* Orders History */}
            <div className='col-xl-6'>
              <OrdersList currentOrderId={orderId} />
            </div>
            {/* medical history */}
            <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='Medical History'
                fullWidth
                isAdmin={!isViewingFromProvider}
                actionButton={
                  <button
                    disabled={isManageDisabled}
                    onClick={() =>
                      dispatch(
                        setModal({
                          modalType: 'Edit Patient Medical History',
                          ctx: {
                            ...data?.medicalHistory,
                          },
                        })
                      )
                    }
                    className={
                      'btn-no-style text-sm fw-medium ' + (isManageDisabled ? 'tw-text-blue-300' : 'text-primary')
                    }
                  >
                    Manage
                  </button>
                }
              />
            </div>
            <div className='col-xl-6'>
              <div className='rounded-12 p-12 border border-c-light h-100'>
                <OrderNotesContentPatient type='patient' disabled={disableActionButtons} />
              </div>
            </div>
            {/* Previous Encounters */}
            <div className='col-xl-6'>
              <PreviousEncountersCard currentOrderId={orderId} />
            </div>
            {isViewingFromProvider ? (
              // Provider card - with AttachmentsList
              <div className='col-xl-6'>
                <PatientDetailGroup
                  data={data}
                  title='Attachments'
                  fullWidth
                  isAdmin={!isViewingFromProvider}
                  customContent={<AttachmentsList patientId={patient.id || ''} surveys={data?.surveys?.data} />}
                />
              </div>
            ) : (
              // Admin card - with PatientAttachments and Manage button
              <div className='col-xl-6'>
                <PatientDetailGroup
                  data={data}
                  title='Attachments'
                  isAdmin={!isViewingFromProvider}
                  actionButton={
                    <button
                      className='btn-no-style text-sm fw-medium text-primary notes-btn'
                      onClick={() => setIsManagingAttachments(!isManagingAttachments)}
                      disabled={isManageDisabled}
                    >
                      {isManagingAttachments ? 'Cancel' : 'Manage'}
                    </button>
                  }
                >
                  <PatientAttachments
                    patientId={patient.id || ''}
                    isManageMode={isManagingAttachments}
                    onManageModeChange={setIsManagingAttachments}
                    surveys={data?.surveys?.data}
                  />
                </PatientDetailGroup>
              </div>
            )}
            <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='Body Metrics'
                fullWidth
                isAdmin={!isViewingFromProvider}
                actionButton={
                  <div className='d-flex align-items-center gap-3'>
                    {isViewingFromDoctor && (
                      <button
                        disabled={isManageDisabled}
                        onClick={() => setShowBMIHistory(true)}
                        className={
                          'btn-no-style text-xs fw-medium ' + (isManageDisabled ? 'tw-text-blue-300' : 'text-primary')
                        }
                      >
                        BMI History
                      </button>
                    )}
                    <button
                      disabled={isManageDisabled}
                      onClick={() =>
                        dispatch(
                          setModal({
                            modalType: 'Edit Patient Body Metrics',
                            ctx: {
                              ...data?.bio,
                            },
                          })
                        )
                      }
                      className={
                        `btn-no-style ${isViewingFromDoctor ? 'text-xs' : 'text-sm'} fw-medium ` +
                        (isManageDisabled ? 'tw-text-blue-300' : 'text-primary')
                      }
                    >
                      Manage
                    </button>
                  </div>
                }
              />
            </div>
            {/* Show different attachment cards based on user role */}

            {data?.surveys?.data && data?.surveys?.data.length > 0 && (
              <div>
                <SurveyPopupCard
                  surveys={sortedSurveys}
                  context='patient'
                  onEditSurvey={handleEditSurvey}
                  onViewLogs={handleViewLogs}
                />
              </div>
            )}
          </div>
        </div>
        {/* Right Content (Patient Details) */}

        <PatientTopSidebarProvider
          patientData={data}
          className={`col-12 col-lg-4 ` + (activeView === 'messages' ? '' : 'd-none d-lg-block')}
          showAdminChatToggle={isOnApprovedPage}
        />
      </div>

      {showAcceptRejectRXForm && (
        <AcceptRejectRXForm
          productImage={foundOrder?.image ?? ''}
          productName={foundOrder?.requestedProductName ?? ''}
          orderId={orderId ?? ''}
          onAccept={handleAcceptPrescription}
          onReject={handleRejectPrescription}
          showActionButtons={showAcceptRejectRXFormActionButtons}
          allowEdit={allowEdit}
        />
      )}

      {/* Add sticky dropdown at the bottom */}

      <PatientBMIhistory
        patientId={patient?.id ?? ''}
        patient={
          data as {
            id?: string;
            firstName?: string;
            lastName?: string;
            bio?: {
              height?: number;
              weight?: number | string;
              bmi?: number;
            };
            [key: string]: unknown;
          }
        }
        isOpen={showBMIHistory}
        onClose={() => setShowBMIHistory(false)}
      />

      {showAcceptRejectRXForm && (allowEdit || pathname !== '/provider/approved') ? (
        <>
          {(() => {
            const prescriptionData = {
              id: orderId ?? '',
              medication: formData.medication || foundOrder?.requestedProductName || '',
              dosage: formData.dosage || '2.2mg/ml',
              plan: '3-Months Plan',
              directions: formData.directions || 'Take as directed by your healthcare provider',
              notesToPatient: formData.notesToPatient || 'Please follow the prescribed dosage and schedule',
              notesToStaff: formData.notesToStaff || 'Standard prescription for weight management',
            };

            return (
              <StickyPrescriptionBottom
                orderId={orderId}
                prescriptions={[prescriptionData]}
                onApprove={async () => {
                  // Call the handler - it will get form data from Redux store
                  await handleAcceptPrescription();
                }}
                onReject={async (reason) => {
                  if (allowEdit) {
                    onRejectRXForm?.();
                    return;
                  }
                  await handleRejectPrescription(reason || 'Rejected by provider');
                }}
                onModifyDosage={() => {
                  // Focus the dosage field
                  if (
                    'focusDosageField' in window &&
                    typeof (window as { focusDosageField?: () => void }).focusDosageField === 'function'
                  ) {
                    (window as { focusDosageField: () => void }).focusDosageField();
                  }
                }}
                isChangeMode={allowEdit}
              />
            );
          })()}
        </>
      ) : null}
      {/* Universal Survey Edit Modal - works for all survey types */}
      {editingSurvey && editingSurvey.surveyId && (
        <EditSurveyModal
          isOpen={true}
          onClose={handleCloseEditSurvey}
          surveyId={editingSurvey.surveyId}
          preFilledResponses={editingSurvey.responses}
          submissionId={editingSurvey.survey.id}
          patientId={patient.id || undefined}
          patientEmail={data?.contact?.email || ''}
          productId={editingSurvey.survey.type?.id ?? undefined}
          type={editingSurvey.survey.type?.type ?? undefined}
        />
      )}

      {viewingLogsSurvey && (
        <SurveyTrackingLogsModal
          isOpen={true}
          onClose={handleCloseViewLogs}
          submissionId={viewingLogsSurvey.id}
          surveyName={viewingLogsSurvey.name}
        />
      )}

      {/* Order Selection Modal - shown first in provider context */}
      {isViewingFromProvider && (
        <OrderSelectionModal
          isOpen={showOrderSelectionModal}
          onClose={handleCloseOrderSelectionModal}
          patientId={patient.id || ''}
          onConfirm={handleOrderSelectionConfirm}
          isLoading={false}
        />
      )}

      {/* Triage Modal */}
      <Modal
        isOpen={showTriageModal}
        onClose={handleCloseTriageModal}
        title={
          selectedOrderIdsForTriage.length > 1
            ? `Assign ${selectedOrderIdsForTriage.length} Orders to Admin`
            : 'Assign to Admin'
        }
        size='md'
        isLoading={isProcessingTriage}
        loadingText='Processing...'
        footer={
          <div className='tw-flex tw-gap-3 tw-justify-end tw-w-full'>
            <button
              type='button'
              className='btn btn-outline-secondary btn-sm'
              onClick={handleCloseTriageModal}
              disabled={isProcessingTriage}
            >
              Cancel
            </button>
            <button
              type='button'
              className='btn btn-primary btn-sm'
              onClick={handleConfirmTriage}
              disabled={isProcessingTriage}
            >
              Yes, Assign
            </button>
          </div>
        }
        showFooter={true}
      >
        <div className='form-group'>
          <label htmlFor='notes' className='form-label text-start w-100'>
            Notes
          </label>
          <textarea
            id='notes'
            className='form-control text-start'
            rows={4}
            value={triageNotes}
            onChange={(e) => setTriageNotes(e.target.value)}
            placeholder='Enter notes here...'
          />
        </div>
      </Modal>
    </>
  );
}

export default function PatientPopup(props: Readonly<PatientPopupProps>) {
  return (
    <Suspense>
      <PatientData {...props} />
    </Suspense>
  );
}