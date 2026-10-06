'use client';

import React, { useState, useEffect, useRef } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function DeliveryChatRoomPage({ params }: { params: { conversationId: string } }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${params.conversationId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    fetchMessages();

    const supabase = getSupabaseBrowserClient();
    const channelName = `conversation:${params.conversationId}`;
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'CHAT_MESSAGE_CREATED' }, (payload: any) => {
        if (payload.payload?.message) {
          setMessages((prev) => [...prev, payload.payload.message]);
          scrollToBottom();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const content = inputMessage.trim();
    setInputMessage('');

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: params.conversationId,
          content,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <DeliveryLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-6rem)]">
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Link href="/delivery/messages" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-white">Customer Delivery Chat</h1>
              <span className="text-[10px] text-emerald-400 font-bold">🟢 Live Realtime Channel</span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No messages in conversation yet.</div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                      isMine
                        ? 'bg-emerald-600 text-slate-950 font-medium rounded-br-none'
                        : 'bg-slate-950 border border-slate-800 text-white rounded-bl-none'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span className={`text-[9px] block text-right font-mono ${isMine ? 'text-slate-900' : 'text-slate-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type message to customer..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </DeliveryLayout>
  );
}
