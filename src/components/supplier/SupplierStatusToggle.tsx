'use client';

import React, { useState } from 'react';
import { Circle } from 'lucide-react';

interface SupplierStatusToggleProps {
  initialStatus?: 'ONLINE' | 'OFFLINE' | 'BUSY';
  supplierId?: string;
  onStatusChange?: (status: 'ONLINE' | 'OFFLINE' | 'BUSY') => void;
}

export default function SupplierStatusToggle({
  initialStatus = 'ONLINE',
  onStatusChange,
}: SupplierStatusToggleProps) {
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE' | 'BUSY'>(initialStatus);
  const [updating, setUpdating] = useState(false);

  const handleToggle = async (newStatus: 'ONLINE' | 'OFFLINE' | 'BUSY') => {
    setStatus(newStatus);
    setUpdating(true);
    try {
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (err) {
      console.error('Failed to update online status:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
      <button
        onClick={() => handleToggle('ONLINE')}
        disabled={updating}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition ${
          status === 'ONLINE'
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>Online</span>
      </button>

      <button
        onClick={() => handleToggle('BUSY')}
        disabled={updating}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition ${
          status === 'BUSY'
            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Circle className="w-2 h-2 fill-amber-400 text-amber-400" />
        <span>Busy</span>
      </button>

      <button
        onClick={() => handleToggle('OFFLINE')}
        disabled={updating}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition ${
          status === 'OFFLINE'
            ? 'bg-slate-800 border border-slate-700 text-slate-300'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Circle className="w-2 h-2 fill-slate-500 text-slate-500" />
        <span>Offline</span>
      </button>
    </div>
  );
}
