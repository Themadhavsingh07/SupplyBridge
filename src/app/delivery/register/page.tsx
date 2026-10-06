'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, ShieldCheck, UploadCloud, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function DeliveryRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'SCOOTER',
    vehicleNumber: 'DL-01-AB-1234',
    licenseNumber: 'DL-9876543210',
    bankAccountNumber: '918273645012',
    bankIfscCode: 'HDFC0001234',
    upiId: 'rider@upi',
    govtIdUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    licenseDocUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    rcDocUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep((prev) => prev + 1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/delivery/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit registration');
      }

      router.push('/delivery/verification');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Bike className="w-4 h-4" />
            <span>SupplyCourier Fleet Onboarding</span>
          </div>
          <h1 className="text-3xl font-black">Register as Delivery Partner</h1>
          <p className="text-xs text-slate-400">Step {step} of 4 — Complete your rider verification</p>
        </div>

        {/* Step Bar */}
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition ${
                step >= i ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white">1. Personal Information</h2>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
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
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="rider@supplybridge.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white">2. Vehicle Information</h2>
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
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Vehicle Registration Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  placeholder="e.g. DL-01-AB-1234"
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
                  placeholder="License Number"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white">3. Payout & Bank Information</h2>
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
                  <label className="block text-xs font-bold text-slate-400 mb-1">UPI ID (Optional)</label>
                  <input
                    type="text"
                    name="upiId"
                    value={form.upiId}
                    onChange={handleChange}
                    placeholder="rider@upi"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-black text-white">Review & Submit Onboarding</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Documents will be verified by the SupplyBridge fleet admin team before live order assignments.
              </p>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-1">
                <p><strong className="text-white">Rider:</strong> {form.name}</p>
                <p><strong className="text-white">Vehicle:</strong> {form.vehicleType} ({form.vehicleNumber})</p>
                <p><strong className="text-white">License:</strong> {form.licenseNumber}</p>
                <p><strong className="text-white">Bank Account:</strong> ****{form.bankAccountNumber.slice(-4)}</p>
              </div>
            </div>
          )}

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
              <span>{step === 4 ? (loading ? 'Submitting Application...' : 'Submit Application') : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
