'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <Link href="/login" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <h1 className="text-2xl font-black text-white tracking-tight">Reset Password</h1>
        <p className="text-xs text-slate-400 mt-1">Enter your registered email to receive a password reset link.</p>

        {sent ? (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" /> Password reset link sent! Check your email inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
              <div className="relative mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@supplybridge.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3 rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
