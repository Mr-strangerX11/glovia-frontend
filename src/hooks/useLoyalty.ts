import { useEffect, useState } from 'react';
import { loyaltyAPI } from '@/lib/api';

export function useLoyalty(userId: string) {
  const [points, setPoints] = useState(0);
  useEffect(() => {
    async function fetchLoyalty() {
      try {
        const res = userId ? await loyaltyAPI.getByUserId(userId) : await loyaltyAPI.getMine();
        setPoints(Number(res.data?.points || 0));
      } catch {
        setPoints(0);
      }
    }
    fetchLoyalty();
  }, [userId]);
  return { points };
}
