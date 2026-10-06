'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ArrowLeft, RefreshCw, AlertTriangle, PlusCircle, MinusCircle } from 'lucide-react';

export default function SupplierSingleInventoryPage({ params }: { params: { productId: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quantityChange, setQuantityChange] = useState<number>(10);
  const [reason, setReason] = useState<string>('Stock Restock Shipment');
  const [newThreshold, setNewThreshold] = useState<number>(5);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/supplier/products/${params.productId}`);
      const data = await res.json();
      if (data.product) {
        setProduct(data.product);
        setNewThreshold(data.product.lowStockThreshold || 5);
      } else {
        setError(data.error || 'Product not found');
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [params.productId]);

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjusting(true);
    setError(null);

    try {
      const res = await fetch(`/api/supplier/inventory/${params.productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantityChange,
          reason,
          newThreshold,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update stock');
      }

      fetchProduct();
    } catch (err: any) {
      setError(err.message || 'Stock adjustment failed');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) {
    return (
      <SupplierLayout>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-xs text-slate-400">Loading inventory details...</div>
      </SupplierLayout>
    );
  }

  if (error || !product) {
    return (
      <SupplierLayout>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold">
            {error || 'Product not found'}
          </div>
          <Link href="/supplier/inventory" className="text-xs font-bold text-emerald-400 hover:underline">
            ← Back to Inventory Dashboard
          </Link>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Link href="/supplier/inventory" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Inventory Dashboard
        </Link>

        {/* Product Summary */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{product.category?.name}</span>
            <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
          </div>
          <h1 className="text-2xl font-black text-white">{product.name}</h1>
          <div className="flex items-center gap-6 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div>Current Stock: <strong className="text-emerald-400 text-sm">{product.stockQuantity} {product.unit}</strong></div>
            <div>Low Threshold: <strong className="text-white text-sm">{product.lowStockThreshold} units</strong></div>
          </div>
        </div>

        {/* Adjustment Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-400" /> Stock Adjustment & Restock
          </h2>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleStockAdjustment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Stock Quantity Change (+ to Restock, - for Spoilage / Correction)
              </label>
              <input
                type="number"
                value={quantityChange}
                onChange={(e) => setQuantityChange(parseInt(e.target.value, 10) || 0)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Reason for Adjustment</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Supplier Shipment Restock, Damaged Inventory Write-off"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Low Stock Threshold Level</label>
              <input
                type="number"
                value={newThreshold}
                onChange={(e) => setNewThreshold(parseInt(e.target.value, 10) || 1)}
                min={1}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={adjusting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${adjusting ? 'animate-spin' : ''}`} />
              <span>{adjusting ? 'Updating Stock...' : 'Commit Stock Adjustment'}</span>
            </button>
          </form>
        </div>
      </div>
    </SupplierLayout>
  );
}
