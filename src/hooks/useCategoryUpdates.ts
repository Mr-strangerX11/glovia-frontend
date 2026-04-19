import { useEffect, useRef, useState, useCallback } from 'react';
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
  // Keep onUpdate in a ref so the effect never needs to re-run when the caller
  // passes a new function reference on every render.
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('subscribe-categories');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    const handleUpdate = (data: CategoryUpdate) => {
      setLastUpdate(data);
      onUpdateRef.current?.(data);
    };

    newSocket.on('category-updated',  handleUpdate);
    newSocket.on('subcategory-created', handleUpdate);
    newSocket.on('categories-updated', handleUpdate);

    newSocket.on('error', (error) => {
      console.error('Category updates error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []); // stable — no dependency on onUpdate

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
