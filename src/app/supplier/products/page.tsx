'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import Link from 'next/link';
import { Package, Plus, Search, Filter, Edit, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPercent: number;
  stockQuantity: number;
  unit: string;
  status: string;
  category: { name: string };
  images: { url: string }[];
}

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/supplier/products');
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load supplier products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await fetch('/api/supplier/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SupplierLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-emerald-400" /> Catalog & Product Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage product listings, pricing, discounts, and active availability.
            </p>
          </div>

          <Link
            href="/supplier/products/new"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-3 rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No products listed</h3>
            <p className="text-xs text-slate-400 mt-1">Click "Add Product" above to create your first store listing.</p>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                        <img
                          src={p.images[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                        />
                        <div>
                          <span className="block font-bold text-white">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{p.category?.name || 'General'}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{p.sku}</td>
                      <td className="px-6 py-4 font-bold text-white">₹{p.price}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold ${
                            p.stockQuantity < 5 ? 'text-rose-400' : 'text-slate-200'
                          }`}
                        >
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(p.id, p.status)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {p.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStatus(p.id, p.status)}
                          className="text-xs font-bold text-emerald-400 hover:underline"
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SupplierLayout>
  );
}
