'use client';

import React, { useState } from 'react';
import { Power, CheckCircle, Clock } from 'lucide-react';

interface DeliveryStatusToggleProps {
  initialOnline?: boolean;
  initialAvailable?: boolean;
  onStatusChange?: (isOnline: boolean, isAvailable: boolean) => void;
}

export default function DeliveryStatusToggle({
  initialOnline = false,
  initialAvailable = false,
  onStatusChange,
}: DeliveryStatusToggleProps) {
  const [isOnline, setIsOnline] = useState(initialOnline);
  const [isAvailable, setIsAvailable] = useState(initialAvailable);
  const [updating, setUpdating] = useState(false);

  const toggleStatus = async (newOnline: boolean, newAvailable: boolean) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/delivery/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: newOnline, isAvailable: newAvailable }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOnline(data.partner.isOnline);
        setIsAvailable(data.partner.isAvailable);
        if (onStatusChange) {
          onStatusChange(data.partner.isOnline, data.partner.isAvailable);
        }
      }
    } catch (err) {
      console.error('Failed to toggle delivery status:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Online / Offline Power Toggle */}
      <button
        onClick={() => toggleStatus(!isOnline, !isOnline ? true : false)}
        disabled={updating}
        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition border ${
          isOnline
            ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/10'
            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
        }`}
      >
        <Power className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`} />
        <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
      </button>

      {/* Available for Requests Switch */}
      {isOnline && (
        <button
          onClick={() => toggleStatus(isOnline, !isAvailable)}
          disabled={updating}
          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition border ${
            isAvailable
              ? 'bg-teal-950/60 border-teal-500/40 text-teal-300'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
          }`}
        >
          {isAvailable ? '🟢 Available' : '🟡 Busy'}
        </button>
      )}
    </div>
  );
}
