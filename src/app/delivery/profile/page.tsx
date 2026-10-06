'use client';

import React, { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import { Bike, Save, ShieldCheck, CreditCard } from 'lucide-react';

export default function DeliveryProfilePage() {
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    vehicleType: 'SCOOTER',
    vehicleNumber: '',
    licenseNumber: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    upiId: '',
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery/profile');
      const data = await res.json();
      if (data.partner) {
        setPartner(data.partner);
        setForm({
          vehicleType: data.partner.vehicleType || 'SCOOTER',
          vehicleNumber: data.partner.vehicleNumber || '',
          licenseNumber: data.partner.licenseNumber || '',
          bankAccountNumber: data.partner.bankAccountNumber || '',
          bankIfscCode: data.partner.bankIfscCode || '',
          upiId: data.partner.upiId || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/delivery/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Delivery partner profile updated!');
        fetchProfile();
      } else {
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setMessage('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DeliveryLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-slate-400">Loading rider profile...</div>
      </DeliveryLayout>
    );
  }

  return (
    <DeliveryLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bike className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Fleet Settings</span>
            </div>
            <h1 className="text-2xl font-black text-white">Rider Profile & Vehicle</h1>
            <p className="text-xs text-slate-400">Manage vehicle details, payout accounts & settings</p>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Vehicle Details</h2>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Vehicle Type</label>
              <select
                name="vehicleType"
                value={form.vehicleType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="SCOOTER">Scooter / Moped</option>
                <option value="BIKE">Motorcycle / Bike</option>
                <option value="EV">Electric Vehicle (EV)</option>
                <option value="BICYCLE">Bicycle</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Vehicle Registration Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Driving License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Bank & Payout Information
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Bank Account Number</label>
              <input
                type="text"
                name="bankAccountNumber"
                value={form.bankAccountNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">IFSC Code</label>
                <input
                  type="text"
                  name="bankIfscCode"
                  value={form.bankIfscCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">UPI ID</label>
                <input
                  type="text"
                  name="upiId"
                  value={form.upiId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </DeliveryLayout>
  );
}
