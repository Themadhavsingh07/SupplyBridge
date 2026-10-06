'use client';

import React, { useState } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AddSupplierProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('clw123456');
  const [price, setPrice] = useState(100);
  const [mrp, setMrp] = useState(120);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [stockQuantity, setStockQuantity] = useState(50);
  const [unit, setUnit] = useState('1 pc');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/supplier/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || 'Fresh supplier listing',
          categoryId,
          price: Number(price),
          discountPercent: Number(discountPercent),
          stockQuantity: Number(stockQuantity),
          unit,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/supplier/products');
      } else {
        setErrorMsg(data.error || 'Failed to create product');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Product creation exception');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SupplierLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Link href="/supplier/products" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Products Catalog
        </Link>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
          <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
            <Package className="w-6 h-6 text-emerald-400" /> Add New Store Product
          </h1>
          <p className="text-xs text-slate-400 mb-6">Create a new product listing available for customer purchase.</p>

          {errorMsg && (
            <div className="p-3 mb-6 rounded-xl bg-rose-950 border border-rose-800 text-rose-400 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Organic Cow Milk 1L"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe product freshness, sourcing, and specs..."
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Selling Price (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">MRP (₹)</label>
                <input
                  type="number"
                  value={mrp}
                  onChange={(e) => setMrp(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Discount (%)</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Pack Size Unit</label>
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. 500 ml, 1 kg, Pack of 2"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Initial Stock Quantity</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Link href="/supplier/products" className="px-5 py-3 text-xs font-bold text-slate-400 hover:text-white">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                {submitting ? 'Creating Product...' : 'Publish Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SupplierLayout>
  );
}
