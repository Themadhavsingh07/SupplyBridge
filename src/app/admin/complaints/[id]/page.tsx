'use client';

import React, { useState, useEffect, use } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Lock, Send } from 'lucide-react';

export default function AdminComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [internalNote, setInternalNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/complaints/${id}`);
      const data = await res.json();
      if (data.ticket) setTicket(data.ticket);
    } catch (err) {
      console.error('Failed to load complaint details:', err);
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
      } else {
        alert('Failed to add internal note');
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
      alert('Resolution update failed');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-slate-800 rounded-xl"></div>
          <div className="h-48 bg-slate-900 rounded-3xl"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!ticket) {
    return (
      <AdminLayout>
        <div className="text-center py-16 space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
          <Link href="/admin/complaints" className="text-emerald-400 font-bold text-xs hover:underline">
            ← Back to Complaints
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link href="/admin/complaints" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Complaints
        </Link>

        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-emerald-400 font-bold block">{ticket.ticketNumber}</span>
            <h1 className="text-2xl font-black text-white">{ticket.subject}</h1>
            <p className="text-xs text-slate-400">Customer: {ticket.customer?.name} • Priority: {ticket.priority}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs">
              {ticket.status}
            </span>
            {ticket.status !== 'RESOLVED' && (
              <button
                onClick={handleResolve}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
              >
                Mark Resolved
              </button>
            )}
          </div>
        </div>

        {/* Internal Notes Section (Hidden from Customer) */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-950/10 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Lock className="w-4 h-4" />
            <h3 className="font-bold text-sm">Internal Support Notes (Staff Only)</h3>
          </div>

          <div className="space-y-3">
            {ticket.messages
              ?.filter((m: any) => m.isInternalNote)
              .map((m: any) => (
                <div key={m.id} className="p-3 rounded-2xl bg-slate-950 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-300 block mb-1">Staff Note ({m.senderRole}):</span>
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
              placeholder="Add confidential internal note..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={noteSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Save Note
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
