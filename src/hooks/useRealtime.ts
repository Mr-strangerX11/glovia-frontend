'use client';

import { useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

export type RealtimeEventCallback = (data: any) => void;

export interface UseRealtimeOptions {
  url?: string;
  autoConnect?: boolean;
  channels?: string[];
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const { 
    url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    autoConnect = true,
    channels = [],
  } = options;

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect) return;

    if (!socketRef.current) {
      socketRef.current = io(url, {
        path: '/socket.io/',
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        namespace: '/realtime',
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected:', socketRef.current?.id);
        
        // Subscribe to initial channels
        if (channels.length > 0) {
          channels.forEach((channel) => {
            socketRef.current?.emit('subscribe', { channel });
          });
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });
    }

    return () => {
      // Don't disconnect on unmount to preserve connection across component renders
    };
  }, [url, autoConnect, channels]);

  // Subscribe to a channel
  const subscribe = useCallback((channel: string) => {
    socketRef.current?.emit('subscribe', { channel });
  }, []);

  // Unsubscribe from a channel
  const unsubscribe = useCallback((channel: string) => {
    socketRef.current?.emit('unsubscribe', { channel });
  }, []);

  // Listen to specific events
  const on = useCallback((event: string, callback: RealtimeEventCallback) => {
    socketRef.current?.on(event, callback);
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  // Emit events
  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  // Get socket instance
  const getSocket = useCallback(() => socketRef.current, []);

  // Disconnect socket
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  return {
    subscribe,
    unsubscribe,
    on,
    emit,
    getSocket,
    disconnect,
    isConnected: socketRef.current?.connected ?? false,
  };
}
