'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Settings, Save, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'System settings updated successfully!');
        fetchSettings();
      } else {
        alert(data.error || 'Failed to save settings');
      }
    } catch (err) {
      alert('Settings save execution failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-slate-800 rounded-xl"></div>
          <div className="h-48 bg-slate-900 rounded-3xl"></div>
        </div>
      </AdminLayout>
    );
  }

  const toggleFeature = (key: string) => {
    setSettings((prev: any) => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [key]: !prev.featureFlags?.[key],
      },
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">System Configuration</span>
          <h1 className="text-2xl font-black text-white">Platform Settings & Feature Flags</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Operational Rules */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Financial & Operational Controls</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Platform Commission (%)</label>
                <input
                  type="number"
                  value={settings.platformCommissionPercent}
                  onChange={(e) => setSettings({ ...settings, platformCommissionPercent: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Default Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={settings.defaultDeliveryFee}
                  onChange={(e) => setSettings({ ...settings, defaultDeliveryFee: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  value={settings.minimumOrderAmount}
                  onChange={(e) => setSettings({ ...settings, minimumOrderAmount: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Max Delivery Radius (km)</label>
                <input
                  type="number"
                  value={settings.maxDeliveryRadiusKm}
                  onChange={(e) => setSettings({ ...settings, maxDeliveryRadiusKm: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                />
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">System Feature Flags</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(settings.featureFlags || {}).map(([flag, isEnabled]: [string, any]) => (
                <div key={flag} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{flag}</span>
                  <button
                    type="button"
                    onClick={() => toggleFeature(flag)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition border ${
                      isEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving System Configuration...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
