'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import {
  MapPin, Plus, Edit2, Trash2, Loader2, X,
  CheckCircle2, Star, Home, ArrowLeft, Navigation, Phone, User, Briefcase, Building2,
} from 'lucide-react';
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
  addressType?: 'home' | 'office' | 'other';
}

const EMPTY_FORM = {
  fullName: '', phone: '', province: 'Bagmati Province', district: 'Kathmandu',
  municipality: '', wardNo: 1, area: '', landmark: '', isDefault: false, addressType: 'home' as 'home' | 'office' | 'other',
};

const inputCls = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition bg-white placeholder-gray-300";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

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
      isDefault: address.isDefault, addressType: (address.addressType || 'home') as 'home' | 'office' | 'other',
    });
    setEditingId(getAddressId(address));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setFormData({ ...EMPTY_FORM }); setEditingId(null); setShowForm(false); };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-[3px] border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 py-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-36 -mt-36 blur-3xl pointer-events-none" />
        <div className="container relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="text-white">
              <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-300 inline-block" />
                My Account
              </p>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                Saved Addresses
              </h1>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-3 py-2 rounded-lg transition-all border border-white/20 backdrop-blur-sm flex-shrink-0 text-xs"
            >
              <ArrowLeft className="w-3 h-3" /> <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl pt-5 pb-24 space-y-5">

        {/* Add/Edit Form */}
        {showForm ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            {/* Form header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-50 via-purple-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                  {editingId ? <Edit2 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Fill in your delivery details</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Section: Contact */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Contact Details
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. Ram Sharma"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. 9841234567"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section: Address Type */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" /> Address Type
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'home', label: 'Home', icon: Home, description: 'Residential' },
                    { value: 'office', label: 'Office', icon: Building2, description: 'Work' },
                    { value: 'other', label: 'Other', icon: MapPin, description: 'Other' },
                  ].map(({ value, label, icon: Icon, description }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, addressType: value as any })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        formData.addressType === value
                          ? 'border-violet-500 bg-violet-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${formData.addressType === value ? 'text-violet-600' : 'text-gray-400'}`} />
                      <span className={`text-xs font-bold ${formData.addressType === value ? 'text-violet-700' : 'text-gray-700'}`}>
                        {label}
                      </span>
                      <span className={`text-[10px] ${formData.addressType === value ? 'text-violet-500' : 'text-gray-400'}`}>
                        {description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section: Location */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5" /> Location
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Province <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => {
                        const d = getDistrictsForProvince(e.target.value);
                        setFormData({ ...formData, province: e.target.value, district: d[0] || '', municipality: '' });
                      }}
                      className={selectCls}
                      required
                    >
                      <option value="">Select province</option>
                      {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      District <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value, municipality: '' })}
                      className={selectCls}
                      required
                    >
                      <option value="">Select district</option>
                      {getDistrictsForProvince(formData.province).map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Municipality <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.municipality}
                      onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                      className={selectCls}
                      required
                    >
                      <option value="">Select municipality</option>
                      {getMunicipalitiesForDistrict(formData.district).map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Ward No. <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.wardNo}
                      onChange={(e) => setFormData({ ...formData, wardNo: parseInt(e.target.value) })}
                      className={selectCls}
                      required
                    >
                      {getWardNumbers().map((w) => <option key={w} value={w}>Ward {w}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Address details */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Home className="w-3.5 h-3.5" /> Address Details
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Area / Tole <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. Baneshwor, Koteshwor"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Landmark <span className="text-gray-300 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. Near the blue gate"
                    />
                  </div>
                </div>
              </div>

              {/* Default toggle */}
              <div
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.isDefault
                    ? 'bg-violet-50 border-violet-200'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
              >
                <div className="flex items-center gap-3">
                  <Star className={`w-4 h-4 flex-shrink-0 ${formData.isDefault ? 'text-violet-500 fill-violet-500' : 'text-gray-300'}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Set as default address</p>
                    <p className="text-xs text-gray-400 mt-0.5">Pre-selected at checkout</p>
                  </div>
                </div>
                <div
                  className={`relative w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${formData.isDefault ? 'bg-violet-500' : 'bg-gray-200'}`}
                  style={{ height: 24 }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200"
                    style={{ width: 20, height: 20, transform: formData.isDefault ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-violet-200 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-violet-200 bg-white text-violet-600 font-semibold text-sm hover:bg-violet-50 hover:border-violet-300 transition-all group shadow-sm"
          >
            <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            Add New Address
          </button>
        )}

        {/* Address Cards */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-center py-20">
            <div className="text-center space-y-3">
              <div className="relative w-12 h-12 mx-auto">
                <div className="w-12 h-12 border-[3px] border-violet-100 border-t-violet-500 rounded-full animate-spin" />
                <MapPin className="w-4 h-4 text-violet-400 absolute inset-0 m-auto" />
              </div>
              <p className="text-sm text-gray-400 font-medium">Loading addresses…</p>
            </div>
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-24 px-8">
            <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <MapPin className="w-12 h-12 text-violet-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
              Add your delivery address to speed up checkout and track your orders.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-8 py-3.5 rounded-xl hover:from-violet-700 hover:to-purple-700 transition shadow-lg shadow-violet-200"
            >
              <Plus className="w-4 h-4" /> Add First Address
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
                  className={`relative bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                    address.isDefault ? 'border-violet-200 ring-1 ring-violet-100' : 'border-gray-100'
                  }`}
                >
                  {/* Top accent */}
                  <div className={`h-1 w-full ${address.isDefault ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-gray-100'}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {/* Address Type Icon */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                          address.isDefault
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                            : address.addressType === 'office'
                              ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                              : address.addressType === 'other'
                                ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                                : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                        }`}>
                          {address.addressType === 'office' ? (
                            <Building2 className="w-5 h-5 text-white" />
                          ) : address.addressType === 'other' ? (
                            <MapPin className="w-5 h-5 text-white" />
                          ) : (
                            <Home className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-sm">{address.fullName}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              address.addressType === 'office'
                                ? 'bg-blue-100 text-blue-600'
                                : address.addressType === 'other'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {address.addressType || 'home'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {address.phone}
                          </p>
                        </div>
                      </div>
                      {address.isDefault && (
                        <span className="flex items-center gap-1 bg-violet-100 text-violet-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                          <Star className="w-3 h-3 fill-violet-500 text-violet-500" /> Default
                        </span>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                      <AddressDisplay
                        address={address}
                        showPhone={false}
                        className="text-sm text-gray-600 space-y-0.5"
                      />
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(address)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100 transition-all hover:scale-105"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(address)}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-all hover:scale-105 disabled:opacity-50"
                      >
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
