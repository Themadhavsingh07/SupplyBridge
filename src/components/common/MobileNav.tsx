'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', href: '/home', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Orders', href: '/orders', icon: ShoppingBag },
    { label: 'Messages', href: '/messages', icon: MessageSquare, highlight: true },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium transition ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : item.highlight
                  ? 'text-teal-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
