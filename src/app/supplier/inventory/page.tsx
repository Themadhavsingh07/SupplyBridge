'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import { Boxes, AlertTriangle, RefreshCw, CheckCircle2, ArrowUpDown } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  unit: string;
  status: string;
}

export default function SupplierInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await fetch('/api/supplier/products');
        const data = await res.json();
        if (data.products) {
          setItems(data.products);
        }
      } catch (err) {
        console.error('Failed to load inventory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, []);

  const handleUpdateStock = async (id: string) => {
    try {
      await fetch('/api/supplier/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stockQuantity: newStock }),
      });
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, stockQuantity: newStock } : i))
      );
      setAdjustingId(null);
    } catch (err) {
      console.error('Update stock error:', err);
    }
  };

  const lowStockItems = items.filter((i) => i.stockQuantity < 5);

  return (
    <SupplierLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Boxes className="w-6 h-6 text-emerald-400" /> Inventory & Stock Control
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor current inventory levels, adjust stock counts, and handle low-stock alerts.
            </p>
          </div>
        </div>

        {/* Low Stock Banner */}
        {lowStockItems.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center gap-3 text-rose-300 text-xs font-bold">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              {lowStockItems.length} product(s) currently below low-stock threshold (&lt;5 units).
            </span>
          </div>
        )}

        {/* Inventory List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Selling Price</th>
                    <th className="px-6 py-4">Current Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-bold text-white">{item.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{item.sku}</td>
                      <td className="px-6 py-4 font-bold text-white">₹{item.price}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${
                            item.stockQuantity < 5
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {item.stockQuantity} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {adjustingId === item.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              min={0}
                              value={newStock}
                              onChange={(e) => setNewStock(Number(e.target.value))}
                              className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                            />
                            <button
                              onClick={() => handleUpdateStock(item.id)}
                              className="bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-lg"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAdjustingId(item.id);
                              setNewStock(item.stockQuantity);
                            }}
                            className="text-xs font-bold text-emerald-400 hover:underline"
                          >
                            Adjust Stock
                          </button>
                        )}
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
