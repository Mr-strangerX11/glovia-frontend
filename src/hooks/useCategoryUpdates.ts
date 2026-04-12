import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface CategoryUpdate {
  event: string;
  data: any;
  timestamp: string;
}

export const useCategoryUpdates = (onUpdate?: (update: CategoryUpdate) => void) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<CategoryUpdate | null>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to category updates');
      setIsConnected(true);
      // Subscribe to category updates
      newSocket.emit('subscribe-categories');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from category updates');
      setIsConnected(false);
    });

    // Listen for category updates
    newSocket.on('category-updated', (data: CategoryUpdate) => {
      console.log('Category updated:', data);
      setLastUpdate(data);
      onUpdate?.(data);
    });

    // Listen for subcategory creation
    newSocket.on('subcategory-created', (data: CategoryUpdate) => {
      console.log('Subcategory created:', data);
      setLastUpdate(data);
      onUpdate?.(data);
    });

    // Listen for categories updates
    newSocket.on('categories-updated', (data: CategoryUpdate) => {
      console.log('Categories updated:', data);
      setLastUpdate(data);
      onUpdate?.(data);
    });

    newSocket.on('error', (error) => {
      console.error('Category updates error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [onUpdate]);

  const broadcastUpdate = useCallback((message: string, data?: any) => {
    if (socket?.connected) {
      socket.emit('category-update', { message, data });
    }
  }, [socket]);

  return {
    isConnected,
    lastUpdate,
    broadcastUpdate,
    socket,
  };
};
