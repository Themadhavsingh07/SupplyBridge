'use client';

import React, { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import Link from 'next/link';
import { MessageSquare, User } from 'lucide-react';

export default function DeliveryMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await fetch('/api/chat/conversations');
        const data = await res.json();
        if (data.conversations) {
          setConversations(data.conversations);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, []);

  return (
    <DeliveryLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Customer Contact</span>
            </div>
            <h1 className="text-2xl font-black text-white">Delivery Messaging Console</h1>
            <p className="text-xs text-slate-400">Direct 1:1 chat with customers during active delivery drops</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <h2 className="font-bold text-base text-white">Active Delivery Threads</h2>

          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading chat history...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No active customer conversations.</div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/delivery/messages/${conv.id}`}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm">
                      {conv.participantName?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block group-hover:text-emerald-400 transition">
                        {conv.participantName || 'Customer'}
                      </span>
                      <p className="text-xs text-slate-400 truncate max-w-xs">{conv.lastMessage || 'Click to open chat'}</p>
                    </div>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full">
                      {conv.unreadCount} New
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DeliveryLayout>
  );
}
