'use client';

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Gift, Award, Share2, Wallet, ArrowRight } from 'lucide-react';

export default function LoyaltyPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 space-y-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>SupplyBridge Rewards Tier: Silver Member</span>
          </div>
          <h1 className="text-3xl font-black text-white">Loyalty & Cashback</h1>
          <p className="text-xs text-slate-300">Earn 10 points for every ₹100 spent directly with local suppliers.</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shrink-0 text-center space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Loyalty Points</span>
          <div className="text-3xl font-black text-emerald-400">{user?.loyaltyPoints || 350}</div>
          <span className="text-[10px] text-slate-500">Value: ₹{(user?.loyaltyPoints || 350) / 10}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Referral Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Refer Friends & Earn ₹100</span>
          </div>
          <p className="text-xs text-slate-300">Share your unique referral code with friends. They get 50% OFF their first direct supplier order!</p>
          
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="font-mono font-bold text-sm text-emerald-400">{user?.referralCode || 'AARAV2026'}</span>
            <button
              onClick={() => navigator.clipboard.writeText(user?.referralCode || 'AARAV2026')}
              className="text-xs bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg"
            >
              Copy Code
            </button>
          </div>
        </div>

        {/* Cashback Balance */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Wallet className="w-4 h-4 text-teal-400" />
            <span>Cashback Wallet</span>
          </div>
          <div className="text-2xl font-black text-white">₹{user?.cashbackBalance || 120.0}</div>
          <p className="text-xs text-slate-400">Cashback can be applied directly at checkout on any order.</p>
        </div>

      </div>
    </div>
  );
}
