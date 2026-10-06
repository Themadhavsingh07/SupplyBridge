'use client';

import React, { useState, useEffect, use } from 'react';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Heart,
  MessageSquare,
  Star,
  ShieldCheck,
  Truck,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  discountPercent: number;
  finalPrice: number;
  stockQuantity: number;
  unit: string;
  primaryImage: string;
  categoryName: string;
  supplierId: string;
  supplierName: string;
  supplierRating: number;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products?id=${id}`);
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          const match = data.products.find((p: any) => p.id === id) || data.products[0];
          setProduct(match);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleContactSupplier = async () => {
    if (!product) return;
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: product.supplierId,
          initialMessage: `Hi ${product.supplierName}! I have a question about "${product.name}".`,
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
          <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Loading product details...</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Product Not Found</h2>
          <Link href="/home" className="inline-block mt-4 text-emerald-400 font-bold text-sm">
            Back to Home
          </Link>
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
          <span className="text-slate-300">{product.categoryName}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-100 font-bold truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md">
          {/* Left: Product Image */}
          <div>
            <div className="relative aspect-square rounded-2xl bg-slate-950 overflow-hidden border border-slate-800">
              <img
                src={product.primaryImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg shadow-lg">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Right: Product Details & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {product.categoryName}
                </span>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{product.name}</h1>
              <p className="text-xs text-slate-400 mt-1">Pack Size: {product.unit}</p>

              {/* Supplier Badge & Rating */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <Link href={`/supplier/${product.supplierId}`} className="font-bold text-sm text-slate-200 hover:text-emerald-400 transition">
                      {product.supplierName}
                    </Link>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Direct Verified Supplier</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {product.supplierRating}
                </div>
              </div>

              {/* Price Display */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-black text-white">₹{product.finalPrice}</span>
                {product.mrp > product.finalPrice && (
                  <span className="text-base text-slate-500 line-through">₹{product.mrp}</span>
                )}
                <span className="text-xs text-emerald-400 font-bold">Inclusive of all taxes</span>
              </div>

              {/* Delivery Features */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Delivered in 15-30 mins</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                  <Truck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Direct Farm Fresh</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{product.description}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3 pt-6 border-t border-slate-800">
              {cartSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Added to cart successfully!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                {/* Core USP: Direct Supplier Contact */}
                <button
                  onClick={handleContactSupplier}
                  className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-sm py-3.5 rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Contact Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
