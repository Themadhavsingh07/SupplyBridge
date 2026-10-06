'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, ArrowRight, Tag, Plus, Minus, Store } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function CartPage() {
  const router = useRouter();
  const { refreshCartCount } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (res.ok && data) {
        setCart(data);
      } else {
        setCart({ items: [] });
      }
    } catch (error) {
      console.error(error);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (supplierProductId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierProductId, quantity: 1 }),
      });
      fetchCart();
      refreshCartCount();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await fetch(`/api/cart?cartItemId=${cartItemId}`, { method: 'DELETE' });
      fetchCart();
      refreshCartCount();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400 text-xs">
        Loading cart...
      </div>
    );
  }

  const items = Array.isArray(cart?.items) ? cart.items : [];

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">
          Discover fresh items from verified local suppliers and add them to your cart.
        </p>
        <Link
          href="/home"
          className="inline-flex px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-2xl font-black text-white">My Quick-Commerce Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item: any) => (
            <div
              key={item.cartItemId}
              className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={item.productImage || '/placeholder-product.png'}
                  alt={item.productName}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-800"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white">{item.productName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {item.supplierName} ({item.supplierRating}★)
                    </span>
                  </div>
                  <div className="text-xs font-bold text-emerald-400">
                    ₹{item.finalUnitPrice} / {item.unit}
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => handleUpdateQuantity(item.supplierProductId, item.quantity - 1)}
                    className="p-1 hover:text-emerald-400"
                  >
                    <Minus className="w-3.5 h-3.5 text-slate-300" />
                  </button>
                  <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.supplierProductId, item.quantity + 1)}
                    className="p-1 hover:text-emerald-400"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-300" />
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.cartItemId)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 h-fit">
          <h2 className="text-base font-extrabold text-white border-b border-slate-800 pb-3">
            Bill Details
          </h2>

          {/* Coupon input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply Coupon</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="WELCOME50"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => setAppliedCoupon(couponInput)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl transition"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span>₹{cart?.subtotal || 0}</span>
            </div>
            {cart?.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Product Discount</span>
                <span>-₹{cart.totalDiscount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Partner Fee</span>
              <span>₹{cart?.deliveryFee || 0}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-teal-400 font-medium">
                <span>Coupon ({appliedCoupon})</span>
                <span>Applied</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
              <span>To Pay</span>
              <span className="text-emerald-400">₹{cart?.totalAmount || 0}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
