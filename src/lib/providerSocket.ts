import { io, Socket } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

// Global provider socket instance (live named export)
export let providerSocket: Socket | null = null;

export const getProviderSocket = (token: string): Socket => {
  if (!providerSocket) {
    providerSocket = io(URL, {
      autoConnect: false,
      reconnection: true,
      timeout: 10000,
      transports: ['websocket', 'polling'],
      auth: {
        token: token
      }
    });
  }
  return providerSocket;
};

export const connectProviderSocket = (token: string): Socket => {
  const socket = getProviderSocket(token);
  if (!socket.connected) {
    socket.connect();
  }

  providerSocket = socket;

  return socket;
};

export const disconnectProviderSocket = (): void => {
  if (providerSocket) {
    providerSocket.disconnect();
    providerSocket = null;
  }
};

export const setProviderSocket = (socket: Socket | null): void => {
  providerSocket = socket
};
