'use client';

import React, { useState, useEffect, use } from 'react';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  Star,
  ShieldCheck,
  MessageSquare,
  Clock,
  MapPin,
  ShoppingCart,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

interface SupplierData {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  rating: number;
  totalRatings: number;
  verificationStatus: string;
  onlineStatus: string;
  isOpen: boolean;
  logoUrl?: string;
  coverImageUrl?: string;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  mrp: number;
  discountPercent: number;
  finalPrice: number;
  primaryImage: string;
  unit: string;
}

export default function SupplierStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupplierStore() {
      try {
        const res = await fetch(`/api/products?supplierId=${id}`);
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          const first = data.products[0];
          setSupplier({
            id: first.supplierId,
            businessName: first.supplierName,
            ownerName: 'Verified Partner',
            phone: '+91 9876543210',
            email: 'supplier@supplybridge.com',
            addressLine: 'Local Agro Hub',
            city: 'Bengaluru',
            state: 'Karnataka',
            rating: first.supplierRating || 4.9,
            totalRatings: 184,
            verificationStatus: 'VERIFIED',
            onlineStatus: 'ONLINE',
            isOpen: true,
          });
        }
      } catch (err) {
        console.error('Failed to load supplier store:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSupplierStore();
  }, [id]);

  const handleContactSupplier = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: id,
          initialMessage: `Hi ${supplier?.businessName}! I am viewing your store on SupplyBridge.`,
        }),
      });
      const data = await res.json();
      if (data.conversationId) {
        router.push(`/messages?conversationId=${data.conversationId}`);
      }
    } catch (err) {
      console.error('Contact supplier error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Loading supplier store...</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 md:pb-8">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/home" className="hover:text-emerald-400 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-400">Suppliers</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-100 font-bold">{supplier?.businessName}</span>
        </div>

        {/* Supplier Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 backdrop-blur-md overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-500/20 shrink-0">
                <Store className="w-8 h-8 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {supplier?.businessName}
                  </h1>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {supplier?.rating} ({supplier?.totalRatings} reviews)
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {supplier?.city}, {supplier?.state}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                    <Clock className="w-3 h-3" /> OPEN NOW
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleContactSupplier}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Supplier Directly
            </button>
          </div>
        </div>

        {/* Store Catalog */}
        <h2 className="text-xl font-black text-white tracking-tight mb-4">Store Inventory</h2>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
            <Store className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No products currently listed</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 hover:border-emerald-500/50 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-xl bg-slate-950 overflow-hidden mb-3">
                    <img
                      src={p.primaryImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-sm text-slate-200 line-clamp-2 group-hover:text-emerald-400 transition">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{p.unit}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-base font-black text-white">₹{p.finalPrice}</span>
                  </div>
                  <button className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold transition">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
