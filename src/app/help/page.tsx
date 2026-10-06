'use client';

import React from 'react';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';
import Link from 'next/link';
import { HelpCircle, MessageSquare, AlertCircle, Phone, FileText } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How does SupplyBridge direct supplier communication work?',
      a: 'SupplyBridge connects you directly with verified local suppliers. Click "Contact Supplier" on any product or store page to start a live 1:1 chat thread.',
    },
    {
      q: 'What is the estimated delivery time for quick-commerce orders?',
      a: 'Most local farm-fresh and grocery orders are picked up directly from nearby suppliers and delivered in 15 to 30 minutes.',
    },
    {
      q: 'How do I track my active delivery rider in real time?',
      a: 'Navigate to My Orders and select "Track Live Delivery" to view real-time Mapbox GPS updates for your assigned rider.',
    },
    {
      q: 'How are suppliers verified on SupplyBridge?',
      a: 'All suppliers undergo strict verification by our Admin team checking official GST, PAN, FSSAI, and business license documentation.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
          <HelpCircle className="w-6 h-6 text-emerald-400" /> Help Center & Support
        </h1>

        {/* Quick Help Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/complaints"
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition flex items-center gap-4"
          >
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Raise a Complaint</h3>
              <p className="text-xs text-slate-400">Report damaged or missing items</p>
            </div>
          </Link>

          <Link
            href="/messages"
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition flex items-center gap-4"
          >
            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Chat History</h3>
              <p className="text-xs text-slate-400">View direct conversations</p>
            </div>
          </Link>
        </div>

        {/* FAQs */}
        <h2 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
              <h4 className="font-bold text-sm text-white mb-1.5">{f.q}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
