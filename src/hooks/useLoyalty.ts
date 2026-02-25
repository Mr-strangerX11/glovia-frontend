import axios from 'axios';
import { useEffect, useState } from 'react';

export function useLoyalty(userId: string) {
  const [points, setPoints] = useState(0);
  useEffect(() => {
    async function fetchLoyalty() {
      const res = await axios.get(`/api/loyalty/${userId}`);
      setPoints(res.data.points);
    }
    if (userId) fetchLoyalty();
  }, [userId]);
  return { points };
}
