'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import Link from 'next/link';
import { Users, UserCheck, RefreshCcw, DollarSign, ShoppingBag, MessageSquare, ArrowUpRight } from 'lucide-react';

export default function SupplierCustomersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch('/api/supplier/customers');
        const result = await res.json();
        if (result.success) {
          setData(result);
        }
      } catch (err) {
        console.error('Failed to load supplier customers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const metrics = data?.metrics || {
    totalCustomers: 0,
    repeatCustomers: 0,
    newCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  };

  return (
    <SupplierLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Customer Insights</span>
            </div>
            <h1 className="text-2xl font-black text-white">Supplier Customer Directory</h1>
            <p className="text-xs text-slate-400">Order history, repeat purchase rates & customer metrics</p>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400">Total Customers</span>
            <div className="text-2xl font-black text-white">{metrics.totalCustomers}</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400">Repeat Customers</span>
            <div className="text-2xl font-black text-emerald-400">{metrics.repeatCustomers}</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400">Avg Order Value</span>
            <div className="text-2xl font-black text-white">₹{metrics.averageOrderValue}</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400">Total Revenue</span>
            <div className="text-2xl font-black text-emerald-400">₹{metrics.totalRevenue}</div>
          </div>
        </div>

        {/* Customer List Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          <h2 className="font-bold text-base text-white mb-4">Interacted Customers</h2>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading customer history...</div>
          ) : !data?.customers || data.customers.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No customer orders recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Total Spent</th>
                    <th className="py-3 px-4">Avg Order Value</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {data.customers.map((c: any) => (
                    <tr key={c.customerId} className="hover:bg-slate-950/40">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{c.name}</span>
                        <span className="text-[10px] text-slate-400">{c.phone}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{c.totalOrders}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">₹{c.totalSpent}</td>
                      <td className="py-3 px-4">₹{c.averageOrderValue}</td>
                      <td className="py-3 px-4">
                        {c.isRepeatCustomer ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            Repeat Customer
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                            New Customer
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/supplier/messages?customerId=${c.customerId}`}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-bold rounded-xl transition inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" /> Chat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SupplierLayout>
  );
}
