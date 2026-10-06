'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { ShieldCheck, Search, Filter } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (actionFilter) query.append('action', actionFilter);
      if (search) query.append('search', search);

      const res = await fetch(`/api/admin/audit-logs?${query.toString()}`);
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Security Compliance</span>
          <h1 className="text-2xl font-black text-white">Append-Only Audit Trail Logs</h1>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <form onSubmit={(e) => { e.preventDefault(); fetchAuditLogs(); }} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Action, Entity, or Admin Name..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </form>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Audit Actions</option>
            <option value="USER_SUSPENDED">USER_SUSPENDED</option>
            <option value="USER_REACTIVATED">USER_REACTIVATED</option>
            <option value="SUPPLIER_APPROVED">SUPPLIER_APPROVED</option>
            <option value="SUPPLIER_REJECTED">SUPPLIER_REJECTED</option>
            <option value="ORDER_MANUAL_OVERRIDE">ORDER_MANUAL_OVERRIDE</option>
            <option value="REFUND_CREATED">REFUND_CREATED</option>
            <option value="ADMIN_SETTINGS_CHANGED">ADMIN_SETTINGS_CHANGED</option>
          </select>
        </div>

        {/* Audit Log Table */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Actor</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">Target Entity</th>
                  <th className="py-4 px-6">Audit Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">Loading audit log records...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">No audit logs recorded.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-4 px-6 font-bold text-white font-sans">{log.user?.name || log.userId || 'SYSTEM'}</td>
                      <td className="py-4 px-6 font-bold text-emerald-400 font-sans">{log.action}</td>
                      <td className="py-4 px-6 text-slate-300 font-sans">{log.entityType} ({log.entityId})</td>
                      <td className="py-4 px-6 text-slate-400 text-[10px] max-w-xs truncate">
                        {JSON.stringify(log.newData || {})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
