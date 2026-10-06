'use client';

import { useState } from 'react';
import { Sparkles, Send, ShoppingBag, Star, CheckCircle2, ShieldCheck, Filter } from 'lucide-react';
import { AIAssistantWidget } from '@/components/ai/AIAssistantWidget';

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

export default function AIAssistantPage() {
  const [prompt, setPrompt] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [products, setProducts] = useState<GroundedProduct[]>([]);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const SUGGESTED_QUERIES = [
    'Breakfast items for 4 people under ₹500',
    'Cheap snacks under ₹300',
    'I need protein-rich food',
    'Items for a birthday party',
    'Vegetables for family dinner',
    'Show me household essentials under ₹1000',
    'Which supplier has fresh dairy?',
  ];

  const handleSearch = async (userQuery?: string) => {
    const q = userQuery || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

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
      if (!data.success) throw new Error(data.error || 'Query failed');

      setResponse(data.data.responseText);
      setProducts(data.data.products || []);
    } catch (err: any) {
      setError(err.message || 'AI Assistant service encountered an issue.');
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
        setTimeout(() => setAddedItems((prev) => ({ ...prev, [productId]: false })), 2000);
      }
    } catch (err) {
      console.error('Add to cart failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-6 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/20 p-3 text-emerald-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">AI Shopping Assistant</h1>
              <p className="text-sm text-slate-400">
                Natural Language Product Discovery Grounded in Real Local Inventory
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero Hallucinations Guarantee</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Input Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Ask anything (e.g., 'Breakfast items for 4 people under ₹500')..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-5 py-3.5 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300">
                <Filter className="h-4 w-4 text-slate-400" />
                <span>Max Budget (₹):</span>
                <input
                  type="number"
                  placeholder="Any"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : '')}
                  className="w-20 bg-transparent text-emerald-400 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading || !prompt.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggested Queries</span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setPrompt(q);
                    handleSearch(q);
                  }}
                  className="rounded-full border border-slate-800 bg-slate-800/40 px-3.5 py-1.5 text-xs text-slate-300 transition hover:border-emerald-500 hover:bg-emerald-950/40 hover:text-emerald-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Sparkles className="h-10 w-10 animate-spin text-emerald-400" />
            <p className="text-slate-300 text-sm">Evaluating intent & querying real database stock...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {response && !loading && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-emerald-300 text-sm leading-relaxed">
            {response}
          </div>
        )}

        {products.length > 0 && !loading && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center justify-between">
              <span>Verified Database Recommendations</span>
              <span className="text-xs font-normal text-slate-400">{products.length} items in stock</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.productId}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition hover:border-emerald-500/50 hover:shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-800">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2 right-2 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{p.rating}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-100">{p.name}</h3>
                      <p className="text-xs text-slate-400">Supplier: {p.supplierName}</p>
                    </div>

                    {p.explanation && (
                      <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        "{p.explanation}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-800">
                    <div>
                      <span className="text-xl font-extrabold text-emerald-400">₹{p.price}</span>
                      <span className="block text-[10px] text-slate-400">Stock: {p.availableStock} available</span>
                    </div>

                    <button
                      onClick={() => addToCart(p.productId)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                    >
                      {addedItems[p.productId] ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AIAssistantWidget />
    </div>
  );
}
