'use client';

import React, { useState, useEffect, use } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { User, Shield, Clock, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) {
        console.error('Failed to load user details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

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

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-16 space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">User Not Found</h2>
          <Link href="/admin/users" className="text-emerald-400 font-bold text-xs hover:underline">
            ← Back to Users
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Link>

        {/* Profile Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black text-2xl">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <p className="text-xs text-slate-400">{user.email || user.phone} • Role: {user.role}</p>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
            {user.status}
          </span>
        </div>

        {/* Audit Logs for this User */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-white">User Activity Audit History</h3>
          <div className="space-y-2">
            {user.auditLogs?.length === 0 ? (
              <p className="text-xs text-slate-500">No recent audit log records.</p>
            ) : (
              user.auditLogs?.map((log: any) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between">
                  <div>
                    <span className="font-bold text-emerald-400 block">{log.action}</span>
                    <span className="text-slate-400 text-[11px]">{log.entityType} ({log.entityId})</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
