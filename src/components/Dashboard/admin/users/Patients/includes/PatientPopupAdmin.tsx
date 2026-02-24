'use client';

import { RootState } from '@/store';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { statusBackgroundColor, statusTextColor } from '@/lib';
import { Error, OrderStatus, PatientSurveyResponseType } from '@/lib/types';
import {
  useGetSinglePatientQuery,
  useArchivePatientNotesMutation,
  useDeletePatientNotesMutation,
} from '@/store/slices/patientsApiSlice';
import { capitalizeFirst } from '@/lib/helper';
import { PatientDetailGroup } from '@/components/Dashboard/PatientDetailGroup';
import { setModal, setModalType } from '@/store/slices/modalSlice';
import { Dropdown } from 'react-bootstrap';
import { MdMoreVert } from 'react-icons/md';
import { useState, Suspense, useEffect } from 'react';
import { OrdersList } from '@/components/Dashboard/admin/users/Patients/includes/OrdersList';
import { PatientNote } from '@/store/slices/patientNoteSlice';
import { isAxiosError } from 'axios';
import { FaPlus } from 'react-icons/fa6';
import PatientBMIhistory from './PatientBMIhistory';
import PatientSidebarSkeleton from './PatientSidebarSkeleton';
import { AcceptRejectRXForm } from '@/components/ProvidersModule/PendingEncounters/includes/AcceptRejectRXForm';
// import { useApprovePrescriptionMutation } from '@/store/slices/ordersApiSlice';
import { useRejectPrescriptionMutation } from '@/store/slices/ordersApiSlice';
// import { ApprovePrescriptionPayload } from '@/store/slices/ordersApiSlice';
import { RejectPrescriptionPayload } from '@/store/slices/ordersApiSlice';
// import { incrementApprovedStats } from '@/store/slices/providerSlice';
// import { AcceptRejectRxSchema } from '@/lib/schema/acceptRejectRx';
import PatientAttachments from '@/components/Dashboard/admin/users/Patients/includes/PatientAttachments';
import toast from 'react-hot-toast';
import Link from 'next/link';
import PatientChatSidebarAdmin from '@/components/Dashboard/admin/users/Patients/includes/PatientChatSidebarAdmin';
import { triggerNotesRefetch } from '@/store/slices/patientNotesSlice';
import { ViewBanReasonModal } from './ViewBanReasonModal';
import { FaHistory, FaComments } from 'react-icons/fa';
import { SendIntakForm } from './SendIntakForm';
import { PatientSurvey } from '@/lib/types';
import { EditSurveyModal } from './EditSurveyModal';
import { SurveyTrackingLogsModal } from './SurveyTrackingLogsModal';
import { AssignedFormsTab } from './AssignedFormsTab';
import { SubmittedFormsTab } from './SubmittedFormsTab';
import { Tab, Nav } from 'react-bootstrap';
import { patientApi } from '@/store/slices/patientApiSlice';

export type ActiveView = 'details' | 'messages' | 'notes';
type ChatSidebarTab = 'messages' | 'notes';

export interface PatientPopupProps extends React.ComponentPropsWithoutRef<'div'> {
  showAcceptRejectRXForm?: boolean;
  showAcceptRejectRXFormActionButtons?: boolean;
  onAcceptRXForm?: () => void;
  onRejectRXForm?: () => void;
  orderId?: string;
  allowEdit?: boolean;
}

function PatientData({
  showAcceptRejectRXForm,
  showAcceptRejectRXFormActionButtons,
  //   onAcceptRXForm,
  onRejectRXForm,
  orderId,
  allowEdit = false,
}: Readonly<PatientPopupProps>) {
  const [refetchNotesCounter, setRefetchNotesCounter] = useState(0);

  const [showSendIntakeFormModal, setShowSendIntakeFormModal] = useState(false);

  const refetchNotes = () => {
    setRefetchNotesCounter((prev) => prev + 1);
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const r = searchParams.get('r');
  const dispatch = useDispatch();

  const cameFromChat = Boolean(q && r);
  const cameFromOrders = searchParams.get('from') === 'orders';
  const cameFromSubscriptions = searchParams.get('from') === 'subscriptions';

  const isViewingFromProvider = usePathname().includes('/provider');

  const patient = useSelector((state: RootState) => state.patient);
  const orders = useSelector((state: RootState) => state.patientOrders.data);

  const isAdmin = usePathname().includes('/admin');

  const [activeView, setActiveView] = useState<ActiveView>('details');
  const [chatSidebarTab, setChatSidebarTab] = useState<ChatSidebarTab>('notes');
  const [selectedNotes, setSelectedNotes] = useState<PatientNote[]>([]);
  const [showBMIHistory, setShowBMIHistory] = useState(false);
  const [isManagingAttachments, setIsManagingAttachments] = useState(false);
  const [showBanReasonModal, setShowBanReasonModal] = useState(false);

  interface EditingSurveyState {
    survey: PatientSurvey;
    responses: PatientSurveyResponseType[];
    surveyId?: string | null; // For surveys that might need refillSurveyId
  }

  const [editingSurvey, setEditingSurvey] = useState<EditingSurveyState | null>(null);
  const [viewingLogsSurvey, setViewingLogsSurvey] = useState<PatientSurvey | null>(null);

  // Get patient address from Redux

  const { data, isFetching, isError, refetch } = useGetSinglePatientQuery(patient.id || '', {
    refetchOnMountOrArgChange: true,
    skip: !patient.id,
  });

  //   const [approvePrescription] = useApprovePrescriptionMutation();

  const [rejectPrescription] = useRejectPrescriptionMutation();
  const [archivePatientNotes, { isLoading: isArchiving }] = useArchivePatientNotesMutation();
  const [deletePatientNotes, { isLoading: isDeleting }] = useDeletePatientNotesMutation();

  const foundOrder = orders?.find((order) => order?.id === orderId);

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

  //   const handleAcceptPrescription = async (values: AcceptRejectRxSchema) => {
  //     if (!orderId) {
  //       toast.error('Order ID is required');
  //       return;
  //     }

  //     try {
  //       const payload: ApprovePrescriptionPayload = {
  //         orderId: orderId,
  //         prescriptionInstructions: [
  //           {
  //             medication: values.medication,
  //             dosage: parseFloat(values.dosage),
  //             dateWritten: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
  //           },
  //         ],
  //       };

  //       const { success, message } = await approvePrescription(payload).unwrap();

  //       if (success) {
  //         toast.success(message || 'Prescription approved successfully');
  //       } else {
  //         toast.error(message);
  //       }

  //       // Update dashboard stats - increment approved stats
  //       dispatch(incrementApprovedStats());
  //       onAcceptRXForm?.();
  //     } catch (error) {
  //       toast.error(
  //         isAxiosError(error)
  //           ? error.response?.data.message
  //           : (error as Error).data.message || 'Failed to approve prescription'
  //       );
  //     }
  //   };

  const handleRejectPrescription = async (rejectionReason: string) => {
    if (!orderId) {
      toast.error('Order ID is required');
      return;
    }

    try {
      const payload: RejectPrescriptionPayload = {
        orderId: orderId,
        rejectionReason,
      };

      const { success, message } = await rejectPrescription(payload).unwrap();
      if (success) {
        toast.success(message || 'Prescription rejected successfully');
      } else {
        toast.error(message);
      }
      onRejectRXForm?.();
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as Error)?.data?.message || 'Failed to reject prescription'
      );
    }
  };
  // const isManageDisabled = data?.orderStatus?.toLowerCase() !== 'pending';
  const isManageDisabled = false;

  const isViewingFromDoctor = usePathname().includes('/provider');

  const sortedSurveys =
    data?.surveys?.data?.map((survey) => ({
      ...survey,
      responses: [...survey.responses].sort((a, b) => Number(a.position || 0) - Number(b.position || 0)),
    })) || [];

  const handleDropdownAction = (action: ActiveView) => {
    if (action === 'messages' || action === 'notes') {
      setActiveView(action);
      setChatSidebarTab(action);
    } else {
      setActiveView(action);
    }
  };

  const handleArchiveNotes = async () => {
    try {
      const ids = selectedNotes
        .map((note) => note.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);

      const { success, message } = await archivePatientNotes({ ids, isDeleted: true }).unwrap();

      setSelectedNotes([]);

      if (success) {
        toast.success(message);

        refetchNotes();
        dispatch(triggerNotesRefetch());
      } else {
        toast.error(message || 'Patient Notes Archived Successfully!');
      }
    } catch (e) {
      toast.error(isAxiosError(e) ? e.response?.data.message : (e as Error).data.message || 'Error archiving notes!');
    }
  };

  const handleDeleteNotes = async () => {
    try {
      const ids = selectedNotes
        .map((note) => note.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
      const { success, message } = await deletePatientNotes(ids).unwrap();
      setSelectedNotes([]);
      if (success) {
        toast.success(message);
        refetchNotes();
        dispatch(triggerNotesRefetch());
      } else {
        toast.error(message || 'Patient Note(s) Deleted Successfully!');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data.message || 'Error deleting Patient Notes!'
      );
    }
  };

  useEffect(() => {
    if (cameFromChat) {
      setChatSidebarTab('messages');
    }

    if (isViewingFromProvider) setChatSidebarTab('messages');
    else setChatSidebarTab('notes');
  }, [cameFromChat]);

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
      {cameFromOrders ? (
        <div className='mb-3'>
          <Link className='btn btn-outline-primary' href={'/admin/orders'}>
            &larr; Back to Orders
          </Link>
        </div>
      ) : cameFromSubscriptions ? (
        <div className='mb-3'>
          <Link className='btn btn-outline-primary' href={'/admin/orders?tab=Subscriptions'}>
            &larr; Back to Subscriptions
          </Link>
        </div>
      ) : cameFromChat ? (
        <div className='mb-3'>
          <button type='button' className='btn btn-outline-primary' onClick={() => router.back()}>
            &larr; Back to Messages
          </button>
        </div>
      ) : null}
      <div className='d-flex align-items-center justify-content-between gap-3'>
        <div className='d-flex align-content-center justify-content-between w-100 flex-wrap gap-3'>
          <div className='d-flex align-items-center gap-3 mb-4 flex-wrap'>
            <p className='m-0 text-capitalize text-xl fw-medium'>
              {data?.general?.firstName} {data?.general?.lastName}
            </p>

            {data?.general?.isBanned ? (
              <div className='d-flex align-items-center gap-2'>
                <div className='text-capitalize custom-badge custom-badge-banned rounded py-2 px-3 fw-medium'>
                  Banned
                </div>
                {patient?.banReason && patient?.banReason?.trim() !== '' && (
                  <button
                    type='button'
                    onClick={() => setShowBanReasonModal(true)}
                    className='text-sm text-primary text-decoration-none p-0 border-0 bg-transparent'
                    style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    View Reason
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  background: statusBackgroundColor(capitalizeFirst(data?.general?.status || '') as OrderStatus),
                  color: statusTextColor(capitalizeFirst(data?.general?.status || '') as OrderStatus),
                }}
                className={`text-capitalize custom-badge custom-badge-${data?.general?.status?.toLowerCase()} rounded py-2 px-3 fw-medium`}
              >
                {data?.general?.status?.split('_')?.join(' ')}
              </div>
            )}
          </div>

          <div className='d-flex align-items-center gap-3 mb-4 flex-wrap'>
            {isAdmin ? (
              <button
                type='button'
                className='btn btn-outline-primary d-flex align-items-center justify-content-center gap-2'
                onClick={() => setShowSendIntakeFormModal((prev) => !prev)}
              >
                Send Form
              </button>
            ) : null}
            <button
              type='button'
              className='btn btn-outline-primary d-flex align-items-center justify-content-center gap-2'
              onClick={() => {
                dispatch(
                  setModal({
                    modalType: 'Telepath History',
                    ctx: { patientId: patient.id || '' },
                  })
                );
              }}
            >
              <FaHistory size={16} />
              Telepath History
            </button>
            <button
              type='button'
              className='btn btn-outline-primary d-flex align-items-center justify-content-center gap-2'
              onClick={() => {
                dispatch(
                  setModal({
                    modalType: 'Provider Patient Chat',
                    ctx: { patientId: patient.id || '', mode: 'patient' },
                  })
                );
              }}
            >
              <FaComments size={16} />
              Providers Chat Logs
            </button>
            <button
              type='button'
              className='btn btn-outline-primary d-flex align-items-center justify-content-center gap-2'
              onClick={() => {
                dispatch(
                  setModal({
                    modalType: 'Trustpilot Logs',
                    ctx: { patientId: patient.id || '', mode: 'patient' },
                  })
                );
              }}
            >
              <FaHistory size={16} />
              Trustpilot Logs
            </button>
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
                  <span>Messages</span>
                </Dropdown.Item>
                <Dropdown.Item
                  className={`py-2 px-3 ${activeView === 'notes' ? 'text-primary fw-medium' : ''}`}
                  onClick={() => {
                    handleDropdownAction('notes');
                  }}
                >
                  <span>Notes</span>
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
        <div
          className={
            `col-12 col-lg-4 ` + (activeView === 'messages' || activeView === 'notes' ? '' : 'd-none d-lg-block')
          }
        >
          <PatientChatSidebarAdmin defaultActiveTab={chatSidebarTab} onTabChange={(tab) => setChatSidebarTab(tab)} />
        </div>

        {/* Right Content (Patient Details) */}
        <div
          className={`col-12 col-lg-8 overflow-auto ${activeView === 'messages' || activeView === 'notes' ? 'd-none d-lg-block' : 'd-block'
            }`}
        >
          {/* Detail Cards */}
          <div className='row g-3'>
            <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='General'
                showDangerClass={false}
                isAdmin={true}
                actionButton={
                  <button
                    className={'btn-no-style text-sm fw-medium ' + (isManageDisabled ? '' : 'text-primary notes-btn')}
                    disabled={isManageDisabled}
                    onClick={() =>
                      dispatch(
                        setModal({
                          modalType: 'Edit Patient General Details',
                          ctx: {
                            ...data?.general,
                          },
                        })
                      )
                    }
                  >
                    Manage
                  </button>
                }
              />
            </div>

            {/* Orders History */}
            <div className='col-xl-6'>
              <OrdersList />
            </div>

            <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='Notes'
                showDangerClass={false}
                isAdmin={true}
                fullWidth
                selectedNotes={selectedNotes}
                onNotesSelectionChange={setSelectedNotes}
                refetchNotesCounter={refetchNotesCounter}
                actionButton={
                  <div className='d-flex align-items-center gap-3'>
                    {selectedNotes && selectedNotes.length > 0 ? (
                      <>
                        <button
                          className='btn-no-style text-xs text-primary text-nowrap notes-btn'
                          onClick={() => setSelectedNotes([])}
                        >
                          Cancel
                        </button>
                        <button
                          disabled={isArchiving}
                          className={
                            'btn-no-style text-xs text-nowrap notes-btn ' + (isArchiving ? '' : 'text-primary')
                          }
                          onClick={handleArchiveNotes}
                        >
                          Archive
                        </button>
                        <button
                          disabled={isDeleting}
                          className={'btn-no-style text-xs text-nowrap notes-btn ' + (isDeleting ? '' : 'text-danger')}
                          onClick={handleDeleteNotes}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          disabled={isManageDisabled}
                          onClick={() => {
                            dispatch(
                              setModal({
                                modalType: 'Add Patient Note',
                              })
                            );
                            dispatch(setModalType('Chart'));
                          }}
                          className='notes-btn btn-no-style text-nowrap text-primary d-flex align-items-center justify-content-center gap-1 text-xs'
                        >
                          <span>New Note</span>
                          <FaPlus size={12} className='flex-shrink-0' />
                        </button>
                        <button
                          disabled={isManageDisabled}
                          onClick={() =>
                            dispatch(
                              setModal({
                                modalType: 'Archived Notes',
                                type: 'Chart',
                              })
                            )
                          }
                          className='notes-btn btn-no-style text-primary text-xs text-nowrap'
                        >
                          Archived
                        </button>
                      </>
                    )}
                  </div>
                }
              />
            </div>

            <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='Contact Details'
                showEmailClass={false}
                showDangerClass={false}
                isAdmin={true}
                fullWidth
                actionButton={
                  <button
                    disabled={isManageDisabled}
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
                    className={'btn-no-style text-sm fw-medium ' + (isManageDisabled ? '' : 'text-primary notes-btn')}
                  >
                    Manage
                  </button>
                }
              />
            </div>
            {/* <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='Address'
                fullWidth
                actionButton={
                  <button
                    className={'btn-no-style text-sm fw-medium ' + (isManageDisabled ? '' : 'text-primary notes-btn')}
                    disabled={isManageDisabled}
                    onClick={() =>
                      dispatch(
                        setModal({
                          modalType: 'Edit Patient Address',
                          ctx: {
                            billingAddress: data?.address?.billingAddress,
                            shippingAddress: data?.address?.shippingAddress,
                            orderId: data?.orderId,
                            productName: orders?.[0]?.requestedProductName || '',
                          },
                        })
                      )
                    }
                  >
                    Manage
                  </button>
                }
              />
            </div> */}
            <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='Medical History'
                showDangerClass={false}
                isAdmin={true}
                fullWidth
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
                    className={'btn-no-style text-sm fw-medium ' + (isManageDisabled ? '' : 'text-primary notes-btn')}
                  >
                    Manage
                  </button>
                }
              />
            </div>
            <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='Body Metrics'
                showDangerClass={false}
                isAdmin={true}
                fullWidth
                actionButton={
                  <div className='d-flex align-items-center gap-3'>
                    {isViewingFromDoctor && (
                      <button
                        disabled={isManageDisabled}
                        onClick={() => setShowBMIHistory(true)}
                        className={
                          'btn-no-style text-xs fw-medium ' + (isManageDisabled ? '' : 'text-primary notes-btn')
                        }
                      >
                        View BMI History
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
                        (isManageDisabled ? '' : 'text-primary notes-btn')
                      }
                    >
                      Manage
                    </button>
                  </div>
                }
              />
            </div>
            <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='Latest Treatment'
                showDangerClass={false}
                isAdmin={true}
                fullWidth
              // actionButton={
              //   <span className='text-primary cursor-pointer fw-semibold text-end notes-btn tw-text-xs sm:tw-text-sm'>
              //     See Treatment History
              //   </span>
              // }
              />
            </div>
            <div className='col-xl-6'>
              <PatientDetailGroup
                data={data}
                title='Attachments'
                showDangerClass={false}
                isAdmin={true}
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
            <div className='col-12'>
              <PatientDetailGroup
                title='Attachments'
                overrideTitle='Forms'
                data={undefined}
                actionButton={
                  <button
                    className='btn btn-primary btn-sm d-flex align-items-center gap-2'
                    onClick={() => setShowSendIntakeFormModal(true)}
                  >
                    <FaPlus size={12} />
                    Send Form
                  </button>
                }
              >
                <Tab.Container defaultActiveKey='submitted'>
                  <Nav variant='tabs' className='border-bottom' style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
                    <Nav.Item style={{ flexShrink: 0 }}>
                      <Nav.Link eventKey='submitted' style={{ whiteSpace: 'nowrap' }}>
                        Submitted Forms
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item style={{ flexShrink: 0 }}>
                      <Nav.Link eventKey='assigned' style={{ whiteSpace: 'nowrap' }}>
                        Assigned Forms
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content className='mt-3'>
                    <Tab.Pane eventKey='assigned'>
                      <AssignedFormsTab
                        patientId={patient.id || ''}
                        patientName={
                          `${data?.general?.firstName || ''} ${data?.general?.lastName || ''}`.trim() ||
                          patient.email ||
                          'Patient'
                        }
                      />
                    </Tab.Pane>
                    <Tab.Pane eventKey='submitted'>
                      <SubmittedFormsTab
                        surveys={sortedSurveys}
                        onEditSurvey={handleEditSurvey}
                        onViewLogs={handleViewLogs}
                      />
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </PatientDetailGroup>
            </div>
          </div>
        </div>
      </div>

      {showAcceptRejectRXForm ? (
        <div className='mt-4 d-flex flex-column gap-4'>
          <AcceptRejectRXForm
            productImage={foundOrder?.image ?? ''}
            productName={foundOrder?.requestedProductName ?? ''}
            orderId={orderId ?? ''}
            // onAccept={handleAcceptPrescription}
            onReject={handleRejectPrescription}
            showActionButtons={showAcceptRejectRXFormActionButtons}
            allowEdit={allowEdit}
          />
        </div>
      ) : null}
      <PatientBMIhistory
        patientId={patient?.id ?? ''}
        isOpen={showBMIHistory}
        onClose={() => setShowBMIHistory(false)}
      />

      <ViewBanReasonModal isOpen={showBanReasonModal} onClose={() => setShowBanReasonModal(false)} patient={patient} />

      <SendIntakForm
        isOpen={showSendIntakeFormModal}
        onClose={() => {
          setShowSendIntakeFormModal(false);
        }}
        onFormSent={() => {
          // Invalidate assigned forms query to refetch after form is sent
          dispatch(patientApi.util.invalidateTags([{ type: 'SingleOrder', id: patient.id || '' }]));
        }}
        patientInfo={{
          id: patient.id || '',
          firstName: data?.general?.firstName || '',
          lastName: data?.general?.lastName || '',
        }}
      />

      {/* Universal Survey Edit Modal - works for all survey types */}
      {editingSurvey && editingSurvey.surveyId && (
        <EditSurveyModal
          isOpen={true}
          onClose={handleCloseEditSurvey}
          surveyId={editingSurvey.surveyId}
          preFilledResponses={editingSurvey.responses}
          submissionId={editingSurvey.survey.id}
          patientId={patient.id || undefined}
          patientEmail={data?.contact?.email || patient.email || ''}
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
    </>
  );
}

export default function PatientPopupAdmin({ ...props }: Readonly<PatientPopupProps>) {
  return (
    <Suspense>
      <PatientData {...props} />
    </Suspense>
  );
}