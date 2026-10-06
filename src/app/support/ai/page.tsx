'use client';

import { useState } from 'react';
import { Bot, Send, User, AlertTriangle, ShieldCheck, Headset, FileText, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolResults?: any[];
  escalateToHuman?: boolean;
  escalationReason?: string;
  timestamp: string;
}

export default function AISupportPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I am SupplyBridge AI Support Assistant. I can help check your order status, delivery partner location, refund updates, or platform policies. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [escalated, setEscalated] = useState(false);

  const sendMessage = async (userText?: string) => {
    const text = userText || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          orderId: orderId || undefined,
          conversationId,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Support service error');

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      if (data.escalateToHuman) {
        setEscalated(true);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        toolResults: data.toolResults,
        escalateToHuman: data.escalateToHuman,
        escalationReason: data.escalationReason,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I am having trouble connecting to support services right now. Please try again or create a ticket directly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalateToHuman = async () => {
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Customer Support Escalation',
          description: `Conversation escalated from AI support. Last message context: ${messages[messages.length - 1]?.content || ''}`,
          category: 'OTHER',
          priority: 'HIGH',
        }),
      });
      if (res.ok) {
        alert('Your query has been escalated to human support agent. A ticket has been created.');
      } else {
        window.location.href = '/support/tickets';
      }
    } catch (err) {
      window.location.href = '/support/tickets';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-500/20 p-2.5 text-teal-400">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">SupplyBridge AI Support</h1>
              <p className="text-xs text-slate-400">24/7 Automated Assistant Grounded in Order Records</p>
            </div>
          </div>
          <button
            onClick={handleEscalateToHuman}
            className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
          >
            <Headset className="h-4 w-4" />
            <span>Talk to Support</span>
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 mx-auto w-full max-w-4xl p-6 flex flex-col justify-between space-y-4">
        {/* Escalation Alert Banner */}
        {escalated && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-300">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>
                Human support agent escalation recommended. Our support team is available for disputes & refund issues.
              </span>
            </div>
            <button
              onClick={handleEscalateToHuman}
              className="rounded-lg bg-amber-500 px-3 py-1.5 font-bold text-slate-950 hover:bg-amber-400"
            >
              Connect Now
            </button>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed space-y-2 ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p>{m.content}</p>

                {/* Tool Results Renderer */}
                {m.toolResults && m.toolResults.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Verified Tool Records
                    </span>
                    {m.toolResults.map((tr, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-slate-950/60 p-2.5 text-xs text-slate-300 space-y-1 font-mono border border-slate-800"
                      >
                        <div className="flex justify-between font-bold text-teal-400">
                          <span>Tool: {tr.toolName}</span>
                          <span>{tr.success ? 'Success' : 'Error'}</span>
                        </div>
                        {tr.data && <pre className="whitespace-pre-wrap text-[11px]">{JSON.stringify(tr.data, null, 2)}</pre>}
                      </div>
                    ))}
                  </div>
                )}

                <span className="block text-[10px] text-right opacity-60 mt-1">{m.timestamp}</span>
              </div>

              {m.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="h-8 w-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <span className="text-xs text-slate-400">Checking database & verifying order context...</span>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Optional Order ID context (e.g., ord_123)..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-48 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
            <span className="text-xs text-slate-500">Provide Order ID to check status faster</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about order status, delivery ETA, return policy..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-teal-600 px-5 py-3 font-bold text-white transition hover:bg-teal-500 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
