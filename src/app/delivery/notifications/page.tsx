'use client';

import React, { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function DeliveryNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
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

  return (
    <DeliveryLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Rider Alerts</span>
            </div>
            <h1 className="text-2xl font-black text-white">Delivery Notifications</h1>
            <p className="text-xs text-slate-400">Order assignments, system updates & earning notifications</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-3">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No notifications found.</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <span className="font-bold text-xs text-white block">{n.title}</span>
                  <p className="text-xs text-slate-400">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono block pt-1">
                    {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DeliveryLayout>
  );
}
