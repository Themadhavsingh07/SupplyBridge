'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  Building,
  MapPin,
  FileCheck,
  UploadCloud,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function SupplierRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Business Info
    storeName: '',
    ownerName: '',
    description: '',
    phone: '',
    email: '',

    // Step 2: Address
    address: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110001',
    latitude: 28.6139,
    longitude: 77.209,
    serviceRadiusKm: 5,

    // Step 3: Verification Info
    gstNumber: '07AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    businessLicense: 'LIC-2026-987654',

    // Step 4: Documents (Sample Supabase Storage URLs)
    gstDocUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    panDocUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    licenseDocUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    idProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    bankProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',

    // Step 5: Store Info
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    coverImageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
    openingTime: '08:00',
    closingTime: '22:00',
    categoryIds: ['clx001catgrocery'],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 6) {
      setStep((prev) => prev + 1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/supplier/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit business registration');
      }

      router.push('/supplier/verification');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Store className="w-4 h-4" />
            <span>SupplyBridge Merchant Onboarding</span>
          </div>
          <h1 className="text-3xl font-black">Register Your Store</h1>
          <p className="text-xs text-slate-400">Step {step} of 6 — Complete your business verification</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition ${
                  step === i
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                    : step > i
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}
              >
                {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form Box */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <Building className="w-5 h-5 text-emerald-400" /> Business Information
              </h2>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Store / Business Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="e.g. Green Valley Organic Store"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Owner Name</label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Full Legal Name"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Store Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe products sold, fresh quality guarantees..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Business Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@store.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <MapPin className="w-5 h-5 text-emerald-400" /> Store Address & Service Radius
              </h2>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Shop No. 12, Main Market Road"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
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
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
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
                    value={formData.serviceRadiusKm}
                    onChange={handleChange}
                    min={1}
                    max={50}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <FileCheck className="w-5 h-5 text-emerald-400" /> Business Tax & Verification Details
              </h2>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Business License / FSSAI Number</label>
                <input
                  type="text"
                  name="businessLicense"
                  value={formData.businessLicense}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <UploadCloud className="w-5 h-5 text-emerald-400" /> Upload Verification Documents
              </h2>
              <p className="text-xs text-slate-400">
                Provide valid proof documents (JPEG, PNG or PDF). Private documents are securely encrypted in Supabase Storage.
              </p>
              <div className="space-y-3">
                {['GST Document', 'PAN Document', 'Business License', 'ID Proof', 'Bank Cancelled Cheque'].map((doc, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-white block">{doc}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Document attached ✓</span>
                    </div>
                    <button type="button" className="px-3 py-1.5 bg-slate-800 text-xs font-bold text-white rounded-xl hover:bg-slate-700">
                      Change File
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-emerald-400" /> Store Branding & Operational Hours
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Opening Time</label>
                  <input
                    type="time"
                    name="openingTime"
                    value={formData.openingTime}
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
                    value={formData.closingTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4 text-center">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-black text-white">Review & Submit Application</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                By submitting, your business information and tax details will be reviewed by admin verification before going active on the marketplace.
              </p>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-1">
                <p><strong className="text-white">Store:</strong> {formData.storeName}</p>
                <p><strong className="text-white">Owner:</strong> {formData.ownerName}</p>
                <p><strong className="text-white">GSTIN:</strong> {formData.gstNumber}</p>
                <p><strong className="text-white">Hours:</strong> {formData.openingTime} - {formData.closingTime}</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
            >
              <span>{step === 6 ? (loading ? 'Submitting Application...' : 'Submit Application') : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
