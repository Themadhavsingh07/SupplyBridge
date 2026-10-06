'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { subscribeToConversation, broadcastNewMessage } from '@/lib/supabase';
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  Send,
  Image as ImageIcon,
  ShoppingBag,
  Clock,
  CheckCheck,
  MoreVertical,
  Loader2,
  Paperclip,
  Check,
} from 'lucide-react';

export default function ChatThreadPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const router = useRouter();
  const { user } = useAuth();

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "Is this product currently available in stock?",
    "I need 10 pieces. Can you provide a bulk discount?",
    "Please ensure fragile glass packaging is insulated.",
    "What is the estimated delivery time for Indiranagar?",
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchThread();

    // Supabase Realtime Subscription for Live Chat
    const unsubscribe = subscribeToConversation(conversationId, (newMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchThread = async () => {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      const data = await res.json();
      if (res.ok) {
        setConversation(data.conversation);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Fetch thread error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          text,
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        setInputMessage('');

        // Broadcast realtime message to conversation channel
        broadcastNewMessage(conversationId, data.message);
      }
    } catch (error) {
      console.error('Send message failed:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        <span>Loading direct supplier chat...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 flex flex-col h-[85vh]">
      {/* Supplier Store Header Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between shrink-0 mb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-extrabold flex items-center justify-center shrink-0">
            {conversation?.supplierName?.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-white">{conversation?.supplierName}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified Supplier
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Owner: {conversation?.supplierOwner}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{conversation?.supplierRating} ★</span>
              <span>•</span>
              <span className={conversation?.isSupplierAvailable ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {conversation?.isSupplierAvailable ? 'Online' : 'Offline'}
              </span>
            </p>
          </div>
        </div>

        {conversation?.orderNumber && (
          <Link
            href={`/orders/${conversation.orderId}`}
            className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-bold px-3 py-1.5 rounded-xl transition hidden sm:inline-flex items-center gap-1"
          >
            <span>Order #{conversation.orderNumber}</span>
          </Link>
        )}
      </div>

      {/* Messages Scroll Thread */}
      <div className="flex-1 overflow-y-auto glass-panel p-4 rounded-2xl border border-slate-800 space-y-4 mb-3">
        {/* Verification Safety Card */}
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center text-xs text-slate-400 max-w-md mx-auto space-y-1">
          <p className="font-bold text-slate-300">Direct Customer-Supplier Secure Thread</p>
          <p className="text-[11px] text-slate-500">Messages are monitored for quality assurance and buyer protection.</p>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs space-y-1.5 ${
                  isMe
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-slate-950 font-medium rounded-br-none shadow-md shadow-emerald-600/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                }`}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                    {msg.senderRole}
                  </span>
                )}

                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {msg.imageAttachment && (
                  <img
                    src={msg.imageAttachment}
                    alt="Attachment"
                    className="w-full max-h-48 rounded-xl object-cover border border-slate-800 mt-2"
                  />
                )}

                <div className={`flex items-center justify-end gap-1 text-[10px] ${isMe ? 'text-slate-950/70 font-bold' : 'text-slate-500'}`}>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-slate-950" /> : <Check className="w-3.5 h-3.5 text-slate-950/70" />)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
        {quickReplies.map((qr, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qr)}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 px-3 py-1.5 rounded-xl whitespace-nowrap transition"
          >
            "{qr}"
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="relative flex items-center shrink-0">
        <input
          type="text"
          placeholder="Type your message to supplier..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-4 pr-14 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />

        <button
          disabled={sending || !inputMessage.trim()}
          onClick={() => handleSendMessage()}
          className="absolute right-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 p-2 rounded-xl transition shadow-md shadow-emerald-500/20"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
