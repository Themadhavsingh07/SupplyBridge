'use client';

import React, { useState, useEffect } from 'react';
import SupportLayout from '@/components/support/SupportLayout';
import { Store, Search } from 'lucide-react';

export default function SupportSuppliersLookupPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/suppliers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.suppliers) setSuppliers(data.suppliers);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <SupportLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block">Support Diagnostics</span>
          <h1 className="text-2xl font-black text-white">Supplier Store Lookup</h1>
        </div>

        <div className="glass-panel p-4 rounded-3xl border border-slate-800">
          <form onSubmit={(e) => { e.preventDefault(); fetchSuppliers(); }} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Business Name, GST..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </form>
        </div>

        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Business Name</th>
                  <th className="py-4 px-6">Owner</th>
                  <th className="py-4 px-6">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-500">Loading suppliers...</td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-500">No suppliers found.</td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6 font-bold text-white text-sm">{s.businessName}</td>
                      <td className="py-4 px-6 text-slate-300">{s.user?.name}</td>
                      <td className="py-4 px-6 font-bold text-teal-400">{s.verificationStatus}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SupportLayout>
  );
}
