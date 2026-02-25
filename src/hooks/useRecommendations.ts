import axios from 'axios';
import { useEffect, useState } from 'react';

export function useRecommendations(userId?: string, productId?: string) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  useEffect(() => {
    async function fetchRecommendations() {
      const res = await axios.get('/api/recommendations', {
        params: { userId, productId },
      });
      setRecommendations(res.data);
    }
    fetchRecommendations();
  }, [userId, productId]);
  return { recommendations };
}
