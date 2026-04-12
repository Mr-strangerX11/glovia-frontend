import { useEffect, useState } from 'react';
import api from '@/lib/api';

export function useWallet(userId: string) {
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    async function fetchWallet() {
      try {
        const res = await api.get(`/wallet/${userId}`);
        setBalance(Number(res.data?.balance || 0));
      } catch {
        setBalance(0);
      }
    }
    if (userId) fetchWallet();
  }, [userId]);
  return { balance };
}
