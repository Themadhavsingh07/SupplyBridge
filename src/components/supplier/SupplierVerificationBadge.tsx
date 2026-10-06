'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, AlertTriangle, XCircle } from 'lucide-react';

export type VerificationStatusType = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

interface SupplierVerificationBadgeProps {
  status: VerificationStatusType | string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function SupplierVerificationBadge({
  status,
  size = 'md',
  showText = true,
}: SupplierVerificationBadgeProps) {
  const normStatus = (status || 'PENDING').toUpperCase() as VerificationStatusType;

  const statusConfig = {
    VERIFIED: {
      label: 'Verified',
      bg: 'bg-emerald-950/60',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      icon: ShieldCheck,
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      bg: 'bg-amber-950/60',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      icon: Clock,
    },
    PENDING: {
      label: 'Pending',
      bg: 'bg-slate-900',
      border: 'border-slate-700',
      text: 'text-slate-400',
      icon: Clock,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-rose-950/60',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      icon: XCircle,
    },
    SUSPENDED: {
      label: 'Suspended',
      bg: 'bg-rose-950/80',
      border: 'border-rose-600',
      text: 'text-rose-300',
      icon: AlertTriangle,
    },
  };

  const config = statusConfig[normStatus] || statusConfig.PENDING;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center font-bold rounded-full border ${config.bg} ${config.border} ${config.text} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {showText && <span>{config.label}</span>}
    </div>
  );
}
