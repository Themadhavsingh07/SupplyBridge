'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Star, ShieldCheck, Clock, Navigation, MessageSquare, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { SupplierComparisonItem } from '@/types';
import { useAuth } from '../providers/AuthProvider';

interface Props {
  productName: string;
  productImage: string;
  suppliers: SupplierComparisonItem[];
  onClose: () => void;
  onAddToCart: (supplierProductId: string) => void;
}

export default function SupplierComparisonModal({
  productName,
  productImage,
  suppliers,
  onClose,
  onAddToCart,
}: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const handleContactSupplier = async (supplierId: string, supplierName: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          initialMessage: `Hi ${supplierName}! I am inquiring about "${productName}". Is this currently in stock for immediate delivery?`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      }
    } catch (error) {
      console.error('Failed to initiate conversation:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl glass-panel rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 p-1 border border-slate-700 overflow-hidden shrink-0">
              <img src={productImage} alt={productName} className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Multi-Supplier Comparison</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {suppliers.length} Verified Stores
                </span>
              </div>
              <h3 className="text-base font-bold text-white truncate max-w-md">{productName}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table / Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Choose your preferred local supplier based on Price, Distance, Rating or Stock</span>
            <span className="text-emerald-400 font-semibold">Direct Customer-Supplier Contact Active</span>
          </div>

          <div className="grid gap-3">
            {suppliers.map((sup, idx) => (
              <div
                key={sup.supplierProductId}
                className={`p-4 rounded-xl border transition-all ${
                  idx === 0
                    ? 'bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Supplier Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{sup.supplierName}</h4>
                      {sup.verificationStatus === 'VERIFIED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Verified Supplier
                        </span>
                      )}
                      {idx === 0 && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                          Best Price
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{sup.rating.toFixed(1)}</span>
                        <span className="text-slate-500">({sup.totalRatingsCount})</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-300">
                        <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{sup.distanceKm} km away</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>~{sup.estimatedDeliveryMinutes} min delivery</span>
                      </div>

                      <div className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{sup.stock} units in stock</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-white">₹{sup.finalPrice}</span>
                        {sup.discountPercent > 0 && (
                          <span className="text-xs text-slate-500 line-through">₹{sup.price}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">per {sup.unit}</span>
                    </div>

                    {/* Direct Contact Button */}
                    <button
                      onClick={() => handleContactSupplier(sup.supplierId, sup.supplierName)}
                      className="p-2.5 rounded-xl bg-teal-950 border border-teal-500/30 text-teal-300 hover:bg-teal-900 transition flex items-center gap-1.5 text-xs font-bold"
                      title="Contact Supplier Directly"
                    >
                      <MessageSquare className="w-4 h-4 text-teal-400" />
                      <span className="hidden md:inline">Contact</span>
                    </button>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => {
                        onAddToCart(sup.supplierProductId);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Select</span>
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
