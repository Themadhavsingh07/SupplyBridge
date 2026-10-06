'use client';

import React, { useState } from 'react';
import { Search, Bell, Shield, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="h-16 bg-slate-900/60 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Admin Search Input */}
        <form onSubmit={handleSearch} className="relative w-64 sm:w-80 lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global Search (Users, Orders, Suppliers...)"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />

          {/* Search Dropdown Modal */}
          {searchResults && (
            <div className="absolute top-12 left-0 right-0 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Search Results</span>
                <button onClick={() => setSearchResults(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {searchResults.users?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Users</span>
                  {searchResults.users.map((u: any) => (
                    <Link
                      key={u.id}
                      href={`/admin/users/${u.id}`}
                      onClick={() => setSearchResults(null)}
                      className="block p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200"
                    >
                      {u.name} ({u.role}) • {u.email || u.phone}
                    </Link>
                  ))}
                </div>
              )}

              {searchResults.orders?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Orders</span>
                  {searchResults.orders.map((o: any) => (
                    <Link
                      key={o.id}
                      href={`/admin/orders/${o.id}`}
                      onClick={() => setSearchResults(null)}
                      className="block p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200"
                    >
                      {o.orderNumber} • ₹{o.totalAmount} ({o.status})
                    </Link>
                  ))}
                </div>
              )}

              {searchResults.suppliers?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Suppliers</span>
                  {searchResults.suppliers.map((s: any) => (
                    <Link
                      key={s.id}
                      href={`/admin/suppliers/${s.id}`}
                      onClick={() => setSearchResults(null)}
                      className="block p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200"
                    >
                      {s.businessName} ({s.verificationStatus})
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Admin User Profile Header Info */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/notifications"
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1 animate-pulse"></span>
        </Link>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-bold text-white block leading-tight">Admin System</span>
            <span className="text-[10px] font-mono text-emerald-400 block">SUPERUSER</span>
          </div>
        </div>
      </div>
    </header>
  );
}
