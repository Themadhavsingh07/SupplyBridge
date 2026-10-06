'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Layers, Plus, FolderTree } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          parentId: parentId || null,
        }),
      });

      if (res.ok) {
        setName('');
        setSlug('');
        setParentId('');
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create category');
      }
    } catch (err) {
      alert('Category creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Taxonomy Structure</span>
          <h1 className="text-2xl font-black text-white">Category Hierarchy</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Category Form */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Create New Category
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Fresh Vegetables"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="fresh-vegetables"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Parent Category (Optional)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20"
              >
                {submitting ? 'Creating...' : 'Save Category'}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" /> Existing Category Hierarchy
            </h3>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No categories created yet.</div>
              ) : (
                categories.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-white block">{c.name}</span>
                      <span className="text-xs font-mono text-slate-400">/{c.slug}</span>
                      {c.parent && (
                        <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">
                          Parent: {c.parent.name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                      {c._count?.products || 0} Products
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
