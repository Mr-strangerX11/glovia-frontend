import { useLoyalty } from '@/hooks/useLoyalty';

export default function LoyaltyInfo({ userId }: { userId: string }) {
  const { points } = useLoyalty(userId);
  return (
    <div className="card p-4 mb-4">
      <h3 className="text-lg font-bold mb-2">Loyalty Points</h3>
      <div className="text-accent-600 font-bold text-2xl">{points} pts</div>
    </div>
  );
}
