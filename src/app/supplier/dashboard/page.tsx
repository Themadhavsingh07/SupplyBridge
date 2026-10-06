'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import Link from 'next/link';
import {
  Store,
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Star,
  MessageSquare,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Package,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import SupplierVerificationBadge from '@/components/supplier/SupplierVerificationBadge';

export default function SupplierDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    activeProducts: 0,
    rating: 0,
    totalRatings: 0,
    onlineStatus: 'OFFLINE',
    isOpen: true,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        fetch('/api/supplier/analytics?range=today'),
        fetch('/api/supplier/orders?limit=5'),
      ]);

      const analyticsData = await analyticsRes.json();
      const ordersData = await ordersRes.json();

      if (analyticsData.kpis) {
        setStats(analyticsData.kpis);
      }
      if (ordersData.orders) {
        setRecentOrders(ordersData.orders);
      }
    } catch (err) {
      console.error('Failed to load supplier dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <SupplierLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Supplier Operations Center
              </span>
              <SupplierVerificationBadge status={user?.role === 'SUPPLIER' ? 'VERIFIED' : 'PENDING'} size="sm" />
            </div>
            <h1 className="text-2xl font-black text-white">
              {user?.name || 'Local Merchant Operations'}
            </h1>
            <p className="text-xs text-slate-400">Realtime Multi-Vendor Order & Inventory Dashboard</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboard}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/supplier/products/new"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>

            <Link
              href="/supplier/messages"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </Link>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Today's Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">₹{stats.todayRevenue.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Total Lifetime: ₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Pending Orders</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{stats.pendingOrders}</div>
            <Link href="/supplier/orders" className="text-[10px] text-slate-400 hover:text-white underline">
              View order queue →
            </Link>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">{stats.lowStockProducts}</div>
            <Link href="/supplier/inventory" className="text-[10px] text-slate-400 hover:text-white underline">
              Restock inventory →
            </Link>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Customer Rating</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.rating > 0 ? `${stats.rating} ★` : 'No ratings'}</div>
            <span className="text-[10px] text-slate-400">{stats.totalRatings} Customer reviews</span>
          </div>
        </div>

        {/* Quick Operational Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/supplier/orders"
            className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Order Management</h3>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <p className="text-xs text-slate-400">
              Confirm incoming customer orders, prepare items, and mark ready for pickup.
            </p>
          </Link>

          <Link
            href="/supplier/products"
            className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Inventory & Catalog</h3>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <p className="text-xs text-slate-400">
              Edit unit prices, stock counts, discounts, and toggle active status ({stats.activeProducts} Active Products).
            </p>
          </Link>

          <Link
            href="/supplier/verification"
            className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Verification Status</h3>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">
              Upload GST, Business License & PAN documents for Verified Supplier status.
            </p>
          </Link>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" /> Incoming Orders Queue
            </h3>
            <Link href="/supplier/orders" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">
              View All Orders →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading incoming orders...</div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No active orders found in database.</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-bold text-sm text-white">{o.orderNumber}</span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Customer: {o.customer?.user?.name || 'Customer'} • Total: ₹{o.totalAmount}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
                      {o.status.replace(/_/g, ' ')}
                    </span>
                    <Link
                      href={`/supplier/orders/${o.id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition"
                    >
                      Process →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SupplierLayout>
  );
}
