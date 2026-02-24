import { io, Socket } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

// Global chat socket instance
let chatSocket: Socket | null = null;
let currentToken: string | null = null;

export const getChatSocket = (token: string): Socket => {
  // If token changed, disconnect old socket and create new one
  if (chatSocket && currentToken !== token) {
    console.log('Token changed, recreating socket connection');
    chatSocket.disconnect();
    chatSocket = null;
    currentToken = null;
  }

  if (!chatSocket) {
    console.log('Creating new socket instance');
    currentToken = token;
    chatSocket = io(URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      auth: token ? { token } : {},
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      transports: ['websocket', 'polling'],
    });

    // Add connection event handlers for debugging
    chatSocket.on('connect', () => {
      // console.log('Socket connected successfully');
    });

    chatSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
    });

    chatSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    chatSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  return chatSocket;
};

export const connectChatSocket = (token: string): Socket => {
  const socket = getChatSocket(token);
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectChatSocket = (): void => {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
    currentToken = null;
  }
};

// Helper function to check socket connection status
export const isSocketConnected = (): boolean => {
  return chatSocket?.connected ?? false;
};

// Helper function to get socket ID
export const getSocketId = (): string | undefined => {
  return chatSocket?.id;
};

// Helper function to get the current chat socket instance (if it exists)
export const getCurrentChatSocket = (): Socket | null => {
  return chatSocket;
};
