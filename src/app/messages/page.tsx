'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { MessageSquare, ShieldCheck, Star, Search, Clock, ArrowRight, Loader2, Store } from 'lucide-react';

export default function MessagesListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetch('/api/chat/conversations')
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations) setConversations(data.conversations);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = conversations.filter(
    (c) =>
      c.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessageText && c.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Direct Supplier Communications</span>
          </div>
          <h1 className="text-2xl font-black text-white">Live Supplier Conversations</h1>
          <p className="text-xs text-slate-400">Ask questions about stock, request bulk discounts, or check order preparation live.</p>
        </div>

        <div className="shrink-0">
          <Link
            href="/search"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <Store className="w-4 h-4" />
            <span>Find Suppliers</span>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search supplier conversations or message history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          <span>Loading supplier chat history...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-slate-800">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Conversations Found</h3>
            <p className="text-xs text-slate-400">You haven't initiated direct contact with any verified suppliers yet.</p>
          </div>
          <Link
            href="/search"
            className="inline-flex px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            Browse Products & Contact Suppliers
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                
                {/* Avatar with Availability Status */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-black text-base flex items-center justify-center">
                    {c.supplierName.charAt(0)}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                      c.isSupplierAvailable ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                    title={c.isSupplierAvailable ? 'Supplier Online' : 'Supplier Offline'}
                  />
                </div>

                {/* Conversation Details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white truncate">{c.supplierName}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate max-w-md">
                    {c.lastMessageText}
                  </p>
                </div>
              </div>

              {/* Time & Unread Badge */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" />
                  {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {c.unreadCount > 0 ? (
                  <span className="bg-emerald-500 text-slate-950 font-black text-[11px] px-2 py-0.5 rounded-full animate-pulse">
                    {c.unreadCount} new
                  </span>
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
