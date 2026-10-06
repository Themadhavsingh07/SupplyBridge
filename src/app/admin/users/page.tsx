'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Users, Search, Filter, ShieldAlert, CheckCircle, Ban, Eye } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Status Change Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>('SUSPENDED');
  const [reason, setReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (roleFilter) query.append('role', roleFilter);
      if (statusFilter) query.append('status', statusFilter);
      if (search) query.append('search', search);

      const res = await fetch(`/api/admin/users?${query.toString()}`);
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !reason) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          status: newStatus,
          reason,
        }),
      });

      if (res.ok) {
        setSelectedUser(null);
        setReason('');
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update user status');
      }
    } catch (err) {
      alert('Failed to execute status update');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Access & RBAC Control</span>
            <h1 className="text-2xl font-black text-white">User Accounts Management</h1>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, Email, or Phone..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="DELIVERY_PARTNER">Delivery Partner</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPPORT_AGENT">Support Agent</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">User Details</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                      Loading users from PostgreSQL...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                      No matching users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6">
                        <span className="font-bold text-white text-sm block">{u.name}</span>
                        <span className="text-slate-400 text-[11px]">{u.email || u.phone || 'No Contact'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 font-bold text-[10px] text-slate-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : u.status === 'SUSPENDED'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setNewStatus(u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED');
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs transition border ${
                            u.status === 'SUSPENDED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {u.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-lg text-white">Update Account Status: {selectedUser.name}</h3>

              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Target Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Audit Reason (Required)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter explicit reason for audit log entry..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white h-24"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="w-1/2 bg-slate-900 border border-slate-800 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20"
                  >
                    {actionLoading ? 'Saving...' : 'Confirm Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
