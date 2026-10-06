'use client';

import React, { useState } from 'react';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';
import Link from 'next/link';
import { User, Mail, Phone, ShieldCheck, MapPin, Award, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || 'Aarav Sharma');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 md:pb-8">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
          <User className="w-6 h-6 text-emerald-400" /> Account & Profile
        </h1>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md mb-8">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{name}</h2>
              <p className="text-xs text-emerald-400 font-semibold uppercase">{user?.role || 'CUSTOMER'}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {saved && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                Profile changes saved!
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
              <div className="relative mt-1">
                <input
                  type="email"
                  disabled
                  value={user?.email || 'customer@supplybridge.com'}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 pl-10 text-sm text-slate-400 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Phone Number</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  disabled
                  value="+91 9876543212"
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 pl-10 text-sm text-slate-400 cursor-not-allowed"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Navigation Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/addresses"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-bold text-sm text-white">Delivery Addresses</h4>
                <p className="text-xs text-slate-400">Manage saved addresses</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
          </Link>

          <Link
            href="/loyalty"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="font-bold text-sm text-white">Loyalty & Rewards</h4>
                <p className="text-xs text-slate-400">View points balance</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
          </Link>
        </div>

        <button
          onClick={logout}
          className="w-full mt-8 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800/50 text-rose-400 font-bold text-xs py-3.5 rounded-2xl transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign Out of Account
        </button>
      </main>

      <MobileNav />
    </div>
  );
}
