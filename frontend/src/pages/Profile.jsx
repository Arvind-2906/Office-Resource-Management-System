import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { User, Mail, Phone, ShieldCheck, MapPin, Plus } from 'lucide-react';

export const Profile = () => {
  const { user, addAddress } = useAuth();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    isDefault: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await addAddress(addressData);
      setSuccess('New address saved successfully');
      setShowAddressForm(false);
      setAddressData({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA',
        isDefault: false
      });
    } catch (err) {
      setError(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details and delivery addresses
        </p>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {success}
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl uppercase shadow-md">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user?.email}
            </p>
            {user?.phone && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {user?.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Saved Addresses</h3>
          </div>
          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>

        {/* Address Form */}
        {showAddressForm && (
          <form
            onSubmit={handleAddressSubmit}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              New Shipping Address
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Street"
                  id="street"
                  value={addressData.street}
                  onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                  required
                />
              </div>
              <Input
                label="City"
                id="city"
                value={addressData.city}
                onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                required
              />
              <Input
                label="State"
                id="state"
                value={addressData.state}
                onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                required
              />
              <Input
                label="Postal Code"
                id="postalCode"
                value={addressData.postalCode}
                onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })}
                required
              />
              <Input
                label="Country"
                id="country"
                value={addressData.country}
                onChange={(e) => setAddressData({ ...addressData, country: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAddressForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={loading}>
                Save Address
              </Button>
            </div>
          </form>
        )}

        {user?.addresses && user.addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.addresses.map((addr, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs text-slate-600 relative"
              >
                {addr.isDefault && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
                <p className="font-bold text-slate-800">{addr.street}</p>
                <p>
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p>{addr.country}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No saved addresses on record. You can add one above or during checkout.
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
