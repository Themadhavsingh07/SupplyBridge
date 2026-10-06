'use client';

import React, { useState, useEffect, use } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Package, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        const data = await res.json();
        if (data.product) setProduct(data.product);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-slate-800 rounded-xl"></div>
          <div className="h-48 bg-slate-900 rounded-3xl"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-16 space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Product Not Found</h2>
          <Link href="/admin/products" className="text-emerald-400 font-bold text-xs hover:underline">
            ← Back to Products
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black text-2xl">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{product.name}</h1>
              <p className="text-xs text-slate-400">
                Supplier: {product.supplier?.businessName} • Price: ₹{product.price}
              </p>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
            {product.status}
          </span>
        </div>
      </div>
    </AdminLayout>
  );
}
