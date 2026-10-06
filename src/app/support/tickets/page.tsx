'use client';

import React, { useState, useEffect } from 'react';
import SupportLayout from '@/components/support/SupportLayout';
import Link from 'next/link';
import { Ticket, Search, Eye } from 'lucide-react';

export default function SupportTicketsQueuePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter) query.append('status', statusFilter);
      if (priorityFilter) query.append('priority', priorityFilter);

      const res = await fetch(`/api/support/tickets?${query.toString()}`);
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  return (
    <SupportLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block">Operational Queue</span>
          <h1 className="text-2xl font-black text-white">Support Tickets Console</h1>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Ticket Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All SLA Priorities</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Ticket Number</th>
                  <th className="py-4 px-6">Subject & Customer</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">Loading tickets...</td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">No tickets found.</td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6 font-mono font-bold text-teal-400">{t.ticketNumber}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-white block text-sm">{t.subject}</span>
                        <span className="text-slate-400 text-[11px]">{t.customer?.name} ({t.customer?.phone || t.customer?.email})</span>
                      </td>
                      <td className="py-4 px-6 font-bold text-rose-400">{t.priority}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/support/tickets/${t.id}`}
                          className="px-3.5 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition"
                        >
                          Open Console
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SupportLayout>
  );
}
