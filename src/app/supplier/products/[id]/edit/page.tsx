'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ArrowLeft, Save } from 'lucide-react';

export default function SupplierEditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    mrp: 0,
    discount: 0,
    unit: '',
    lowStockThreshold: 5,
    isActive: true,
  });

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/supplier/products/${params.id}`);
        const data = await res.json();
        if (data.product) {
          const p = data.product;
          setForm({
            name: p.name || '',
            description: p.description || '',
            price: Number(p.price) || 0,
            mrp: Number(p.mrp || p.price) || 0,
            discount: Number(p.discountPercent) || 0,
            unit: p.unit || '',
            lowStockThreshold: p.lowStockThreshold || 5,
            isActive: p.status === 'ACTIVE',
          });
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/supplier/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      router.push(`/supplier/products/${params.id}`);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SupplierLayout>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-xs text-slate-400">Loading product editor...</div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Link href={`/supplier/products/${params.id}`} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Cancel & Return
        </Link>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-black text-white">Edit Product Details</h1>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min={1}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">MRP (₹)</label>
                <input
                  type="number"
                  name="mrp"
                  value={form.mrp}
                  onChange={handleChange}
                  required
                  min={1}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Unit Specification</label>
                <input
                  type="text"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={form.lowStockThreshold}
                  onChange={handleChange}
                  required
                  min={1}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating Product...' : 'Save Product Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </SupplierLayout>
  );
}
