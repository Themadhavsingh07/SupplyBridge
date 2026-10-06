'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { BellRing, Send } from 'lucide-react';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'ALL' | 'CUSTOMER' | 'SUPPLIER' | 'DELIVERY_PARTNER'>('ALL');
  const [submitting, setSubmitting] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          targetRole,
          type: 'SYSTEM',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Announcement broadcast successfully!');
        setTitle('');
        setMessage('');
      } else {
        alert(data.error || 'Failed to send announcement');
      }
    } catch (err) {
      alert('Broadcast execution error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Broadcast Center</span>
          <h1 className="text-2xl font-black text-white">System Announcements</h1>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <BellRing className="w-5 h-5" />
            <h3 className="font-bold text-base text-white">Broadcast Platform Announcement</h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e: any) => setTargetRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
              >
                <option value="ALL">All Platform Users</option>
                <option value="CUSTOMER">Customers Only</option>
                <option value="SUPPLIER">Suppliers Only</option>
                <option value="DELIVERY_PARTNER">Delivery Partners Only</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Announcement Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled System Maintenance Notice"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Message Body</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type platform-wide message details here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white h-32"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" /> {submitting ? 'Broadcasting...' : 'Broadcast Announcement'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
