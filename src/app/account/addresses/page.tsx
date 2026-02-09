'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import { MapPin, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Address {
  id?: string;
  _id?: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  municipality: string;
  wardNo: number;
  area: string;
  landmark?: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    province: 'Province 3',
    district: 'Kathmandu',
    municipality: '',
    wardNo: 1,
    area: '',
    landmark: '',
    isDefault: false,
  });

  const getAddressId = (address: Address) => address.id || address._id || '';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/addresses');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const { data } = await userAPI.getAddresses();
      setAddresses(data);
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await userAPI.updateAddress(editingId, formData);
        toast.success('Address updated successfully');
      } else {
        await userAPI.createAddress(formData);
        toast.success('Address added successfully');
      }
      resetForm();
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleDelete = async (address: Address) => {
    const id = getAddressId(address);
    if (!id) {
      toast.error('Invalid address ID');
      return;
    }
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await userAPI.deleteAddress(id);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      municipality: address.municipality,
      wardNo: address.wardNo,
      area: address.area,
      landmark: address.landmark || '',
      isDefault: address.isDefault,
    });
    setEditingId(getAddressId(address));
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      province: 'Province 3',
      district: 'Kathmandu',
      municipality: '',
      wardNo: 1,
      area: '',
      landmark: '',
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">My Addresses</h1>
            <p className="text-gray-600">Manage your delivery addresses</p>
          </div>
          <Link href="/account" className="btn-outline">
            Back to Account
          </Link>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mb-6 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </button>
        )}

        {showForm && (
          <div className="card mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Province *</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">District *</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Municipality *</label>
                  <input
                    type="text"
                    value={formData.municipality}
                    onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Ward No *</label>
                  <input
                    type="number"
                    value={formData.wardNo}
                    onChange={(e) => setFormData({ ...formData, wardNo: parseInt(e.target.value) })}
                    className="input"
                    min="1"
                    max="35"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Area/Tole *</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isDefault" className="text-sm">
                  Set as default address
                </label>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={resetForm} className="btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 card">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No addresses yet</h3>
            <p className="text-gray-600">Add your first delivery address</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={getAddressId(address) || address.fullName} className="card relative">
                {address.isDefault && (
                  <span className="absolute top-4 right-4 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
                <div className="mb-4">
                  <p className="font-semibold text-lg">{address.fullName}</p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                </div>
                <div className="text-sm text-gray-700 space-y-1 mb-4">
                  <p>{address.area}, Ward {address.wardNo}</p>
                  <p>{address.municipality}</p>
                  <p>{address.district}, {address.province}</p>
                  {address.landmark && <p className="text-gray-500">Landmark: {address.landmark}</p>}
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(address)}
                    className="btn-outline text-sm flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address)}
                    className="btn-outline text-sm flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
