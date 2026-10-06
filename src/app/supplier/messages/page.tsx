'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import Link from 'next/link';
import { MessageSquare, User, Clock, Search, Send, CheckCheck } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function SupplierMessagesPage() {
  const { user } = useAuth();
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
    <SupplierLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Direct Communications</span>
            </div>
            <h1 className="text-2xl font-black text-white">Customer Messages Console</h1>
            <p className="text-xs text-slate-400">Realtime customer queries, order context & direct messaging</p>
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <h2 className="font-bold text-base text-white">Active Conversations</h2>

          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading chat history...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No customer messages yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/supplier/messages/${conv.id}`}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm">
                      {conv.participantName?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block group-hover:text-emerald-400 transition">
                        {conv.participantName || 'Customer'}
                      </span>
                      <p className="text-xs text-slate-400 truncate max-w-xs">{conv.lastMessage || 'Click to view conversation history'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="mt-1 px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full inline-block">
                        {conv.unreadCount} New
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </SupplierLayout>
  );
}
