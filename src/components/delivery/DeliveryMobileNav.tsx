'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Compass, DollarSign, History } from 'lucide-react';

export default function DeliveryMobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/delivery/dashboard', icon: LayoutDashboard },
    { name: 'Requests', href: '/delivery/orders', icon: ShoppingBag },
    { name: 'Live GPS', href: '/delivery/tracking', icon: Compass },
    { name: 'Earnings', href: '/delivery/earnings', icon: DollarSign },
    { name: 'History', href: '/delivery/history', icon: History },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
