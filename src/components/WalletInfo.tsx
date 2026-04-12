import { useWallet } from '@/hooks/useWallet';

export default function WalletInfo({ userId }: { userId: string }) {
  const { balance } = useWallet(userId);
  return (
    <div className="card p-4 mb-4">
      <h3 className="text-lg font-bold mb-2">Wallet Balance</h3>
      <div className="text-primary-600 font-bold text-2xl">₨{balance}</div>
    </div>
  );
}
