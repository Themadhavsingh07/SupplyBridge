import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';

export const metadata: Metadata = {
  title: 'SupplyBridge | Direct Supplier Quick-Commerce Marketplace',
  description: 'Order fresh groceries, dairy, snacks & daily essentials directly from verified local suppliers with live chat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">
        <AuthProvider>
          <Header />
          <main className="flex-1 pb-20 md:pb-8">{children}</main>
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
