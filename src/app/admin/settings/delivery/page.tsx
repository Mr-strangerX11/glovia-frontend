'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { adminAPI } from '@/lib/api';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function DeliverySettingsPage() {
  const router = useRouter();
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    freeDeliveryThreshold: 2999,
    valleyDeliveryCharge: 99,
    outsideValleyDeliveryCharge: 149,
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const { data } = await adminAPI.getDeliverySettings();
      setFormData({
        freeDeliveryThreshold: data.freeDeliveryThreshold || 2999,
        valleyDeliveryCharge: data.valleyDeliveryCharge || 99,
        outsideValleyDeliveryCharge: data.outsideValleyDeliveryCharge || 149,
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load delivery settings');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminAPI.updateDeliverySettings(formData);
      toast.success('Delivery settings updated successfully');
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Delivery & Discount Settings</h1>
            <p className="text-gray-600">Manage delivery charges and free delivery thresholds</p>
            
            {/* Settings Navigation */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium"
                disabled
              >
                Delivery Settings
              </button>
              <Link
                href="/admin/settings/announcement"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Announcement Bar
              </Link>
            </div>
          </div>

          {/* Info Box */}
          <div className="card p-4 mb-6 bg-blue-50 border border-blue-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">How it works:</p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Orders above the <strong>Free Delivery Threshold</strong> receive free delivery</li>
                  <li>• Orders below the threshold are charged the applicable delivery charge</li>
                  <li>• <strong>Valley areas</strong> (Kathmandu, Lalitpur, Bhaktapur) use Valley charge</li>
                  <li>• <strong>Other areas</strong> use the Outside Valley charge</li>
                  <li>• Admin can manually override discount and delivery charges on individual orders</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-6">
            {/* Free Delivery Threshold */}
            <div>
              <label className="label">Free Delivery Threshold (NPR) *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.freeDeliveryThreshold}
                  onChange={(e) => handleChange('freeDeliveryThreshold', parseFloat(e.target.value))}
                  className="input"
                  min="0"
                  step="1"
                  required
                />
                <span className="text-sm text-gray-500">Orders above this amount get free delivery</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Example: If set to 2,000 NPR, any order totaling 2,000 NPR or more will have free delivery
              </p>
            </div>

            {/* Valley Delivery Charge */}
            <div>
              <label className="label">Valley Delivery Charge (NPR) *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.valleyDeliveryCharge}
                  onChange={(e) => handleChange('valleyDeliveryCharge', parseFloat(e.target.value))}
                  className="input"
                  min="0"
                  step="1"
                  required
                />
                <span className="text-sm text-gray-500">For Kathmandu Valley areas</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Applies to: Kathmandu, Lalitpur, Bhaktapur
              </p>
            </div>

            {/* Outside Valley Delivery Charge */}
            <div>
              <label className="label">Outside Valley Delivery Charge (NPR) *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.outsideValleyDeliveryCharge}
                  onChange={(e) => handleChange('outsideValleyDeliveryCharge', parseFloat(e.target.value))}
                  className="input"
                  min="0"
                  step="1"
                  required
                />
                <span className="text-sm text-gray-500">For areas outside Kathmandu Valley</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Applies to all other districts and regions
              </p>
            </div>

            {/* Current Settings Preview */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-sm mb-3">Current Settings Preview:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Free Delivery on orders above:</span>
                  <span className="font-semibold">NPR {formData.freeDeliveryThreshold.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valley delivery charge:</span>
                  <span className="font-semibold">NPR {formData.valleyDeliveryCharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Outside valley delivery charge:</span>
                  <span className="font-semibold">NPR {formData.outsideValleyDeliveryCharge.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
              <Link href="/admin/orders" className="btn-outline">
                Back to Orders
              </Link>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-6 space-y-4">
            <div className="card p-4">
              <h3 className="font-semibold text-sm mb-2">💡 Admin Discount & Charges Override</h3>
              <p className="text-sm text-gray-600">
                When managing individual orders, admins can manually apply discounts or adjust delivery charges for specific customer needs or special promotions. This overrides the automatic calculation.
              </p>
            </div>

            <div className="card p-4">
              <h3 className="font-semibold text-sm mb-2">🎯 Best Practices</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Set free delivery threshold competitively to encourage larger orders</li>
                <li>• Consider regional logistics costs when setting valley vs outside charges</li>
                <li>• Monitor order patterns to optimize delivery profitability</li>
                <li>• Use admin override for VIP customers or promotional orders</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
