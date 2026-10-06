'use client';

import React, { useState, useEffect, use } from 'react';
import SupportLayout from '@/components/support/SupportLayout';
import Link from 'next/link';
import { ArrowLeft, Lock, Send, AlertTriangle } from 'lucide-react';

export default function SupportAgentTicketConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [internalNote, setInternalNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/support/tickets/${id}`);
      const data = await res.json();
      if (data.ticket) setTicket(data.ticket);
    } catch (err) {
      console.error('Failed to load ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) return;

    setNoteSubmitting(true);
    try {
      const res = await fetch(`/api/admin/complaints/${id}/internal-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: internalNote }),
      });

      if (res.ok) {
        setInternalNote('');
        fetchTicket();
      }
    } catch (err) {
      alert('Internal note creation failed');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleResolve = async () => {
    try {
      const res = await fetch(`/api/admin/complaints/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' }),
      });
      if (res.ok) fetchTicket();
    } catch (err) {
      alert('Resolution failed');
    }
  };

  if (loading) {
    return (
      <SupportLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-slate-800 rounded-xl"></div>
          <div className="h-48 bg-slate-900 rounded-3xl"></div>
        </div>
      </SupportLayout>
    );
  }

  if (!ticket) {
    return (
      <SupportLayout>
        <div className="text-center py-16 space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
          <Link href="/support/tickets" className="text-teal-400 font-bold text-xs hover:underline">
            ← Back to Support Tickets
          </Link>
        </div>
      </SupportLayout>
    );
  }

  return (
    <SupportLayout>
      <div className="space-y-6">
        <Link href="/support/tickets" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Tickets Queue
        </Link>

        {/* Ticket Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-teal-400 font-bold block">{ticket.ticketNumber}</span>
            <h1 className="text-2xl font-black text-white">{ticket.subject}</h1>
            <p className="text-xs text-slate-400">Customer: {ticket.customer?.name} • Priority: {ticket.priority}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs">
              {ticket.status}
            </span>
            {ticket.status !== 'RESOLVED' && (
              <button
                onClick={handleResolve}
                className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition"
              >
                Resolve Ticket
              </button>
            )}
          </div>
        </div>

        {/* Internal Notes */}
        <div className="glass-panel p-6 rounded-3xl border border-teal-500/30 bg-teal-950/10 space-y-4">
          <div className="flex items-center gap-2 text-teal-400">
            <Lock className="w-4 h-4" />
            <h3 className="font-bold text-sm">Agent Internal Notes (Strictly Hidden from Customer)</h3>
          </div>

          <div className="space-y-3">
            {ticket.messages
              ?.filter((m: any) => m.isInternalNote)
              .map((m: any) => (
                <div key={m.id} className="p-3 rounded-2xl bg-slate-950 border border-teal-500/20 text-xs">
                  <span className="font-bold text-teal-300 block mb-1">Staff Note ({m.senderRole}):</span>
                  <p className="text-slate-200">{m.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
              ))}
          </div>

          <form onSubmit={handleAddInternalNote} className="flex gap-2">
            <input
              type="text"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Record operational note..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={noteSubmitting}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Post Note
            </button>
          </form>
        </div>
      </div>
    </SupportLayout>
  );
}
