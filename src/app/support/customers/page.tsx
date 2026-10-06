'use client';

import React, { useState, useEffect } from 'react';
import SupportLayout from '@/components/support/SupportLayout';
import { Users, Search } from 'lucide-react';

export default function SupportCustomersLookupPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?role=CUSTOMER&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.users) setCustomers(data.users);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <SupportLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block">Support Diagnostics</span>
          <h1 className="text-2xl font-black text-white">Customer Account Lookup</h1>
        </div>

        <div className="glass-panel p-4 rounded-3xl border border-slate-800">
          <form onSubmit={(e) => { e.preventDefault(); fetchCustomers(); }} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Customer Name, Email, or Phone..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </form>
        </div>

        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Total Orders</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">Loading customers...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">No customers found.</td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6 font-bold text-white text-sm">{c.name}</td>
                      <td className="py-4 px-6 text-slate-300">{c.email || c.phone}</td>
                      <td className="py-4 px-6 font-mono text-emerald-400">{c.customerProfile?.totalOrders || 0}</td>
                      <td className="py-4 px-6 font-bold text-teal-400">{c.status}</td>
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
