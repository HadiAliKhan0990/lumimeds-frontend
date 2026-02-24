'use client';

import ConfirmationModal from '@/components/ConfirmationModal';
import toast from 'react-hot-toast';
import Dropdown from 'react-bootstrap/Dropdown';
import parse from 'html-react-parser';
import { useState, useEffect, useMemo } from 'react';
import { formatRelativeDateWithTime } from '@/helpers/dateFormatter';
import { useDispatch, useSelector } from 'react-redux';
import { formatProviderName } from '@/lib/utils/providerName';
import {
  ChatConversation,
  setIsNewMessage,
  setMessages,
  setSelectedConversation,
  setNewChatUser,
  ChatRoomStatus,
  setMessagesLoading,
  setMessagesMeta,
  setPatientChatPaymentType,
  setPatientChatPlanName,
} from '@/store/slices/chatSlice';
import { RootState } from '@/store';
import { HiOutlinePaperClip } from 'react-icons/hi';
import { PATIENT_CHAT_STATUS } from '@/components/Dashboard/constants';
import { capitalizeFirst } from '@/lib/helper';
import { useUpdatePatientStatusMutation } from '@/store/slices/chatApiSlice';
import { parseMentions } from '@/lib/mentionUtils';
import { Error } from '@/lib/types';
import {
  setIsBlaseMessaging,
  setIsSelectedAll,
  setSelectedUsers,
  setIsDialogOpen,
} from '@/store/slices/blaseMessagingSlice';
import { useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';
import { isAxiosError } from 'axios';

interface Props {
  conversation: ChatConversation;
}

export const UserConversationCard = ({ conversation }: Props) => {
  const dispatch = useDispatch();

  const { selectedConversation, messages = [], selectedRole } = useSelector((state: RootState) => state.chat);

  const [triggerPatientChatMessages] = useLazyGetUserMessagesQuery();

  const fetchMessages = async () => {
    try {
      dispatch(setMessagesLoading(true));
      const data = await triggerPatientChatMessages({
        id: conversation.otherUser?.id || '',
        page: 1,
        limit: 50,
      }).unwrap();
      dispatch(setMessages(data?.messages ?? []));
      dispatch(setMessagesMeta(data?.meta ?? null));
      dispatch(setPatientChatPaymentType(data?.paymentType));
      dispatch(setPatientChatPlanName(data?.planName));
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setMessagesLoading(false));
    }
  };

  const handleSelectConversation = (data: ChatConversation) => {
    if (messages.length > 0 && selectedConversation && selectedConversation?.otherUser?.id !== data.otherUser?.id) {
      dispatch(setMessages([]));
    }
    dispatch(setSelectedConversation(data));
    dispatch(setIsNewMessage(false));
    dispatch(setNewChatUser(null));
    dispatch(setIsBlaseMessaging(false));
    dispatch(setIsDialogOpen(false));
    dispatch(setIsSelectedAll(false));
    dispatch(setSelectedUsers([]));

    if (conversation.otherUser?.id !== selectedConversation?.otherUser?.id) {
      fetchMessages();
    }
  };

  const [pendingStatus, setPendingStatus] = useState<ChatRoomStatus | undefined>(conversation.chatRoom?.status);
  const [open, setOpen] = useState(false);

  const [updatePatientStatus, { isLoading }] = useUpdatePatientStatusMutation();

  async function handleSubmit() {
    try {
      const { id = '' } = conversation.chatRoom || {};
      const { success, message } = await updatePatientStatus({ id, status: pendingStatus }).unwrap();
      if (success) {
        setOpen(false);
      } else {
        toast.error(message || 'Error while updating the status!');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message || 'Error while updating the status!'
          : (error as Error).data?.message || 'Error while updating the status!'
      );
    }
  }

  function handleClose() {
    setOpen(false);
    setPendingStatus(conversation.chatRoom?.status);
  }

  const messagePreview = useMemo(() => {
    if (conversation?.content) {
      // Parse mentions to show clean format
      const parsedContent = parseMentions(conversation.content);
      const cleanContent = parsedContent
        .map((part) => {
          if (part.type === 'mention') {
            return `@${part.patientName}`;
          }
          return part.content;
        })
        .join('');

      if (cleanContent.length > 20) {
        return `${cleanContent.substring(0, 20)}...`;
      } else {
        return cleanContent;
      }
    }
  }, [conversation]);

  const chatStatusOptions = useMemo(() => {
    const currentStatus = conversation.chatRoom?.status;
    return PATIENT_CHAT_STATUS.filter((status) => {
      // Filter out the current status
      if (status === currentStatus) return false;
      // If current status is resolved, also filter out unread
      if (currentStatus === 'resolved' && status === 'unread') return false;
      return true;
    });
  }, [conversation]);

  useEffect(() => {
    setPendingStatus(conversation.chatRoom?.status);
  }, [conversation.chatRoom?.status]);

  return (
    <>
      <div
        className={[
          `text-start rounded-2 p-2 w-100 d-flex align-items-center tw-cursor-pointer gap-2 chat-user`,
          conversation.otherUser?.id === selectedConversation?.otherUser?.id && 'active',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => handleSelectConversation(conversation)}
      >
        <span
          className={
            'conversation-avatar d-flex text-uppercase rounded-circle fw-bold align-items-center justify-content-center user-select-none'
          }
          style={{
            width: '50px',
            height: '50px',
            minWidth: '50px',
            minHeight: '50px',
            aspectRatio: '1/1',
          }}
        >
          {conversation.otherUser?.firstName || conversation.otherUser?.lastName
            ? `${conversation.otherUser?.firstName?.[0]}${conversation.otherUser?.lastName?.[0]}`
            : 'U'}
        </span>
        <div className='flex-grow-1'>
          <div className='text-capitalize d-flex align-items-center w-100 gap-1 mb-1'>
            <span className='flex-grow-1 fw-bold text-base'>
              {conversation.otherUser?.firstName
                ? conversation.otherUser?.role === 'provider'
                  ? formatProviderName(conversation.otherUser?.firstName, conversation.otherUser?.lastName)
                  : `${conversation.otherUser?.firstName} ${conversation.otherUser?.lastName}`
                : conversation.otherUser?.email}
            </span>

            <span className='text-xs fw-normal chat-user-date'>
              {formatRelativeDateWithTime(conversation.createdAt)}
            </span>
          </div>
          <div className='d-flex align-items-center gap-2 flex-wrap'>
            <div className='text-sm first-message [&_p]:tw-m-0 [&_ul]:tw-list-disc [&_ol]:tw-list-decimal [&_ul]:tw-pl-4 [&_ol]:tw-pl-4'>
              {messagePreview ? (
                parse(messagePreview)
              ) : (
                <span className='d-flex align-items-center gap-1'>
                  <HiOutlinePaperClip />
                  Sent an attachment
                </span>
              )}
            </div>
            {((conversation?.unreadCount ?? 0) > 0 || conversation.chatRoom?.status === 'unread') && (
              <span className='user-msg-notification bg-danger d-flex align-items-center justify-content-center text-white text-nowrap rounded'>
                {conversation?.unreadCount || 1}
              </span>
            )}
            {conversation.chatRoom && selectedRole !== 'admin' && (
              <Dropdown onClick={(e) => e.stopPropagation()} className='tw-ml-auto'>
                <Dropdown.Toggle
                  variant='light'
                  className='status-dropdown rounded text-sm px-3 py-1 fw-medium border'
                  style={{ minWidth: 120, textAlign: 'center' }}
                  id={`status-dropdown-${conversation.id}`}
                  data-status={(conversation.chatRoom?.status ?? '').toLowerCase()}
                >
                  {capitalizeFirst(conversation.chatRoom?.status ?? '')}
                </Dropdown.Toggle>
                <Dropdown.Menu className='border-light shadow-md'>
                  {chatStatusOptions.map((title) => (
                    <Dropdown.Item
                      key={title}
                      as='button'
                      onClick={() => {
                        if (
                          selectedConversation?.chatRoom?.status !== title &&
                          conversation.chatRoom?.status !== title
                        ) {
                          setPendingStatus(title as ChatRoomStatus);
                          setOpen(true);
                        }
                      }}
                    >
                      {capitalizeFirst(title)}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        show={open}
        onHide={handleClose}
        onConfirm={handleSubmit}
        title={
          <>
            Change Status to &quot;<span className='text-capitalize'>{pendingStatus}</span>&quot;?
          </>
        }
        message={
          <span className='text-placeholder'>
            Are you sure you want change status to &quot;{' '}
            <span className='fw-medium text-dark text-capitalize'>{pendingStatus}</span>&quot;?
          </span>
        }
        confirmLabel='Update'
        cancelLabel='Cancel'
        loading={isLoading}
      />
    </>
  );
};
