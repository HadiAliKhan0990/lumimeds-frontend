import { io, Socket } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

// Main socket instance
const socket = io(URL, {
  autoConnect: false,
  reconnection: true,
});

// Function to create authenticated socket connections for different namespaces
export const createAuthenticatedSocket = (namespace: string, token: string): Socket => {
  const socketURL = `${URL}${namespace}`;
  
  return io(socketURL, {
    autoConnect: false,
    reconnection: false, // We'll handle reconnection manually for authenticated sockets
    timeout: 10000,
    transports: ['websocket', 'polling'],
    auth: {
      token: token
    }
  });
};

// Function to create notifications socket with auth
export const createNotificationsSocket = (token: string): Socket => {
  return createAuthenticatedSocket('/notifications', token);
};

export default socket;
