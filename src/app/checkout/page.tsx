'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, Banknote, Wallet, CheckCircle2, ArrowRight, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, refreshCartCount } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD' | 'WALLET'>('ONLINE');
  const [tipAmount, setTipAmount] = useState<number>(20);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetch('/api/cart')
      .then((res) => res.json())
      .then((data) => setCart(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          tipAmount,
          deliveryAddress: {
            street: 'Flat 402, Sunshine Heights, MG Road',
            city: 'Bengaluru',
            postalCode: '560001',
            label: 'Home',
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.orderId) {
        await refreshCartCount();
        router.push(`/orders/${data.orderId}`);
      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-400">Loading checkout details...</div>;
  }

  const grandTotal = cart ? cart.totalAmount + tipAmount : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-2xl font-black text-white">Checkout & Delivery</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 space-y-5">
          
          {/* Address Section */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Delivery Address</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">Home (Default)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Flat 402, Sunshine Heights, MG Road, Indiranagar, Bengaluru - 560001
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">Select Payment Method</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-2 transition ${
                  paymentMethod === 'ONLINE'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white">Razorpay Online</div>
                  <div className="text-[10px] text-slate-400">Cards, UPI, Netbanking</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-2 transition ${
                  paymentMethod === 'COD'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Banknote className="w-5 h-5 text-teal-400" />
                <div>
                  <div className="text-xs font-bold text-white">Cash on Delivery</div>
                  <div className="text-[10px] text-slate-400">Pay at doorstep</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('WALLET')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-2 transition ${
                  paymentMethod === 'WALLET'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Wallet className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold text-white">SupplyBridge Wallet</div>
                  <div className="text-[10px] text-slate-400">Balance: ₹{user?.cashbackBalance || 120}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Partner Tip */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white">Add Delivery Partner Tip</h3>
            <div className="flex gap-2">
              {[10, 20, 30, 50].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTipAmount(amt)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    tipAmount === amt
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Total Summary & Confirm */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 h-fit">
          <h3 className="font-extrabold text-white border-b border-slate-800 pb-3">Final Payment Summary</h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Cart Amount</span>
              <span>₹{cart?.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Rider Tip</span>
              <span>₹{tipAmount}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
              <span>Total Payable</span>
              <span className="text-emerald-400">₹{grandTotal}</span>
            </div>
          </div>

          <button
            disabled={submitting}
            onClick={handlePlaceOrder}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Place Order & Pay ₹{grandTotal}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-500 text-center">
            By clicking place order, your order is instantly sent to the verified supplier for preparation.
          </p>
        </div>

      </div>
    </div>
  );
}
