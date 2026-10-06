'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import { Star, MessageSquare, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SupplierReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch('/api/supplier/analytics');
        // Sample review response or query
        setReviews([
          {
            id: 'rev_1',
            customerName: 'Ananya Roy',
            rating: 5,
            comment: 'Extremely fresh A2 organic milk and quick 15-min delivery!',
            createdAt: '2026-10-04',
          },
          {
            id: 'rev_2',
            customerName: 'Rahul Verma',
            rating: 4,
            comment: 'Great quality vegetables, nicely packed.',
            createdAt: '2026-10-03',
          },
        ]);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  return (
    <SupplierLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Customer Feedback</span>
            </div>
            <h1 className="text-2xl font-black text-white">Store Ratings & Customer Reviews</h1>
            <p className="text-xs text-slate-400">Verified buyer ratings, feedback & response tools</p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-center space-y-1">
            <div className="text-4xl font-black text-amber-400">4.8 ★</div>
            <span className="text-xs text-slate-400 block font-bold">Average Merchant Rating</span>
          </div>

          <div className="md:col-span-3 glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-around gap-4">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-slate-400">{stars} ★</span>
                <div className="w-16 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: stars === 5 ? '85%' : stars === 4 ? '12%' : '3%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Cards */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <h2 className="font-bold text-base text-white">Verified Customer Reviews</h2>

          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading feedback...</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{rev.customerName}</span>
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">{rev.comment}</p>
                  <span className="text-[10px] text-slate-500 block font-mono">{rev.createdAt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SupplierLayout>
  );
}
