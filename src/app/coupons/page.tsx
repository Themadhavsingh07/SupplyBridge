'use client';

import React, { useState } from 'react';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';
import { Tag, Copy, Check } from 'lucide-react';

export default function CouponsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons = [
    {
      code: 'WELCOME50',
      title: '50% OFF First Direct Order',
      description: 'Get 50% discount on your initial purchase from verified local suppliers (max discount ₹100).',
      minOrder: '₹199',
      validUntil: '30 Dec 2026',
    },
    {
      code: 'DIRECTFLAT75',
      title: 'Flat ₹75 Discount',
      description: 'Flat ₹75 off on all orders above ₹499 across all supplier categories.',
      minOrder: '₹499',
      validUntil: '15 Nov 2026',
    },
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
          <Tag className="w-6 h-6 text-emerald-400" /> Promotional Coupons & Offers
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="font-mono font-black text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-3 py-1 rounded-xl text-sm">
                    {c.code}
                  </span>
                  <button
                    onClick={() => handleCopy(c.code)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-emerald-400 transition"
                  >
                    {copiedCode === c.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <h3 className="font-bold text-base text-white">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{c.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Min Order: {c.minOrder}</span>
                <span>Expires: {c.validUntil}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
