'use client';

import React, { useState, useEffect } from 'react';
import SupportLayout from '@/components/support/SupportLayout';
import Link from 'next/link';
import { Headphones, Ticket, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';

export default function SupportDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSupportDashboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/support/dashboard');
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recentTickets) setTickets(data.recentTickets);
      } catch (err) {
        console.error('Failed to load support dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSupportDashboard();
  }, []);

  return (
    <SupportLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block">Agent Operations</span>
          <h1 className="text-2xl font-black text-white">Support Operations Center</h1>
        </div>

        {/* SLA & Ticket Metrics */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-medium block">My Assigned Tickets</span>
              <span className="text-2xl font-black text-teal-400 mt-1 block">{stats.myTicketsCount}</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-medium block">Total Open Pool</span>
              <span className="text-2xl font-black text-white mt-1 block">{stats.openTicketsCount}</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-medium block">Urgent Priority Tickets</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">{stats.urgentTicketsCount}</span>
            </div>
          </div>
        )}

        {/* Recent Tickets Table */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">High Priority Support Queue</h3>
            <Link href="/support/tickets" className="text-xs font-bold text-teal-400 hover:underline">
              View All Tickets →
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading support queue...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No support tickets currently pending.</div>
            ) : (
              tickets.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-teal-400 font-mono block">{t.ticketNumber}</span>
                    <span className="font-bold text-white text-sm block mt-0.5">{t.subject}</span>
                    <span className="text-slate-400 text-[11px]">Customer: {t.customer?.name} • Priority: {t.priority}</span>
                  </div>

                  <Link
                    href={`/support/tickets/${t.id}`}
                    className="px-3 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition"
                  >
                    Resolve Ticket
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SupportLayout>
  );
}
