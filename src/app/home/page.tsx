'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Star,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  Store,
  MapPin,
  TrendingUp,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import SupplierComparisonModal from '@/components/common/SupplierComparisonModal';
import { AIAssistantWidget } from '@/components/ai/AIAssistantWidget';

export default function HomePage() {
  const router = useRouter();
  const { user, refreshCartCount } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<any>(null);

  // Modal State for Smart Supplier Comparison
  const [comparisonModal, setComparisonModal] = useState<{
    productName: string;
    productImage: string;
    suppliers: any[];
  } | null>(null);

  const CATEGORY_TILES = [
    {
      name: 'Fresh Produce',
      slug: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
      badge: 'Farm Fresh',
    },
    {
      name: 'Dairy & Bakery',
      slug: 'dairy-bread-eggs',
      image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=400&q=80',
      badge: 'Daily Essentials',
    },
    {
      name: 'Snacks & Drinks',
      slug: 'snacks-beverages',
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=400&q=80',
      badge: 'Quick Munch',
    },
    {
      name: 'Meat & Seafood',
      slug: 'meat-seafood',
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80',
      badge: 'Chilled',
    },
    {
      name: 'Home & Cleaning',
      slug: 'home-cleaning',
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80',
      badge: 'Household',
    },
    {
      name: 'Pharmacy & Care',
      slug: 'pharmacy-wellness',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
      badge: '24/7 Wellness',
    },
  ];

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories & products
      const url = selectedCategory ? `/api/products?category=${selectedCategory}` : '/api/products';
      const res = await fetch(url);
      const data = await res.json();
      if (data.products) setProducts(data.products);

      // Fetch active order for tracker banner
      if (user) {
        const orderRes = await fetch('/api/orders');
        const orderData = await orderRes.json();
        if (orderData.orders && orderData.orders.length > 0) {
          const active = orderData.orders.find(
            (o: any) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
          );
          if (active) setActiveOrder(active);
        }
      }
    } catch (error) {
      console.error('Fetch home data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (supplierProductId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierProductId, quantity: 1 }),
      });
      if (res.ok) {
        await refreshCartCount();
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  const handleDirectContact = async (supplierId: string, supplierName: string, productName?: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const msg = productName
        ? `Hi ${supplierName}! Is "${productName}" available for fast delivery today?`
        : `Hi ${supplierName}! I am browsing your store products on SupplyBridge.`;

      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, initialMessage: msg }),
      });

      const data = await res.json();
      if (res.ok && data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      }
    } catch (error) {
      console.error('Contact supplier error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-slate-100">
      {/* Active Order Quick Tracker Banner */}
      {activeOrder && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 p-4 rounded-2xl border border-emerald-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-lg shrink-0">
              🚚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Active Order in Progress
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {activeOrder.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm font-bold text-white">
                Order #{activeOrder.orderNumber} • ₹{activeOrder.totalAmount}
              </p>
            </div>
          </div>

          <Link
            href={`/orders/${activeOrder.id}`}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition self-start md:self-auto"
          >
            <span>Live Map Track</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Hero Showcase Banner with Rich Graphics */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 md:p-10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Direct Supplier Quick-Commerce Platform</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Order Directly From <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Verified Local Stores
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Compare live prices across nearby suppliers, check real-time stock, chat directly with local sellers, and get your items delivered in 15-30 minutes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/ai-assistant"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/25"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>AI Shopping Assistant</span>
              </Link>

              <Link
                href="/search"
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center gap-2 transition"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Browse Products</span>
              </Link>

              <Link
                href="/messages"
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Direct Supplier Chat</span>
              </Link>
            </div>
          </div>

          {/* Graphic Image Cards Showcase */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 relative">
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 h-44 shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"
                  alt="Fresh Vegetables"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Farm Direct</span>
                  <p className="text-xs font-bold text-white">Fresh Grocery</p>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 h-32 shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80"
                  alt="Snacks & Drinks"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-teal-400 uppercase">15 Min Delivery</span>
                  <p className="text-xs font-bold text-white">Snacks & Drinks</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 h-32 shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=400&q=80"
                  alt="Dairy & Bread"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Daily Fresh</span>
                  <p className="text-xs font-bold text-white">Dairy & Eggs</p>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 h-44 shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80"
                  alt="Household Essentials"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Verified Stores</span>
                  <p className="text-xs font-bold text-white">Household Care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Image Tiles Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Explore Top Marketplace Categories</span>
            </h2>
            <p className="text-xs text-slate-400">Discover live items across nearby verified supplier stores</p>
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Show All
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORY_TILES.map((cat) => (
            <div
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`cursor-pointer rounded-2xl overflow-hidden border transition group relative h-36 ${
                selectedCategory === cat.slug
                  ? 'border-emerald-500 ring-2 ring-emerald-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-bold text-emerald-400 uppercase">{cat.badge}</span>
                <h3 className="font-bold text-xs text-white leading-tight">{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Catalog Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <span>Featured Marketplace Products</span>
            </h2>
            <p className="text-xs text-slate-400">
              Comparing prices and available stock across multiple local verified stores
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-12">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-slate-900 rounded-2xl animate-pulse border border-slate-800"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => {
              const bestSupplier = p.suppliers[0];
              if (!bestSupplier) return null;

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden flex flex-col justify-between group p-3.5 space-y-3 transition hover:border-slate-700 hover:shadow-xl"
                >
                  {/* Image & Supplier Comparison Trigger */}
                  <div className="relative aspect-square rounded-xl bg-slate-950 overflow-hidden border border-slate-800">
                    <img
                      src={p.primaryImage || '/placeholder-product.png'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Multi-Supplier Badge Button */}
                    <button
                      onClick={() =>
                        setComparisonModal({
                          productName: p.name,
                          productImage: p.primaryImage,
                          suppliers: p.suppliers,
                        })
                      }
                      className="absolute top-2 left-2 bg-slate-950/90 hover:bg-slate-900 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 backdrop-blur-md transition shadow-md"
                    >
                      <Layers className="w-3 h-3 text-emerald-400" />
                      <span>{p.suppliersCount} Stores Compared</span>
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {p.categoryName}
                    </span>
                    <h3 className="font-bold text-xs text-white line-clamp-2 leading-snug">
                      {p.name}
                    </h3>

                    {/* Best Supplier Tag */}
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[110px] font-medium text-slate-300">
                          {bestSupplier.supplierName}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 font-bold shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{bestSupplier.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-white">
                          ₹{bestSupplier.finalPrice}
                        </span>
                        {bestSupplier.discountPercent > 0 && (
                          <span className="text-[10px] text-slate-500 line-through">
                            ₹{bestSupplier.price}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        ~{bestSupplier.estimatedDeliveryMinutes} mins
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Direct Contact Icon Button */}
                      <button
                        onClick={() =>
                          handleDirectContact(
                            bestSupplier.supplierId,
                            bestSupplier.supplierName,
                            p.name
                          )
                        }
                        className="p-2 rounded-xl bg-teal-950/80 border border-teal-500/30 text-teal-400 hover:bg-teal-900 transition"
                        title="Contact Supplier Directly"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* Add to Cart */}
                      <button
                        onClick={() => handleAddToCart(bestSupplier.supplierProductId)}
                        className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-md shadow-emerald-500/20"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Smart Multi-Supplier Comparison Modal */}
      {comparisonModal && (
        <SupplierComparisonModal
          productName={comparisonModal.productName}
          productImage={comparisonModal.productImage}
          suppliers={comparisonModal.suppliers}
          onClose={() => setComparisonModal(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Floating AI Shopping Assistant Entry Point */}
      <AIAssistantWidget />
    </div>
  );
}
