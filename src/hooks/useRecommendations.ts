import api from '@/lib/api';
import { useEffect, useState } from 'react';

export function useRecommendations(userId?: string, productId?: string) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await api.get('/recommendations', {
          params: { userId, productId },
        });
        setRecommendations(res.data?.data || res.data || []);
      } catch {
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId, productId]);

  return { recommendations, loading, isLoading: loading };
}

