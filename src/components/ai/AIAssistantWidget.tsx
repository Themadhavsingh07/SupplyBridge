'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, ShoppingBag, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GroundedProduct {
  productId: string;
  supplierId: string;
  supplierName: string;
  name: string;
  price: number;
  availableStock: number;
  rating: number;
  imageUrl: string;
  rankingScore?: number;
  explanation?: string;
}

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [products, setProducts] = useState<GroundedProduct[]>([]);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const PRESETS = [
    'Breakfast items for 4 people under ₹500',
    'Cheap snacks under ₹300',
    'High protein food',
    'Household essentials under ₹1000',
  ];

  const handleSearch = async (userQuery?: string) => {
    const q = userQuery || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setProducts([]);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          budget: budget ? Number(budget) : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch AI recommendations');
      }

      setResponse(data.data.responseText);
      setProducts(data.data.products || []);
    } catch (err: any) {
      setError(err.message || 'AI Assistant service unavailable. Please try standard search.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        setAddedItems((prev) => ({ ...prev, [productId]: true }));
        setTimeout(() => {
          setAddedItems((prev) => ({ ...prev, [productId]: false }));
        }, 2000);
      }
    } catch (err) {
      console.error('Add to cart failed:', err);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-white shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        <Sparkles className="h-5 w-5 animate-pulse" />
        <span className="font-semibold text-sm">AI Shopping Assistant</span>
      </motion.button>

      {/* Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-6 z-50 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">SupplyBridge AI Assistant</h3>
                  <p className="text-xs text-slate-400">Grounded in verified live local inventory</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
              {/* Presets */}
              {!response && !loading && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setPrompt(p);
                          handleSearch(p);
                        }}
                        className="rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-emerald-600/30 hover:text-emerald-300"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Sparkles className="h-8 w-8 animate-spin text-emerald-400" />
                  <p className="text-sm text-slate-300">Searching database & ranking best matches...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* AI Natural Language Summary */}
              {response && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-4 text-sm text-emerald-200">
                  {response}
                </div>
              )}

              {/* Product Cards */}
              {products.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Found {products.length} Grounded Products
                  </p>
                  <div className="grid gap-3">
                    {products.map((p) => (
                      <div
                        key={p.productId}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 p-3 transition hover:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-12 w-12 rounded-lg object-cover bg-slate-700"
                          />
                          <div>
                            <h4 className="font-semibold text-sm text-slate-100">{p.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>by {p.supplierName}</span>
                              <span>•</span>
                              <div className="flex items-center gap-0.5 text-amber-400">
                                <Star className="h-3 w-3 fill-amber-400" />
                                <span>{p.rating}</span>
                              </div>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-bold text-xs text-emerald-400">₹{p.price}</span>
                              {p.explanation && (
                                <span className="text-[10px] text-slate-400 line-clamp-1">({p.explanation})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(p.productId)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                        >
                          {addedItems[p.productId] ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Vegetables for dinner under ₹200..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={() => handleSearch()}
                  disabled={loading || !prompt.trim()}
                  className="rounded-xl bg-emerald-600 p-2.5 text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Budget optional input */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Max Budget (₹):</span>
                <input
                  type="number"
                  placeholder="Optional"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : '')}
                  className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
