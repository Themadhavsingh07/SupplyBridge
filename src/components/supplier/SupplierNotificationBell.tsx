'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function SupplierNotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial unread count
    fetch(`/api/notifications?userId=${user.id}&unreadOnly=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.notifications)) {
          setUnreadCount(data.notifications.length);
        }
      })
      .catch(() => {});

    // Supabase Realtime Subscription for user notifications
    const supabase = getSupabaseBrowserClient();
    const channelName = `user:${user.id}:notifications`;
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'NOTIFICATION_CREATED' }, () => {
        setUnreadCount((prev) => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <Link
      href="/notifications"
      className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
      title="Notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center border border-slate-950 animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
