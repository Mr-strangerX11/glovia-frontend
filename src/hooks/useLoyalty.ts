import { useEffect, useState } from 'react';
import api from '@/lib/api';

export function useLoyalty(userId: string) {
  const [points, setPoints] = useState(0);
  useEffect(() => {
    async function fetchLoyalty() {
      try {
        const res = await api.get(`/loyalty/${userId}`);
        setPoints(Number(res.data?.points || 0));
      } catch {
        setPoints(0);
      }
    }
    if (userId) fetchLoyalty();
  }, [userId]);
  return { points };
}
