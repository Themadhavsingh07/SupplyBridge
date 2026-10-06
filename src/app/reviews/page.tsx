'use client';

import React, { useState } from 'react';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';
import { Star, ShieldCheck, ThumbsUp, MessageSquare } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews] = useState([
    {
      id: 'rev_1',
      supplierName: 'FreshDairy Direct Co.',
      productName: 'Full Cream Organic Cow Milk (1 Litre)',
      rating: 5,
      comment: 'Super fast delivery! Direct communication with Ramesh was very helpful.',
      replyFromSupplier: 'Thank you Aarav! Looking forward to serving you again.',
      date: '2026-10-04',
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" /> My Verified Reviews
        </h1>

        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No reviews submitted yet</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" /> Verified Purchase
                  </div>
                  <span className="text-xs text-slate-500">{r.date}</span>
                </div>

                <h3 className="font-bold text-base text-white">{r.productName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Supplier: {r.supplierName}</p>

                <div className="flex items-center gap-1 my-3 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                  ))}
                </div>

                <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800">{r.comment}</p>

                {r.replyFromSupplier && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300">
                    <span className="font-bold block mb-1">Supplier Response:</span>
                    {r.replyFromSupplier}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
