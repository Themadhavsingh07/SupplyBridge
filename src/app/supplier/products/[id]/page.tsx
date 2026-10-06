'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import Link from 'next/link';
import { Package, ArrowLeft, Edit, AlertTriangle, CheckCircle2, History } from 'lucide-react';

export default function SupplierProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/supplier/products/${params.id}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
        } else {
          setError(data.error || 'Product not found');
        }
      } catch (err) {
        setError('Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <SupplierLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-slate-400">Loading product...</div>
      </SupplierLayout>
    );
  }

  if (error || !product) {
    return (
      <SupplierLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold">
            {error || 'Product not found'}
          </div>
          <Link href="/supplier/products" className="text-xs font-bold text-emerald-400 hover:underline">
            ← Back to Products List
          </Link>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/supplier/products" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
          <Link
            href={`/supplier/products/${product.id}/edit`}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <Edit className="w-4 h-4" /> Edit Product
          </Link>
        </div>

        {/* Product Summary Panel */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                {product.category?.name || 'General Product'}
              </span>
              <h1 className="text-2xl font-black text-white">{product.name}</h1>
              <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                product.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {product.status}
            </span>
          </div>

          <p className="text-xs text-slate-300">{product.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Selling Price</span>
              <span className="font-bold text-emerald-400 text-base">₹{Number(product.price)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">MRP</span>
              <span className="font-bold text-white text-base">₹{Number(product.mrp || product.price)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Stock Level</span>
              <span className={`font-bold text-base ${product.stockQuantity <= product.lowStockThreshold ? 'text-rose-400' : 'text-white'}`}>
                {product.stockQuantity} {product.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Low Threshold</span>
              <span className="font-bold text-white text-base">{product.lowStockThreshold} units</span>
            </div>
          </div>
        </div>

        {/* Variants List */}
        {product.variants?.length > 0 && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="font-bold text-sm text-white">Product Variants ({product.variants.length})</h2>
            <div className="divide-y divide-slate-800">
              {product.variants.map((v: any) => (
                <div key={v.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{v.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">SKU: {v.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 block">₹{Number(v.price || product.price)}</span>
                    <span className="text-[10px] text-slate-400">Stock: {v.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Audit Logs */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" /> Recent Inventory Logs
          </h2>
          {product.inventoryLogs?.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">No stock logs recorded.</div>
          ) : (
            <div className="space-y-2">
              {product.inventoryLogs?.map((log: any) => (
                <div key={log.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{log.reason || 'Stock Update'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Previous: {log.previousQuantity} → Change: {log.changeQuantity > 0 ? `+${log.changeQuantity}` : log.changeQuantity} → New: {log.newQuantity}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SupplierLayout>
  );
}
