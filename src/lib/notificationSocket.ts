import { Socket } from 'socket.io-client';
import { createNotificationsSocket } from './socket';

export interface NotificationSocketEvents {
  connected: (data: { providerId: string; message: string }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notification: (data: { type: string; notification: any }) => void;
  unread_count_update: (data: { count: number }) => void;
  BAD_REQUEST: (data: { error: string }) => void;
  UNAUTHORIZED: (data: { error: string }) => void;
}

class NotificationSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  // private reconnectDelay = 1000;
  private isConnecting = false;

  get connectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    if (!this.socket) return 'disconnected';
    if (this.isConnecting) return 'connecting';
    if (this.socket.connected) return 'connected';
    return 'disconnected';
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get socketInstance(): Socket | null {
    return this.socket;
  }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected || this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        // Use the socket factory function from socket.ts
        this.socket = createNotificationsSocket(token);

        this.socket.on('connect', () => {
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          this.isConnecting = false;
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          this.isConnecting = false;
          
          if (reason === 'io server disconnect') {
            this.attemptReconnect(token);
          }
        });

        this.socket.on('error', () => {
          this.isConnecting = false;
        });

        this.socket.connect();
        
        // Add a timeout to prevent hanging
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error('Socket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    console.log('attempting reconnect', token);
    
    this.reconnectAttempts++;
    
    // setTimeout(() => {
    //   if (token) {
       
    //   }
    // }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  on<T extends keyof NotificationSocketEvents>(event: T, callback: NotificationSocketEvents[T]): void {
    if (this.socket) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket.on(event, callback as any);
    }
  }

  off<T extends keyof NotificationSocketEvents>(event: T, callback?: NotificationSocketEvents[T]): void {
    if (this.socket) {
      if (callback) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.socket.off(event, callback as any);
      } else {
        this.socket.off(event);
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }
}

const notificationSocket = new NotificationSocketService();
export default notificationSocket;
