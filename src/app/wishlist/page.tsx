'use client';

import React from 'react';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> My Saved Wishlist
        </h1>

        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
          <Heart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">Your wishlist is currently empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Save your favorite fresh products and direct supplier listings to easily reorder them anytime.
          </p>
          <Link
            href="/home"
            className="inline-block mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-2xl transition shadow-lg shadow-emerald-500/20"
          >
            Explore Marketplace
          </Link>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
