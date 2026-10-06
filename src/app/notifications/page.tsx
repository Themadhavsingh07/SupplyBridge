'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';
import Link from 'next/link';
import { Bell, CheckCheck, Package, MessageSquare, ShieldCheck, Tag } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-400" /> Notifications
          </h1>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No notifications yet</h3>
            <p className="text-xs text-slate-400 mt-1">Order updates and chat alerts will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition flex items-start gap-4 ${
                  n.isRead
                    ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                    : 'bg-slate-900 border-emerald-500/30 text-white shadow-lg shadow-emerald-500/5'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                  {n.type === 'ORDER' ? (
                    <Package className="w-5 h-5 text-emerald-400" />
                  ) : n.type === 'CHAT' ? (
                    <MessageSquare className="w-5 h-5 text-teal-400" />
                  ) : (
                    <Bell className="w-5 h-5 text-indigo-400" />
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-sm text-slate-100">{n.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
