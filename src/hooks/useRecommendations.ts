import axios from 'axios';
import { useEffect, useState } from 'react';

export function useRecommendations(userId?: string, productId?: string) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await axios.get('/api/recommendations', {
          params: { userId, productId },
        });
        setRecommendations(res.data?.data || res.data || []);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecommendations();
  }, [userId, productId]);
  
  return { recommendations, loading };
}

