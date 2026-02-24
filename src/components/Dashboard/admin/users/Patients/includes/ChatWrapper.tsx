'use client';

import { connectChatSocket } from '@/lib/chatSocket';
import { PropsWithChildren, useEffect } from 'react';

interface Props extends PropsWithChildren {
  accessToken?: string | null;
}

export default function ChatWrapper({ accessToken, children }: Props) {
  useEffect(() => {
    if (accessToken) {
      const chatSocket = connectChatSocket(accessToken);

      chatSocket.on('connect', () => {
        console.log('connected');
      });

      chatSocket.on('disconnect', (reason) => {
        console.log('disconnected', reason);
      });

      return () => {
        chatSocket.off('connect');
        chatSocket.off('disconnect');
        // Don't disconnect here as it might be used by other components
        // The socket will be cleaned up when the token changes or app unmounts
      };
    }
  }, [accessToken]);

  return children;
}
