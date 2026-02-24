'use client';

import ChatContent from '@/components/Dashboard/patient/messages/ChatContent';
import Link from 'next/link';
import socket from '@/lib/socket';
import { ROUTES } from '@/constants';
import { RootState } from '@/store';
import { useLazyGetPatientUnreadCountQuery } from '@/store/slices/patientChatApiSlice';
import {
  setPatientChatId,
  addPatientChatMessage,
  setCareTeamUnreadCount,
  setClinicalTeamUnreadCount,
  setProviderUnreadCount,
} from '@/store/slices/patientChatSlice';
import { useEffect } from 'react';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { ChatMessages } from '@/store/slices/chatSlice';

interface Props {
  chatId: string;
  title: string;
}

export default function PatientChat({ chatId, title }: Readonly<Props>) {
  const dispatch = useDispatch();

  const id = useSelector((state: RootState) => state.patientChat.chatId);
  const unreadCountData = useSelector((state: RootState) => state.patientChat.unreadCountData);
  const providerBreakdown = unreadCountData?.providers?.conversationsBreakdown || [];

  const [triggerPatientUnreadCount] = useLazyGetPatientUnreadCountQuery();

  const handleNewMessage = (res: ChatMessages) => {
    dispatch(addPatientChatMessage(res));

    socket.emit('markAsRead', { userId: id }, () => {
      if (id === unreadCountData?.careTeam.careTeamId) {
        dispatch(setCareTeamUnreadCount(0));
      } else if (id === unreadCountData?.clinicalTeam.id) {
        dispatch(setClinicalTeamUnreadCount(0));
      } else if (providerBreakdown.some((c) => c.providerUserId === id)) {
        dispatch(setProviderUnreadCount(0));
      }

      triggerPatientUnreadCount();
    });

    // Scroll is now handled by ChatContent component
  };

  useEffect(() => {
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [handleNewMessage]);

  useEffect(() => {
    if (chatId) {
      dispatch(setPatientChatId(chatId));

      socket.emit('markAsRead', { userId: chatId }, () => {
        if (chatId === unreadCountData?.careTeam.careTeamId) {
          dispatch(setCareTeamUnreadCount(0));
        } else if (chatId === unreadCountData?.clinicalTeam.id) {
          dispatch(setClinicalTeamUnreadCount(0));
        } else if (providerBreakdown.some((c) => c.providerUserId === chatId)) {
          dispatch(setProviderUnreadCount(0));
        }

        triggerPatientUnreadCount();
      });
    }
  }, [chatId]);
  return (
    <>
      <Link
        href={ROUTES.PATIENT_MESSAGES}
        className='mb-1 md:mb-4 d-inline-flex align-items-center cursor-pointer text-decoration-none'
        onClick={() => dispatch(setPatientChatId(undefined))}
      >
        <MdOutlineKeyboardArrowLeft color='blue' size={35} />
        <span className='fs-6 md:fs-3 text-dark fw-medium'>{title}</span>
      </Link>
      <div className='d-flex bg-white rounded-4 overflow-hidden chat-messages patient'>
        <ChatContent />
      </div>
    </>
  );
}
