'use client';

import socket from '@/lib/socket';
import { RootState } from '@/store';
import { useLazyGetPatientUnreadCountQuery, useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';
import {
  setLoading,
  setPatientChatMessages,
  setPatientChatMeta,
  setPatientChatRoom,
} from '@/store/slices/patientChatSlice';
import { PropsWithChildren, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isValidUUID } from '@/lib/utils/validation';

interface Props extends PropsWithChildren {
  accessToken?: string | null;
}

export default function ChatWrapper({ accessToken, children }: Props) {
  const dispatch = useDispatch();

  const userId = useSelector((state: RootState) => state.patientChat.chatId);

  const [triggerPatientUnreadCount] = useLazyGetPatientUnreadCountQuery();
  const [triggerPatientChatMessages] = useLazyGetUserMessagesQuery();

  const fetchData = async () => {
    if (userId) {
      // Validate UUID before making API call to prevent backend errors
      if (!isValidUUID(userId)) {
        console.error('Invalid UUID format for userId:', userId);
        dispatch(setLoading(false));
        return;
      }

      try {
        dispatch(setLoading(true));
        const res = await triggerPatientChatMessages({ id: userId, page: 1, limit: 50 }).unwrap();
        dispatch(setPatientChatMessages(res?.messages));
        dispatch(setPatientChatMeta(res?.meta));
        dispatch(setPatientChatRoom(res?.chatRoom));

        // Scroll is now handled by ChatContent component
      } catch (error) {
        console.log(error);
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  const connectSocket = async (token: string) => {
    socket.io.opts.extraHeaders = { token };
    socket.connect();
    socket.on('connect', async () => {
      console.log('connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('disconnected', reason);
    });

    socket.on('newMessage', triggerPatientUnreadCount);
  };

  useEffect(() => {
    if (accessToken) {
      connectSocket(accessToken);
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('newMessage', triggerPatientUnreadCount);
      socket.disconnect();
    };
  }, [accessToken]);

  useEffect(() => {
    fetchData();
  }, [userId]);

  return children;
}
