import { Socket } from 'socket.io-client';
import { createAuthenticatedSocket } from './socket';
import { ChatMessages } from '@/store/slices/chatSlice';

export interface DashboardSocketEvents {
  dashboard_update: (stats: Record<string, unknown>) => void;
  appointment_event: (data: {
    type: string;
    event: string;
    appointment?: Record<string, unknown>;
    encounter?: Record<string, unknown>;
  }) => void;
  connected: (data: Record<string, unknown>) => void;
  error: (error: Error | string) => void;
  BAD_REQUEST: (data: Record<string, unknown>) => void;
  UNAUTHORIZED: (data: Record<string, unknown>) => void;
}

class ProviderDashboardSocketService {
  private dashboardSocket: Socket | null = null;
  private defaultSocket: Socket | null = null;

  // ---- Dashboard stuff (same as before) ----
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  get isConnected(): boolean {
    return this.dashboardSocket?.connected || false;
  }

  get connectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (this.isConnected) return 'connected';
    if (this.reconnectAttempts > 0) return 'error';
    return 'disconnected';
  }

  get socketInstance(): Socket | null {
    return this.dashboardSocket;
  }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.dashboardSocket?.connected || this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        // dashboard namespace
        this.dashboardSocket = createAuthenticatedSocket('/dashboard', token);

        this.dashboardSocket.on('connect', () => {
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        });

        this.dashboardSocket.on('connect_error', (error) => {
          console.error('Provider dashboard socket connection error:', error);
          this.isConnecting = false;
          reject(error);
        });

        this.dashboardSocket.on('disconnect', (reason) => {
          console.log('Provider dashboard socket disconnected:', reason);
          this.isConnecting = false;

          if (reason === 'io server disconnect') {
            this.attemptReconnect(token);
          }
        });

        this.dashboardSocket.on('error', (error) => {
          console.error('Provider dashboard socket error:', error);
          this.isConnecting = false;
        });

        this.dashboardSocket.connect();

        // Prevent hanging
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
      console.error('Max reconnection attempts reached for provider dashboard socket');
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect provider dashboard socket... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect(token).catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, 2000 * this.reconnectAttempts);
  }

  // ---- Event listeners ----
  onDashboardUpdate(callback: (stats: Record<string, unknown>) => void): void {
    this.dashboardSocket?.off('dashboard_update');
    this.dashboardSocket?.on('dashboard_update', callback);
  }

  onAppointmentEvent(
    callback: (data: {
      type: string;
      event: string;
      appointment?: Record<string, unknown>;
      encounter?: Record<string, unknown>;
    }) => void
  ): void {
    this.dashboardSocket?.off('appointment_event');
    this.dashboardSocket?.on('appointment_event', callback);
  }

  // ✅ Listen to newMessage from default namespace
  connectDefaultNamespace(token: string): void {
    if (this.defaultSocket?.connected) return;

    this.defaultSocket = createAuthenticatedSocket('/', token);

    this.defaultSocket.connect();
  }

  onNewMessage(callback: (message: ChatMessages) => void): void {
    this.defaultSocket?.off('newMessage');
    this.defaultSocket?.on('newMessage', callback);
  }

  removeAllListeners(): void {
    this.dashboardSocket?.removeAllListeners();
    this.defaultSocket?.removeAllListeners();
  }

  removeNewMessageListener(callback: (message: ChatMessages) => void): void {
    this.defaultSocket?.off('newMessage', callback);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.dashboardSocket?.disconnect();
    this.defaultSocket?.disconnect();

    this.dashboardSocket = null;
    this.defaultSocket = null;

    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  getDashboardSocket(): Socket | null {
    return this.dashboardSocket;
  }

  getDefaultSocket(): Socket | null {
    return this.defaultSocket;
  }
}

export const providerDashboardSocket = new ProviderDashboardSocketService();
