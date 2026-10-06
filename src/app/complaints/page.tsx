'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Plus, Clock, CheckCircle2, MessageSquare, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function ComplaintsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [category, setCategory] = useState('DAMAGED_PRODUCT');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints');
      const data = await res.json();
      if (res.ok && data.complaints) setComplaints(data.complaints);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDescription('');
        setIsNewOpen(false);
        fetchComplaints();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      <div className="flex items-center justify-between glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">Dispute & Complaint Portal</h1>
          <p className="text-xs text-slate-400">Escalate issues directly to Supplier, Support Agent or Admin</p>
        </div>

        <button
          onClick={() => setIsNewOpen(!isNewOpen)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Ticket</span>
        </button>
      </div>

      {isNewOpen && (
        <form onSubmit={handleCreateComplaint} className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
          <h3 className="font-bold text-sm text-white">New Dispute Ticket</h3>
          
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="WRONG_PRODUCT">Wrong Product Delivered</option>
              <option value="DAMAGED_PRODUCT">Damaged / Expired Product</option>
              <option value="MISSING_PRODUCT">Missing Item from Order</option>
              <option value="LATE_DELIVERY">Late Delivery Delay</option>
              <option value="PAYMENT_ISSUE">Payment / Refund Issue</option>
              <option value="SUPPLIER_ISSUE">Supplier Behavior Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Issue Description</label>
            <textarea
              required
              rows={3}
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            Submit Ticket
          </button>
        </form>
      )}

      {/* Ticket List */}
      <div className="space-y-3">
        {complaints.map((ticket) => (
          <div key={ticket.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{ticket.ticketNumber}</span>
                <span className="text-[10px] bg-slate-800 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-slate-700">
                  {ticket.category.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400">{ticket.status}</span>
            </div>

            <p className="text-xs text-slate-300">{ticket.description}</p>
            <div className="text-[10px] text-slate-500 pt-1">
              Raised on {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
