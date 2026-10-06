'use client';

import React, { useState } from 'react';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';
import { MapPin, Plus, Check, Navigation, Trash2, Home, Briefcase } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

interface AddressItem {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { setLocation } = useAuth();
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: 'addr_1',
      label: 'Home',
      addressLine: 'Flat 402, Sunshine Heights, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      isDefault: true,
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newLine, setNewLine] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newState, setNewState] = useState('Karnataka');
  const [newZip, setNewZip] = useState('560001');

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLine.trim()) return;
    const newAddr: AddressItem = {
      id: `addr_${Date.now()}`,
      label: newLabel,
      addressLine: newLine,
      city: newCity,
      state: newState,
      postalCode: newZip,
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, newAddr]);
    setShowAddModal(false);
    setNewLine('');
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    const selected = addresses.find((a) => a.id === id);
    if (selected) {
      setLocation(`${selected.addressLine}, ${selected.city}`);
    }
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const mockAddress = `GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}), Bengaluru`;
          setLocation(mockAddress);
        },
        () => {
          alert('Could not retrieve exact location. Please select an address manually.');
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-400" /> Saved Delivery Addresses
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>

        {/* Current Location Quick Action */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Use Current GPS Location</h4>
              <p className="text-xs text-slate-400">Detect your exact location for instant nearby supplier matching</p>
            </div>
          </div>
          <button
            onClick={handleUseCurrentLocation}
            className="bg-slate-950 hover:bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            Detect
          </button>
        </div>

        {/* Address List */}
        <div className="space-y-4">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                a.isDefault
                  ? 'bg-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-500/5'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 shrink-0 mt-0.5">
                  {a.label === 'Work' ? <Briefcase className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{a.label}</span>
                    {a.isDefault && (
                      <span className="bg-emerald-500/20 text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-500/30">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{a.addressLine}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {a.city}, {a.state} - {a.postalCode}
                  </p>
                </div>
              </div>

              {!a.isDefault && (
                <button
                  onClick={() => handleSetDefault(a.id)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition shrink-0"
                >
                  Set Default
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Address Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">Add New Address</h3>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Label</label>
                  <select
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Address Line</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat/House No, Building, Street"
                    value={newLine}
                    onChange={(e) => setNewLine(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">City</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={newZip}
                      onChange={(e) => setNewZip(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
