'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
      } else {
        await refreshUser();
        if (data.user.role === 'SUPPLIER') router.push('/supplier/dashboard');
        else if (data.user.role === 'DELIVERY_PARTNER') router.push('/delivery/orders');
        else if (data.user.role === 'ADMIN') router.push('/admin');
        else router.push('/home');
      }
    } catch {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg shadow-emerald-500/20">
              SB
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-400">Sign in to contact verified local suppliers directly</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick One-Click Demo Sign In:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                onClick={() => handleDemoLogin('customer@supplybridge.com')}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-semibold text-center transition"
              >
                Customer
              </button>
              <button
                onClick={() => handleDemoLogin('supplier@supplybridge.com')}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-semibold text-center transition"
              >
                Supplier
              </button>
              <button
                onClick={() => handleDemoLogin('delivery@supplybridge.com')}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-teal-400 font-semibold text-center transition"
              >
                Rider
              </button>
              <button
                onClick={() => handleDemoLogin('admin@supplybridge.com')}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-indigo-400 font-semibold text-center transition"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2">
            Don't have an account?{' '}
            <Link href="/register" className="text-emerald-400 font-bold hover:underline">
              Register now
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
