'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import SupplierVerificationBadge from '@/components/supplier/SupplierVerificationBadge';
import { Store, MapPin, Clock, Save, ShieldCheck, Phone, Mail } from 'lucide-react';

export default function SupplierProfilePage() {
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    storeName: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    serviceRadiusKm: 5,
    openingTime: '08:00',
    closingTime: '22:00',
    isOpen: true,
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/supplier/profile');
      const data = await res.json();
      if (data.supplier) {
        setSupplier(data.supplier);
        setForm({
          storeName: data.supplier.storeName || '',
          description: data.supplier.description || '',
          phone: data.supplier.phone || '',
          email: data.supplier.email || '',
          address: data.supplier.address || '',
          city: data.supplier.city || '',
          state: data.supplier.state || '',
          postalCode: data.supplier.postalCode || '',
          serviceRadiusKm: Number(data.supplier.serviceRadiusKm) || 5,
          openingTime: data.supplier.openingTime || '08:00',
          closingTime: data.supplier.closingTime || '22:00',
          isOpen: data.supplier.isOpen ?? true,
        });
      }
    } catch (err) {
      console.error('Failed to load supplier profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/supplier/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Store profile updated successfully!');
        fetchProfile();
      } else {
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SupplierLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-slate-400">Loading store profile...</div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Merchant Profile</span>
            </div>
            <h1 className="text-2xl font-black text-white">Business Settings & Info</h1>
            <p className="text-xs text-slate-400">Store location, operational hours & customer presentation</p>
          </div>

          <SupplierVerificationBadge status={supplier?.verificationStatus || 'PENDING'} size="lg" />
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            {message}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          {/* Protected Fields Notice */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Protected Compliance Credentials
            </span>
            <div className="text-xs text-slate-300 flex flex-wrap gap-4 pt-1">
              <span>Status: <strong className="text-white">{supplier?.verificationStatus}</strong></span>
              <span>GSTIN: <strong className="text-white">{supplier?.gstNumber || 'N/A'}</strong></span>
              <span>PAN: <strong className="text-white">{supplier?.panNumber || 'N/A'}</strong></span>
            </div>
          </div>

          {/* Editable Business Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">General Store Info</h2>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Store Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Business Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Business Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Street Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Service Radius (km)</label>
                <input
                  type="number"
                  name="serviceRadiusKm"
                  value={form.serviceRadiusKm}
                  onChange={handleChange}
                  required
                  min={1}
                  max={50}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Opening Time</label>
                <input
                  type="time"
                  name="openingTime"
                  value={form.openingTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Closing Time</label>
                <input
                  type="time"
                  name="closingTime"
                  value={form.closingTime}
                  onChange={handleChange}
                  required
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
    </SupplierLayout>
  );
}
