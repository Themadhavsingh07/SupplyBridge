'use client';

import React, { useState, useEffect, use } from 'react';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';
import Link from 'next/link';
import { ShoppingCart, Star, Filter, ArrowUpDown, ChevronRight, ShieldCheck, Tag } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  discountPercent: number;
  finalPrice: number;
  primaryImage: string;
  unit: string;
  supplierId: string;
  supplierName: string;
  supplierRating: number;
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating'>('relevance');

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
          if (data.products.length > 0) {
            setCategoryName(data.products[0].categoryName || slug.replace(/-/g, ' '));
          } else {
            setCategoryName(slug.replace(/-/g, ' '));
          }
        }
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_low') return a.finalPrice - b.finalPrice;
    if (sortBy === 'price_high') return b.finalPrice - a.finalPrice;
    if (sortBy === 'rating') return b.supplierRating - a.supplierRating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/home" className="hover:text-emerald-400 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="capitalize text-slate-200 font-semibold">{categoryName}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white capitalize flex items-center gap-2">
              <Tag className="w-6 h-6 text-emerald-400" />
              {categoryName}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Direct local supplier listings for fresh {categoryName.toLowerCase()}
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <ArrowUpDown className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="relevance" className="bg-slate-900 text-white">Relevance</option>
              <option value="price_low" className="bg-slate-900 text-white">Price: Low to High</option>
              <option value="price_high" className="bg-slate-900 text-white">Price: High to Low</option>
              <option value="rating" className="bg-slate-900 text-white">Top Supplier Rating</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 h-64 animate-pulse"></div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
            <Tag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No products found in this category</h3>
            <p className="text-xs text-slate-400 mt-1">Check back soon or explore nearby suppliers.</p>
            <Link
              href="/home"
              className="inline-block mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Browse All Categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedProducts.map((p) => (
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
                    {p.discountPercent > 0 && (
                      <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow">
                        {p.discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-200 line-clamp-2 group-hover:text-emerald-400 transition">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{p.unit}</p>

                  <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{p.supplierName}</span>
                    <span className="flex items-center gap-0.5 text-amber-400 font-bold ml-auto shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" /> {p.supplierRating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-base font-black text-white">₹{p.finalPrice}</span>
                    {p.mrp > p.finalPrice && (
                      <span className="text-xs text-slate-500 line-through ml-1.5">₹{p.mrp}</span>
                    )}
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
