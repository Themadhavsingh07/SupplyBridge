'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, Send, ShoppingBag, HelpCircle, Bot, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

interface Props {
  onClose: () => void;
}

export default function AiAssistantModal({ onClose }: Props) {
  const router = useRouter();
  const { refreshCartCount } = useAuth();
  const [activeTab, setActiveTab] = useState<'shopping' | 'support'>('shopping');
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [shoppingResult, setShoppingResult] = useState<any>(null);
  const [supportResult, setSupportResult] = useState<any>(null);

  const sampleShoppingPrompts = [
    "I need breakfast items for four people under ₹500",
    "High protein workout meal bundle",
    "Healthy snacks and sparkling beverages under ₹300",
    "Party bundle with nachos, cold brew and chocolates",
  ];

  const sampleSupportPrompts = [
    "My order is late, where is the delivery partner?",
    "I received damaged milk bottle, need resolution",
    "How do I earn cashback and referral rewards?",
  ];

  const handleRunAiShopping = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    setLoading(true);
    setShoppingResult(null);

    try {
      const res = await fetch('/api/ai/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q }),
      });

      const data = await res.json();
      if (res.ok) {
        setShoppingResult(data);
      }
    } catch (error) {
      console.error('AI Shopping failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiSupport = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    setLoading(true);
    setSupportResult(null);

    try {
      const res = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (res.ok) {
        setSupportResult(data);
      }
    } catch (error) {
      console.error('AI Support failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAiItemToCart = async (supplierProductId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierProductId, quantity: 1 }),
      });
      if (res.ok) {
        await refreshCartCount();
      }
    } catch (error) {
      console.error('Add to cart failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>AI Marketplace Assistant</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  GPT-4o Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">Smart meal planner, budget optimizer & live order support</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 gap-2">
          <button
            onClick={() => {
              setActiveTab('shopping');
              setInputQuery('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'shopping'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>AI Shopping & Budget Bundles</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('support');
              setInputQuery('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'support'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>AI Order & Complaint Resolver</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Prompt Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Try asking:</span>
            <div className="flex flex-wrap gap-2">
              {(activeTab === 'shopping' ? sampleShoppingPrompts : sampleSupportPrompts).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputQuery(p);
                    if (activeTab === 'shopping') handleRunAiShopping(p);
                    else handleRunAiSupport(p);
                  }}
                  className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-emerald-400 px-3 py-1.5 rounded-xl transition text-left"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="relative flex items-center pt-2">
            <input
              type="text"
              placeholder={activeTab === 'shopping' ? "Describe what you need and your budget..." : "Ask about your order status or support..."}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (activeTab === 'shopping') handleRunAiShopping();
                  else handleRunAiSupport();
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-4 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            <button
              disabled={loading}
              onClick={() => {
                if (activeTab === 'shopping') handleRunAiShopping();
                else handleRunAiSupport();
              }}
              className="absolute right-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 p-1.5 rounded-lg transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* Results Area */}
          {loading && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              <span>Analyzing available inventory across local verified suppliers...</span>
            </div>
          )}

          {/* AI Shopping Output */}
          {activeTab === 'shopping' && shoppingResult && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                {shoppingResult.aiExplanation}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Recommended Supplier Bundle ({shoppingResult.recommendations.length} Items)</span>
                  <span className="text-emerald-400">Total: ₹{shoppingResult.totalEstimatedPrice}</span>
                </div>

                <div className="grid gap-2">
                  {shoppingResult.recommendations.map((item: any) => (
                    <div key={item.supplierProductId} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.productName} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <h5 className="font-bold text-xs text-white">{item.productName}</h5>
                          <p className="text-[10px] text-slate-400">Supplier: <span className="text-slate-200">{item.supplierName}</span> ({item.supplierRating}★)</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xs text-emerald-400">₹{item.finalPrice}</span>
                        <button
                          onClick={() => handleAddAiItemToCart(item.supplierProductId)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold rounded-lg transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Support Output */}
          {activeTab === 'support' && supportResult && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Bot className="w-4 h-4" />
                  <span>AI Support Response</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{supportResult.reply}</p>

                {supportResult.canEscalate && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Still need help?</span>
                    <button
                      onClick={() => {
                        onClose();
                        router.push('/help');
                      }}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition"
                    >
                      <span>Connect with Human Agent</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
