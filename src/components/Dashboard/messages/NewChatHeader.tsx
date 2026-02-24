'use client';

import toast from 'react-hot-toast';
import ProviderSidebar from '@/components/Dashboard/admin/users/Providers/includes/ProviderSidebar';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { getChatUsers } from '@/services/chat';
import { RootState } from '@/store';
import {
  setChatUsers,
  setChatUsersMeta,
  setPatientsConversations,
  setProvidersConversations,
  setPatientsConversationsMeta,
  setProvidersConversationsMeta,
  setIsNewMessage,
  setNewChatUser,
} from '@/store/slices/chatSlice';
import { useMemo, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyGetConversationsListQuery } from '@/store/slices/chatApiSlice';
import { formatProviderName } from '@/lib/utils/providerName';
import { setPatient } from '@/store/slices/patientSlice';
import { setProvider } from '@/store/slices/providerSlice';
import { useLazyGetPatientsQuery } from '@/store/slices/patientsApiSlice';
import { useLazyGetProvidersQuery } from '@/store/slices/providersApiSlice';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';
import { CircularProgress } from '@/components/elements';
import { BiSolidUserDetail } from 'react-icons/bi';
import { capitalizeFirst } from '@/lib/helper';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { setOrder } from '@/store/slices/orderSlice';

interface Props {
  setInputValue: (ag: string) => void;
}

export const NewChatHeader = ({ setInputValue }: Props) => {
  const dispatch = useDispatch();
  const { windowWidth } = useWindowWidth();

  const selectedRole = useSelector((state: RootState) => state.chat.selectedRole);
  const newChatUser = useSelector((state: RootState) => state.chat.newChatUser);
  const selectedFilter = useSelector((state: RootState) => state.chat.conversationFilter);
  const role = useSelector((state: RootState) => state.chat.selectedRole);
  const conversationsMeta = useSelector((state: RootState) => state.chat.conversationsMeta);
  const patient = useSelector((state: RootState) => state.patient);
  const provider = useSelector((state: RootState) => state.provider);

  const [sidebar, setSidebar] = useState<null | 'patient' | 'provider'>(null);
  const [orderModalType, setOrderModalType] = useState<'orderDetails' | 'orderPopup' | null>(null);
  const order = useSelector((state: RootState) => state.order);

  const meta = useMemo(() => {
    return role === 'patient' ? conversationsMeta.patient : conversationsMeta.provider;
  }, [role]);

  const { sortField, sortOrder } = meta || {};

  const [triggerConversationsList] = useLazyGetConversationsListQuery();
  const [triggerGetPatient, { isFetching: isFetchingGetPatient }] = useLazyGetPatientsQuery();
  const [triggerGetProvider, { isFetching: isFetchingGetProvider }] = useLazyGetProvidersQuery();

  const handleCancel = async () => {
    setInputValue('');
    dispatch(setChatUsers(null));
    dispatch(setNewChatUser(null));
    dispatch(setIsNewMessage(false));
    const data = await triggerConversationsList({
      page: 1,
      limit: 30,
      role,
      ...(selectedFilter === 'Unread' && { unreadOnly: true }),
      ...(selectedFilter === 'Unresolved' && { unresolvedOnly: true }),
      ...(sortOrder && sortField && { sortOrder, sortField }),
    }).unwrap();
    if (role === 'patient') {
      dispatch(setPatientsConversations(data?.conversations));
      dispatch(setPatientsConversationsMeta(data?.meta));
    } else {
      dispatch(setProvidersConversations(data?.conversations));
      dispatch(setProvidersConversationsMeta(data?.meta));
    }
  };

  const handleClickUserRemove = async () => {
    setInputValue('');
    dispatch(setNewChatUser(null));
    const { users, meta } = await getChatUsers(selectedRole);
    dispatch(setChatUsers(users));
    dispatch(setChatUsersMeta(meta));
    if (windowWidth <= 768) {
      dispatch(setIsNewMessage(true));
    }
  };

  async function getPatient() {
    if (isFetchingGetPatient || !newChatUser?.email) return;
    try {
      const { data, success, message } = await triggerGetPatient({
        search: newChatUser.email.toLowerCase().trim(),
        meta: { page: 1, limit: 1 },
      }).unwrap();

      if (success && data?.patients?.[0]?.email === newChatUser.email) {
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
    if (isFetchingGetProvider || !newChatUser?.email) return;
    try {
      const { data, success } = await triggerGetProvider({
        search: newChatUser.email.toLowerCase().trim(),
        meta: { page: 1, limit: 1 },
      }).unwrap();
      if (success && data?.providers?.[0]?.email === newChatUser.email) {
        dispatch(setProvider(data.providers[0]));
        setSidebar('provider');
      } else {
        toast.error('Provider not found!');
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
    switch (newChatUser?.role) {
      case 'patient':
        if (newChatUser?.email) {
          if (patient?.email === newChatUser?.email) {
            setSidebar('patient');
          } else {
            await getPatient();
          }
        } else {
          toast.error('Patient email is required!');
        }
        break;
      case 'provider':
        if (newChatUser?.email) {
          if (provider?.email === newChatUser?.email) {
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

  function handleCloseSidebar() {
    setSidebar(null);
  }

  return (
    <>
      <div className='tw-flex tw-items-center tw-justify-between tw-relative tw-p-4 md:tw-p-6 tw-gap-2 border-bottom border-black-alpha'>
        <div className='tw-space-y-2'>
          <div className='tw-flex tw-items-center tw-gap-2'>
            <span className='text-sm text-secondary'>Role:</span>
            {selectedRole && (
              <div className='status-badge confirmed d-flex gap-2 align-items-center'>
                <p className='m-0'>{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</p>
                <IoClose size={16} className='cursor-pointer text-danger' onClick={handleCancel} />
              </div>
            )}
          </div>
          <div className='tw-flex tw-items-center tw-flex-wrap tw-gap-3'>
            <div className='d-flex gap-2 align-items-center'>
              <span className='text-sm text-secondary'>To:</span>
              {selectedRole && newChatUser && (
                <div key={newChatUser.id} className='status-badge confirmed d-flex gap-2 align-items-center'>
                  <span>
                    {newChatUser.role === 'provider'
                      ? formatProviderName(newChatUser.firstName, newChatUser.lastName)
                      : `${newChatUser.firstName} ${newChatUser.lastName}`}
                  </span>
                  <IoClose size={16} className='cursor-pointer text-danger' onClick={handleClickUserRemove} />
                </div>
              )}
            </div>
            {(newChatUser?.role === 'patient' || newChatUser?.role === 'provider') && selectedRole && newChatUser && (
              <button
                disabled={isFetchingGetPatient || isFetchingGetProvider}
                className='tw-p-0 tw-flex tw-items-center tw-gap-2 disabled:tw-opacity-50 disabled:tw-pointer-events-none'
                type='button'
                onClick={handleViewUserDetails}
              >
                View {capitalizeFirst(selectedRole)} Profile
                {isFetchingGetPatient || isFetchingGetProvider ? (
                  <CircularProgress className='tw-flex-shrink-0' />
                ) : (
                  <BiSolidUserDetail className='tw-flex-shrink-0' size={20} />
                )}
              </button>
            )}
          </div>
        </div>
        <button
          className='tw-px-3 tw-py-1.5 tw-text-sm tw-bg-white tw-text-nowrap tw-text-primary tw-border tw-border-solid tw-border-primary hover:tw-bg-primary/10 tw-transition-all'
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>

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
