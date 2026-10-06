'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Star,
  Plus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const { refreshCartCount } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [supplierVerified, setSupplierVerified] = useState(false);
  const [sortBy, setSortBy] = useState<string>('RELEVANCE');
  const [page, setPage] = useState<number>(1);

  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 20, total: 0, totalPages: 1, hasNextPage: false });
  const [extractedIntent, setExtractedIntent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const SUGGESTIONS = [
    'breakfast items under ₹500',
    'cheap snacks under ₹300',
    'milk near me',
    'protein rich food',
    'vegetables for dinner',
    'products from verified suppliers',
    'cheapest rice',
    'good quality fruits',
  ];

  useEffect(() => {
    executeSmartSearch(query, page);
  }, [category, minPrice, maxPrice, minRating, supplierVerified, sortBy, page]);

  const executeSmartSearch = async (userQuery?: string, targetPage: number = 1) => {
    setLoading(true);
    const q = userQuery !== undefined ? userQuery : query;

    try {
      if (q && q.trim().length > 0) {
        // Natural Language Smart Search API
        const res = await fetch('/api/ai/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setProducts(data.results || []);
          setPagination(data.pagination || { page: 1, limit: 20, total: data.results?.length || 0, totalPages: 1 });
          setExtractedIntent(data.extractedIntent || null);
        }
      } else {
        // Standard Structured Search API
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (minPrice) params.append('minPrice', minPrice.toString());
        if (maxPrice) params.append('maxPrice', maxPrice.toString());
        if (minRating > 0) params.append('rating', minRating.toString());
        if (supplierVerified) params.append('supplierVerified', 'true');
        if (sortBy) params.append('sort', sortBy);
        params.append('page', targetPage.toString());

        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.results || []);
          setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
          setExtractedIntent(null);
        }
      }
    } catch (error) {
      console.error('Smart Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        setAddedItems((prev) => ({ ...prev, [productId]: true }));
        setTimeout(() => setAddedItems((prev) => ({ ...prev, [productId]: false })), 2000);
        await refreshCartCount();
      }
    } catch (error) {
      console.error('Cart add error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-100">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5 text-white">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <span>Smart Marketplace Search</span>
            </h1>
            <p className="text-xs text-slate-400">
              Natural Language Intent Discovery Grounded in Live Local Inventory
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authoritative PostgreSQL Records</span>
          </div>
        </div>

        {/* Natural Language Input Bar */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder='Try searching "cheap breakfast items under 500", "milk near me", "protein food"...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeSmartSearch(query, 1)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl py-4 pl-12 pr-28 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-lg"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4" />
          <button
            onClick={() => executeSmartSearch(query, 1)}
            className="absolute right-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
          >
            Search
          </button>
        </div>

        {/* Preset Query Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Try Asking:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                executeSmartSearch(s, 1);
              }}
              className="rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1 text-xs text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-950/40 hover:text-emerald-300"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Extracted Intent Badge */}
        {extractedIntent && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Extracted Intent:
            </span>
            {extractedIntent.query && (
              <span className="rounded-md bg-emerald-900/40 px-2 py-0.5 border border-emerald-500/30">
                Keyword: {extractedIntent.query}
              </span>
            )}
            {extractedIntent.maxPrice && (
              <span className="rounded-md bg-emerald-900/40 px-2 py-0.5 border border-emerald-500/30">
                Max Price: ₹{extractedIntent.maxPrice}
              </span>
            )}
            {extractedIntent.minRating && (
              <span className="rounded-md bg-emerald-900/40 px-2 py-0.5 border border-emerald-500/30">
                Min Rating: {extractedIntent.minRating}★
              </span>
            )}
            {extractedIntent.sortBy && (
              <span className="rounded-md bg-emerald-900/40 px-2 py-0.5 border border-emerald-500/30">
                Sort: {extractedIntent.sortBy}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Grid & Filters Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5 h-fit backdrop-blur-md">
          <div className="flex items-center justify-between font-bold text-sm text-white border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>Filter Options</span>
            </div>
            {(category || minPrice || maxPrice || minRating || supplierVerified) && (
              <button
                onClick={() => {
                  setCategory('');
                  setMinPrice('');
                  setMaxPrice('');
                  setMinRating(0);
                  setSupplierVerified(false);
                  setQuery('');
                }}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sort Results By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="RELEVANCE">Best Relevance Score</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="RATING_DESC">Highest Customer Rating</option>
              <option value="DISTANCE_ASC">Nearest Distance</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Categories</option>
              <option value="fruits-vegetables">Fresh Fruits & Vegetables</option>
              <option value="dairy-bread-eggs">Dairy, Bread & Eggs</option>
              <option value="snacks-beverages">Snacks & Beverages</option>
              <option value="meat-seafood">Meat & Seafood</option>
              <option value="home-cleaning">Home & Cleaning</option>
              <option value="pharmacy-wellness">Pharmacy & Wellness</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Price Range (₹)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="0">All Ratings</option>
              <option value="4.0">4.0★ & Above</option>
              <option value="4.5">4.5★ & Above (Top Rated)</option>
              <option value="4.8">4.8★ & Above (Verified Premium)</option>
            </select>
          </div>

          {/* Verified Supplier Toggle */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Verified Suppliers Only</span>
            <input
              type="checkbox"
              checked={supplierVerified}
              onChange={(e) => setSupplierVerified(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Results Grid Area */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-white">{products.length}</strong> of{' '}
              <strong className="text-white">{pagination.total}</strong> products in database
            </span>
            <span className="text-emerald-400 font-semibold">Page {pagination.page} of {pagination.totalPages}</span>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-slate-900 rounded-2xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Deterministic Empty State */
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Matching Products Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  We couldn't find active database items matching your exact filters. Try broadening your max price or removing specific category criteria.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setQuery('');
                    setMaxPrice('');
                    setMinPrice('');
                    setCategory('');
                    executeSmartSearch('', 1);
                  }}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 flex flex-col justify-between transition hover:border-slate-700 hover:shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-square rounded-xl bg-slate-950 overflow-hidden border border-slate-800">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-400 flex items-center gap-1 border border-amber-500/30">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{p.rating}</span>
                      </div>
                      {p.supplierVerified && (
                        <div className="absolute top-2 left-2 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{p.categoryName}</span>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{p.name}</h3>
                      <p className="text-xs text-slate-400">
                        Supplier: <span className="text-slate-200">{p.supplierName}</span>
                      </p>
                      {p.distanceKm !== undefined && (
                        <p className="text-[11px] text-teal-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Approximately {p.distanceKm} km straight-line
                        </p>
                      )}
                    </div>

                    {p.rankingReason && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 line-clamp-2">
                        "{p.rankingReason}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-emerald-400">₹{p.price}</span>
                      <span className="block text-[10px] text-slate-400">Stock: {p.stockQuantity} in stock</span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(p.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                    >
                      {addedItems[p.id] ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <button
                onClick={() => {
                  const prev = Math.max(1, page - 1);
                  setPage(prev);
                  executeSmartSearch(query, prev);
                }}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 disabled:opacity-40 hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  executeSmartSearch(query, next);
                }}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 disabled:opacity-40 hover:bg-slate-800"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-xs text-slate-400">Loading Smart Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
