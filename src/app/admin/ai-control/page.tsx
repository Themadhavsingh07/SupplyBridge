'use client';

import { useEffect, useState } from 'react';
import { Bot, Shield, TrendingUp, AlertTriangle, Cpu, RefreshCw, Check, ToggleLeft, ToggleRight } from 'lucide-react';

interface AIInsightItem {
  title: string;
  insight: string;
  evidence: Record<string, any>;
  type: 'TREND' | 'WARNING' | 'ALERT' | 'INFO';
}

export default function AdminAIControlPage() {
  const [insights, setInsights] = useState<AIInsightItem[]>([]);
  const [rawMetrics, setRawMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [flags, setFlags] = useState({
    AI_ASSISTANT: true,
    SMART_SEARCH: true,
    AI_RECOMMENDATIONS: true,
    AI_CUSTOMER_SUPPORT: true,
    AI_ANALYTICS: true,
  });

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai/insights');
      const data = await res.json();
      if (data.success) {
        setInsights(data.insights || []);
        setRawMetrics(data.rawMetrics);
      }
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-100">
            <Cpu className="h-7 w-7 text-emerald-400" />
            <span>AI Control Center & Executive Insights</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage SupplyBridge AI Providers, Feature Flags, and Operational Insights
          </p>
        </div>
        <button
          onClick={fetchInsights}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Feature Flags Toggle Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-400" />
          <span>AI Feature Flags Control</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(flags).map(([key, val]) => (
            <div
              key={key}
              onClick={() => toggleFlag(key as any)}
              className="cursor-pointer rounded-xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between transition hover:border-slate-700"
            >
              <div>
                <p className="text-xs font-bold text-slate-200">{key}</p>
                <p className="text-[10px] text-slate-400">{val ? 'Active' : 'Disabled (Fallback)'}</p>
              </div>
              {val ? (
                <ToggleRight className="h-6 w-6 text-emerald-400" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-slate-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grounded AI Insights Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal-400" />
          <span>Grounded Operational Insights</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin text-teal-400" />
            <span className="text-sm">Aggregating database stats...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        item.type === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : item.type === 'ALERT'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-100">{item.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.insight}</p>
                </div>

                {/* Evidence Metrics Box */}
                <div className="border-t border-slate-800 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Supporting Database Evidence
                  </span>
                  <pre className="mt-1 rounded-lg bg-slate-950 p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                    {JSON.stringify(item.evidence, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
