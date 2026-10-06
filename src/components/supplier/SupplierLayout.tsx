'use client';

import React from 'react';
import SupplierHeader from './SupplierHeader';
import SupplierSidebar from './SupplierSidebar';
import SupplierMobileNav from './SupplierMobileNav';
import { useAuth } from '../providers/AuthProvider';

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user && user.role !== 'SUPPLIER' && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-xs text-slate-400">Supplier role required to access the Merchant Console.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SupplierHeader />
      <div className="flex flex-1">
        <SupplierSidebar />
        <main className="flex-1 pb-20 md:pb-8 overflow-y-auto">{children}</main>
      </div>
      <SupplierMobileNav />
    </div>
  );
}
