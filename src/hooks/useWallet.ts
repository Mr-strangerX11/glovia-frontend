import axios from 'axios';
import { useEffect, useState } from 'react';

export function useWallet(userId: string) {
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    async function fetchWallet() {
      const res = await axios.get(`/api/wallet/${userId}`);
      setBalance(res.data.balance);
    }
    if (userId) fetchWallet();
  }, [userId]);
  return { balance };
}
