'use client';

import React, { useState } from 'react';
import { RefreshCw, Calendar, Clock, Store, Plus, Check } from 'lucide-react';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 'sub-1',
      productName: 'Full Cream Organic Cow Milk (1 Litre)',
      supplierName: 'FreshDairy Direct Co.',
      frequency: 'DAILY',
      quantity: 2,
      status: 'ACTIVE',
      timeSlot: 'Morning (7 AM - 9 AM)',
      nextDelivery: 'Tomorrow, 7:00 AM',
      price: 68,
    },
    {
      id: 'sub-2',
      productName: 'Farm Fresh Organic Vegetables Basket',
      supplierName: 'Green Valley Organic Farms',
      frequency: 'WEEKLY',
      quantity: 1,
      status: 'ACTIVE',
      timeSlot: 'Morning (8 AM - 10 AM)',
      nextDelivery: 'Monday, 8:00 AM',
      price: 250,
    },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-emerald-400" />
            <span>Subscription Deliveries</span>
          </h1>
          <p className="text-xs text-slate-400">Automated recurring deliveries directly from your favorite local suppliers</p>
        </div>

        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition">
          <Plus className="w-4 h-4" />
          <span>New Subscription</span>
        </button>
      </div>

      <div className="grid gap-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{sub.productName}</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {sub.frequency}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                  {sub.supplierName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  {sub.timeSlot}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 justify-between sm:justify-end">
              <div>
                <span className="text-xs text-slate-400 block">Next Delivery</span>
                <span className="text-xs font-bold text-emerald-400">{sub.nextDelivery}</span>
              </div>

              <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-xs rounded-xl">
                {sub.status}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
