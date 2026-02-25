import { useRecommendations } from '@/hooks/useRecommendations';

export default function Recommendations({ userId, productId }: { userId?: string; productId?: string }) {
  const { recommendations } = useRecommendations(userId, productId);
  if (!recommendations.length) return null;
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <div key={product.id} className="card p-4">
            <div className="mb-2 font-semibold">{product.name}</div>
            <div className="text-primary-600 font-bold">₨{product.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
