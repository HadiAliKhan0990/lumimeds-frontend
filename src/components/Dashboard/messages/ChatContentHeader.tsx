'use client';

import ConfirmationModal from '@/components/ConfirmationModal';
import toast from 'react-hot-toast';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Dropdown from 'react-bootstrap/Dropdown';
import ProviderSidebar from '@/components/Dashboard/admin/users/Providers/includes/ProviderSidebar';
import {
  ChatConversation,
  setChatUsers,
  setIsNewMessage,
  setNewChatUser,
  setSelectedConversation,
} from '@/store/slices/chatSlice';
import { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { capitalizeFirst } from '@/lib/helper';
import { formatProviderName } from '@/lib/utils/providerName';
import { PATIENT_CHAT_STATUS } from '@/components/Dashboard/constants';
import { useUpdatePatientStatusMutation } from '@/store/slices/chatApiSlice';
import { RootState } from '@/store';
import { BiSolidUserDetail } from 'react-icons/bi';
import { Error } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { setPatient } from '@/store/slices/patientSlice';
import { setOrder } from '@/store/slices/orderSlice';
import { useLazyGetPatientsQuery } from '@/store/slices/patientsApiSlice';
import { isAxiosError } from 'axios';
import { CircularProgress } from '@/components/elements';
import { useLazyGetProvidersQuery } from '@/store/slices/providersApiSlice';
import { setProvider } from '@/store/slices/providerSlice';

export const ChatContentHeader = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const selectedConversation = useSelector((state: RootState) => state.chat.selectedConversation);
  const paymentType = useSelector((state: RootState) => state.chat.paymentType);
  const planName = useSelector((state: RootState) => state.chat.planName);
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const selectedRole = useSelector((state: RootState) => state.chat.selectedRole);
  const patient = useSelector((state: RootState) => state.patient);
  const provider = useSelector((state: RootState) => state.provider);
  const order = useSelector((state: RootState) => state.order);

  const { otherUser, chatRoom } = selectedConversation || {};

  const [pendingStatus, setPendingStatus] = useState<ChatConversation['chatRoom']>();
  const [open, setOpen] = useState(false);
  const [sidebar, setSidebar] = useState<null | 'patient' | 'provider'>(null);
  const [orderModalType, setOrderModalType] = useState<'orderDetails' | 'orderPopup' | null>(null);

  const [updatePatientStatus, { isLoading }] = useUpdatePatientStatusMutation();
  const [triggerGetPatient, { isFetching: isFetchingGetPatient }] = useLazyGetPatientsQuery();
  const [triggerGetProvider, { isFetching: isFetchingGetProvider }] = useLazyGetProvidersQuery();

  const isProviderLogged = pathname?.includes('/provider');

  async function handleSubmit() {
    try {
      const { id = '' } = chatRoom || {};
      const { status = 'unread' } = pendingStatus || {};
      const { success, message } = await updatePatientStatus({ id, status }).unwrap();
      if (success) {
        setOpen(false);
      } else {
        toast.error(message || 'Error while updating the status!');
      }
    } catch (error: unknown) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data?.message || 'Error while updating the status!'
      );
    }
  }

  function handleCloseSidebar() {
    setSidebar(null);
  }

  function handleClose() {
    setOpen(false);
    setPendingStatus(chatRoom);
  }

  async function getPatient() {
    
    if (isFetchingGetPatient || !otherUser?.email) return;
    try {
      const { data, success, message } = await triggerGetPatient({
        search: otherUser.email,
        meta: { page: 1, limit: 1 },
      }).unwrap();

      if (success && data?.patients?.[0]?.email === otherUser.email) {
       
        dispatch(setPatient(data.patients[0]));
        setSidebar('patient');
      } else {
        toast.error(message || 'Patient not found!');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data?.message || 'Error while fetching patient details!'
      );
    }
  }

  async function getProvider() {
    if (isFetchingGetProvider || !otherUser?.email) return;
    try {
      const { data, success, message } = await triggerGetProvider({
        search: otherUser.email,
        meta: { page: 1, limit: 1 },
      }).unwrap();
      if (success && data?.providers?.[0]?.email === otherUser.email) {
        dispatch(setProvider(data.providers[0]));
        setSidebar('provider');
      } else {
        toast.error(message || 'Provider not found!');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data?.message || 'Error while fetching provider details!'
      );
    }
  }

  async function handleViewUserDetails() {
    switch (otherUser?.role) {
      case 'patient':
        if (otherUser?.email) {
          if (patient?.email === otherUser?.email) {
            setSidebar('patient');
          } else {
            await getPatient();
          }
        } else {
          toast.error('Patient email is required!');
        }
        break;
      case 'provider':
        if (otherUser?.email) {
          if (provider?.email === otherUser?.email) {
            setSidebar('provider');
          } else {
            await getProvider();
          }
        } else {
          toast.error('Provider email is required!');
        }
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    setPendingStatus(chatRoom);
  }, [chatRoom]);

  // Sync selectedConversation with updated conversations list when status changes
  useEffect(() => {
    if (!selectedConversation?.chatRoom?.id) return;

    // Get the appropriate conversations list based on role
    let conversationsList: ChatConversation[] | undefined;
    if (selectedRole === 'patient') {
      conversationsList = conversations.patient;
    } else {
      conversationsList = conversations.provider;
    }

    if (!conversationsList || conversationsList.length === 0) return;

    // Find the matching conversation by chatRoom.id
    const updatedConversation = conversationsList.find(
      (conv) => conv.chatRoom?.id === selectedConversation.chatRoom?.id
    );

    // If found and status differs, update selectedConversation
    if (
      updatedConversation?.chatRoom?.status &&
      updatedConversation.chatRoom.status !== selectedConversation.chatRoom?.status
    ) {
      dispatch(
        setSelectedConversation({
          ...selectedConversation,
          chatRoom: {
            ...selectedConversation.chatRoom,
            status: updatedConversation.chatRoom.status,
          },
        })
      );
    }
  }, [
    conversations.admin,
    conversations.patient,
    conversations.provider,
    selectedConversation?.chatRoom?.id,
    selectedConversation?.chatRoom?.status,
    selectedRole,
    dispatch,
  ]);

  const chatStatusOptions = useMemo(() => {
    const currentStatus = chatRoom?.status;
    return PATIENT_CHAT_STATUS.filter((status) => {
      // Filter out the current status
      if (status === currentStatus) return false;
      // If current status is resolved, also filter out unread
      if (currentStatus === 'resolved' && status === 'unread') return false;
      return true;
    });
  }, [chatRoom]);

  return (
    <>
      <div className='px-4 pt-4'>
        <div className='pb-3 border-bottom border-black-alpha'>
          <div className='text-capitalize text-4xl fw-medium tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-gap-2 mb-2'>
            <div className='tw-flex tw-gap-2 tw-text-truncate'>
              <FaChevronLeft
                className='cursor-pointer d-lg-none mt-2 sm:mt-0'
                size={20}
                onClick={() => {
                  dispatch(setSelectedConversation(undefined));
                  dispatch(setChatUsers(null));
                  dispatch(setNewChatUser(null));
                  dispatch(setIsNewMessage(false));
                }}
              />

              {otherUser?.role === 'patient' || (otherUser?.role === 'provider' && !isProviderLogged) ? (
                <button
                  onClick={handleViewUserDetails}
                  type='button'
                  disabled={isFetchingGetPatient || isFetchingGetProvider}
                  className='tw-text-lg sm:tw-text-3xl disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-capitalize p-0 d-flex align-items-center gap-2'
                >
                  <span className='tw-font-medium'>
                    {otherUser?.firstName
                      ? otherUser.role === 'provider'
                        ? formatProviderName(otherUser.firstName, otherUser.lastName)
                        : `${otherUser.firstName} ${otherUser.lastName}`.trim()
                      : otherUser?.email}
                  </span>
                  {isFetchingGetPatient || isFetchingGetProvider ? (
                    <CircularProgress className='!tw-w-5 !tw-h-5 tw-flex-shrink-0' />
                  ) : (
                    <OverlayTrigger
                      placement='right'
                      overlay={<Tooltip id='user-details-tooltip'>Show Details</Tooltip>}
                    >
                      <BiSolidUserDetail className='tw-flex-shrink-0' size={40} />
                    </OverlayTrigger>
                  )}
                </button>
              ) : otherUser?.firstName ? (
                otherUser.role === 'provider' ? (
                  <span className='tw-line-clamp-1' title={formatProviderName(otherUser.firstName, otherUser.lastName)}>
                    {formatProviderName(otherUser.firstName, otherUser.lastName)}
                  </span>
                ) : (
                  <span className='tw-line-clamp-1' title={`${otherUser.firstName} ${otherUser.lastName}`.trim()}>
                    {' '}
                    {`${otherUser.firstName} ${otherUser.lastName}`.trim()}
                  </span>
                )
              ) : (
                <span className='tw-line-clamp-1' title={otherUser?.email}>
                  {' '}
                  {otherUser?.email}
                </span>
              )}
            </div>

            {otherUser?.role === 'patient' && (
              <div className='d-flex tw-self-start sm:tw-self-end tw-mb-1.5 gap-2 flex-wrap'>
                {paymentType && (
                  <div className='d-flex align-items-center gap-2'>
                    <span className='p-1 bg-vivid-magenta border border-light rounded-circle' />
                    <span className='text-xs fw-normal'>{paymentType}</span>
                  </div>
                )}
                {planName && (
                  <div className='d-flex align-items-center gap-2'>
                    <span className='p-1 bg-primary border border-light rounded-circle' />
                    <span className='text-xs fw-normal'>{planName}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {chatRoom && otherUser?.role === 'patient' && (
            <div className='d-flex align-items-center gap-2'>
              <span className='text-placeholder flex-shrink-0'>Status</span>
              <Dropdown>
                <Dropdown.Toggle
                  variant='light'
                  className='status-dropdown rounded px-3 py-1 fw-medium border'
                  style={{ minWidth: 100, textAlign: 'center' }}
                  id={`status-dropdown-header-${chatRoom.id}`}
                  data-status={(chatRoom?.status || '').toLowerCase()}
                >
                  {capitalizeFirst(chatRoom?.status || '')}
                </Dropdown.Toggle>
                <Dropdown.Menu className='border-light shadow-md'>
                  {chatStatusOptions.map((title) => (
                    <Dropdown.Item
                      key={title}
                      as='button'
                      onClick={() => {
                        if (selectedConversation?.chatRoom?.status !== title) {
                          setPendingStatus({ status: title } as ChatConversation['chatRoom']);
                          setOpen(true);
                        }
                      }}
                    >
                      {capitalizeFirst(title)}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}

      <ConfirmationModal
        show={open}
        onHide={handleClose}
        onConfirm={handleSubmit}
        title={
          <>
            Change Status to &quot;<span className='text-capitalize'>{pendingStatus?.status}</span>&quot;?
          </>
        }
        message={
          <span className='text-placeholder'>
            Are you sure you want change status to &quot;
            <span className='fw-medium text-dark text-capitalize'>{pendingStatus?.status}</span>&quot;?
          </span>
        }
        confirmLabel='Update'
        cancelLabel='Cancel'
        loading={isLoading}
      />

      {/* Sidebar */}

      <PatientSideBar
        show={sidebar === 'patient'}
        onHide={handleCloseSidebar}
        onOrderClick={() => setOrderModalType('orderDetails')}
      />
      <ProviderSidebar show={sidebar === 'provider'} onHide={handleCloseSidebar} />

      {/* Order Modals */}
      <OrderDetailsModal
        isOpen={orderModalType === 'orderDetails'}
        onClose={() => setOrderModalType(null)}
        onOpenOrderSidebar={(order) => {
          dispatch(setOrder(order));
          setOrderModalType('orderPopup');
        }}
      />

      <OrderPopup
        show={orderModalType === 'orderPopup'}
        onHide={() => setOrderModalType(null)}
        orderUniqueId={order?.orderUniqueId ?? null}
      />
    </>
  );
};
