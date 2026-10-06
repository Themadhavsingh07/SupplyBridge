'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import Link from 'next/link';
import { Tag, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function SupplierOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/supplier/offers');
      const data = await res.json();
      if (data.offers) {
        setOffers(data.offers);
      }
    } catch (err) {
      console.error('Failed to load supplier offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/supplier/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      if (res.ok) {
        fetchOffers();
      }
    } catch (err) {
      console.error('Failed to toggle offer state:', err);
    }
  };

  return (
    <SupplierLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Promotional Offers</span>
            </div>
            <h1 className="text-2xl font-black text-white">Store Coupons & Discounts</h1>
            <p className="text-xs text-slate-400">Manage supplier-scoped percentage, fixed value & free delivery coupons</p>
          </div>

          <Link
            href="/supplier/offers/new"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coupon</span>
          </Link>
        </div>

        {/* Offers Grid */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading coupons...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Tag className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No active coupons created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <div key={offer.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono font-black text-xs rounded-xl">
                      {offer.code}
                    </span>
                    <button
                      onClick={() => handleToggleActive(offer.id, offer.isActive)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition ${
                        offer.isActive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {offer.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">{offer.description}</p>

                  <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                    <div>Value: <strong className="text-white">{offer.type === 'PERCENTAGE' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}</strong></div>
                    <div>Min Order: <strong className="text-white">₹{Number(offer.minOrderAmount || 0)}</strong></div>
                    <div>Valid: <strong className="text-white">{new Date(offer.startDate).toLocaleDateString('en-IN')} - {new Date(offer.endDate).toLocaleDateString('en-IN')}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SupplierLayout>
  );
}
