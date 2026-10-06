'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import {
  MapPin,
  Search,
  ShoppingCart,
  MessageSquare,
  Sparkles,
  User as UserIcon,
  Store,
  Bike,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Bell,
} from 'lucide-react';
import AiAssistantModal from './AiAssistantModal';

export default function Header() {
  const router = useRouter();
  const { user, cartCount, location, setLocation, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Fetch unread messages & notifications
      fetch('/api/chat/conversations')
        .then((res) => res.json())
        .then((data) => {
          if (data.conversations) {
            const totalUnread = data.conversations.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
            setUnreadChatCount(totalUnread);
          }
        })
        .catch(() => {});

      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (data.unreadCount !== undefined) {
            setUnreadNotifCount(data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Vision Differentiator */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                SB
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Supply<span className="text-emerald-400">Bridge</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Direct Supplier Marketplace
                  </span>
                </div>
              </div>
            </Link>

            {/* Location Selector */}
            <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs cursor-pointer hover:border-slate-700 transition">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="max-w-[150px] truncate text-slate-300 font-medium">
                {location}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>

          {/* Search Bar with AI Assistant Launcher */}
          <div className="flex-1 max-w-lg mx-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder='Search "organic milk", "fresh fruits", "snacks under 300"...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2 pl-9 pr-24 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3" />
              
              <button
                type="button"
                onClick={() => setIsAiOpen(true)}
                className="absolute right-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition shadow-sm"
              >
                <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                <span>AI Assist</span>
              </button>
            </form>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            
            {/* Core Feature: Direct Supplier Chat Button */}
            <Link
              href="/messages"
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 transition flex items-center gap-1.5 group"
              title="Direct Supplier Chat"
            >
              <MessageSquare className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline text-xs font-semibold">Supplier Chat</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {unreadChatCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {user && (
              <Link
                href="/notifications"
                className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </Link>
            )}

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 transition flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold">Cart</span>
              {cartCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-xs font-black px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Dashboard Selector */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden md:inline text-xs font-medium text-slate-200 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-2xl py-2 hidden group-hover:block z-50 border border-slate-800">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold uppercase">{user.role}</p>
                  </div>

                  {user.role === 'SUPPLIER' && (
                    <Link
                      href="/supplier/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-emerald-950/50 hover:text-emerald-400 transition"
                    >
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>Supplier Dashboard</span>
                    </Link>
                  )}

                  {user.role === 'DELIVERY_PARTNER' && (
                    <Link
                      href="/delivery/orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-emerald-950/50 hover:text-emerald-400 transition"
                    >
                      <Bike className="w-4 h-4 text-emerald-400" />
                      <span>Delivery Dashboard</span>
                    </Link>
                  )}

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-emerald-950/50 hover:text-emerald-400 transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span>Admin Console</span>
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>My Account</span>
                  </Link>

                  <Link
                    href="/orders"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>My Orders</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition border-t border-slate-800 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-emerald-500/10"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* AI Assistant Modal */}
      {isAiOpen && <AiAssistantModal onClose={() => setIsAiOpen(false)} />}
    </>
  );
}
