'use client';

import React from 'react';
import { RealtimeConnectionStatus } from '@/types/realtime';

interface RealtimeStatusIndicatorProps {
  status: RealtimeConnectionStatus;
  lastUpdated?: string | null;
  className?: string;
}

export default function RealtimeStatusIndicator({
  status,
  lastUpdated,
  className = '',
}: RealtimeStatusIndicatorProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'CONNECTED':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-500',
          ping: true,
          text: 'Live Realtime',
        };
      case 'CONNECTING':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          ping: false,
          text: 'Reconnecting...',
        };
      case 'ERROR':
      case 'DISCONNECTED':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-500',
          ping: false,
          text: 'Live tracking unavailable',
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md transition ${style.bg} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {style.ping && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`}></span>
      </span>
      <span>{style.text}</span>

      {lastUpdated && (
        <span className="text-[10px] text-slate-400 font-mono border-l border-slate-700/50 pl-2">
          Last updated: {lastUpdated}
        </span>
      )}
    </div>
  );
}
