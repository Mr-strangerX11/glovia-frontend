'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import { MapPin, Plus, Edit2, Trash2, Loader2, X, CheckCircle2, Star, Home, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { provinces, getDistrictsForProvince, getMunicipalitiesForDistrict, getWardNumbers } from '@/data/nepalLocations';
import { AddressDisplay } from '@/components/AddressDisplay';

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

const EMPTY_FORM = {
  fullName: '', phone: '', province: 'Bagmati Province', district: 'Kathmandu',
  municipality: '', wardNo: 1, area: '', landmark: '', isDefault: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const getAddressId = (address: Address) => address.id || address._id || '';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login?redirect=/account/addresses');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => { if (isAuthenticated) fetchAddresses(); }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const { data } = await userAPI.getAddresses();
      setAddresses(data);
    } catch { toast.error('Failed to load addresses'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await userAPI.updateAddress(editingId, formData);
        toast.success('Address updated!');
      } else {
        await userAPI.createAddress(formData);
        toast.success('Address added!');
      }
      resetForm();
      fetchAddresses();
    } catch { toast.error('Failed to save address'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (address: Address) => {
    const id = getAddressId(address);
    if (!id) { toast.error('Invalid address'); return; }
    if (!confirm('Delete this address?')) return;
    setDeletingId(id);
    try {
      await userAPI.deleteAddress(id);
      toast.success('Address deleted');
      fetchAddresses();
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      fullName: address.fullName, phone: address.phone, province: address.province,
      district: address.district, municipality: address.municipality,
      wardNo: address.wardNo, area: address.area, landmark: address.landmark || '',
      isDefault: address.isDefault,
    });
    setEditingId(getAddressId(address));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setFormData({ ...EMPTY_FORM }); setEditingId(null); setShowForm(false); };

  const Field = ({ label, children, required, helperText }: { label: string; children: React.ReactNode; required?: boolean; helperText?: string }) => (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 pt-12 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl pointer-events-none" />
        <div className="container relative z-10">
          <div className="flex items-end justify-between gap-4">
            <div className="text-white">
              <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-2">My Account</p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
                <MapPin className="w-8 h-8" />
                Saved Addresses
              </h1>
              <p className="text-violet-200 mt-2 text-sm">
                {addresses.length > 0 ? `${addresses.length} address${addresses.length > 1 ? 'es' : ''} saved` : 'No addresses yet'}
              </p>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-white/30 backdrop-blur-sm flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl -mt-14 pb-20 space-y-6">

        {/* Add/Edit Form */}
        {showForm ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                  {editingId ? <Edit2 className="w-4 h-4 text-violet-600" /> : <Plus className="w-4 h-4 text-violet-600" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
                  <p className="text-xs text-gray-400">Fill in the delivery details</p>
                </div>
              </div>
              <button onClick={resetForm} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" required helperText="Recipient's name">
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition" placeholder="e.g. Ram Sharma" required />
                </Field>
                <Field label="Phone Number" required helperText="10-digit mobile number">
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition" placeholder="e.g. 9841234567" required />
                </Field>

                <Field label="Province" required helperText="Select your province">
                  <select value={formData.province}
                    onChange={(e) => {
                      const d = getDistrictsForProvince(e.target.value);
                      setFormData({ ...formData, province: e.target.value, district: d[0] || '', municipality: '' });
                    }} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition appearance-none bg-white cursor-pointer" required>
                    <option value="">Select province</option>
                    {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>

                <Field label="District" required helperText="Select your district">
                  <select value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value, municipality: '' })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition appearance-none bg-white cursor-pointer" required>
                    <option value="">Select district</option>
                    {getDistrictsForProvince(formData.province).map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>

                <Field label="Municipality" required helperText="Select your municipality or city">
                  <select value={formData.municipality} onChange={(e) => setFormData({ ...formData, municipality: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition appearance-none bg-white cursor-pointer" required>
                    <option value="">Select municipality</option>
                    {getMunicipalitiesForDistrict(formData.district).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>

                <Field label="Ward No." required helperText="Select your ward number">
                  <select value={formData.wardNo} onChange={(e) => setFormData({ ...formData, wardNo: parseInt(e.target.value) })} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition appearance-none bg-white cursor-pointer" required>
                    {getWardNumbers().map((w) => <option key={w} value={w}>Ward {w}</option>)}
                  </select>
                </Field>

                <Field label="Area / Tole" required helperText="Neighborhood or locality name">
                  <input type="text" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition" placeholder="e.g. Baneshwor, Koteshwor" required />
                </Field>

                <Field label="Landmark (Optional)" helperText="Shop name, gate color, etc.">
                  <input type="text" value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition" placeholder="e.g. Near the blue gate" />
                </Field>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                  className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${formData.isDefault ? 'bg-violet-500' : 'bg-gray-200'}`}
                  style={{ height: 22 }}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform`}
                    style={{ width: 18, height: 18, transform: formData.isDefault ? 'translateX(18px)' : 'translateX(0)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Set as default address</p>
                  <p className="text-xs text-gray-400">This address will be pre-selected at checkout</p>
                </div>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-violet-200 bg-white text-violet-600 font-semibold text-sm hover:bg-violet-50 hover:border-violet-300 transition-all group"
          >
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            Add New Address
          </button>
        )}

        {/* Address Cards */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-center py-16">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400">Loading addresses…</p>
            </div>
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 px-8">
            <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <MapPin className="w-10 h-10 text-violet-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No addresses saved</h3>
            <p className="text-sm text-gray-400 mb-6">Add your first delivery address to speed up checkout.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((address) => {
              const id = getAddressId(address);
              const isDeleting = deletingId === id;
              return (
                <div
                  key={id || address.fullName}
                  className={`relative bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
                    address.isDefault ? 'border-violet-200 ring-1 ring-violet-100' : 'border-gray-100'
                  }`}
                >
                  {address.isDefault && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-violet-100 text-violet-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-violet-500 text-violet-500" /> Default
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${address.isDefault ? 'bg-violet-100' : 'bg-gray-100'}`}>
                        <Home className={`w-5 h-5 ${address.isDefault ? 'text-violet-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">{address.fullName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{address.phone}</p>
                      </div>
                    </div>

                    <AddressDisplay 
                      address={address} 
                      showPhone={false}
                      className="text-sm text-gray-600 space-y-1 mb-4"
                    />

                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => handleEdit(address)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(address)}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
