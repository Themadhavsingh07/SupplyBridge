'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Star, ShieldAlert } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (reviewId: string, action: 'HIDE' | 'RESTORE') => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action }),
      });
      if (res.ok) fetchReviews();
    } catch (err) {
      alert('Moderation failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Ratings & Quality Control</span>
          <h1 className="text-2xl font-black text-white">Review Moderation Center</h1>
        </div>

        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Comment</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">Loading customer reviews...</td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">No reviews found.</td>
                  </tr>
                ) : (
                  reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6 font-bold text-white">{r.customer?.name}</td>
                      <td className="py-4 px-6 font-bold text-amber-400">⭐ {r.rating} / 5</td>
                      <td className="py-4 px-6 text-slate-300 max-w-md">{r.comment || 'No comment provided.'}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleModerate(r.id, 'HIDE')}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-xs hover:bg-rose-500/25 transition"
                        >
                          Hide Abusive Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
