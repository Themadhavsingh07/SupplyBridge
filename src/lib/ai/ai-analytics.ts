import { getAggregatedAdminMetrics } from '@/server/services/ai-analytics.service';
import { getAIClient } from './ai-client';

export interface AIInsightItem {
  title: string;
  insight: string;
  evidence: Record<string, any>;
  type: 'TREND' | 'WARNING' | 'ALERT' | 'INFO';
}

export async function generateAIAnalyticsInsights(): Promise<{
  insights: AIInsightItem[];
  rawMetrics: any;
  generatedAt: string;
}> {
  const rawMetrics = await getAggregatedAdminMetrics();
  const client = getAIClient();

  const prompt = `You are the SupplyBridge AI Executive Analyst.
Analyze these REAL aggregated metrics strictly without inventing numbers:
${JSON.stringify(rawMetrics, null, 2)}

Provide 3 key actionable operational insights for the admin dashboard. Return clear analysis grounded ONLY in these metrics.`;

  const aiRes = await client.generateText(prompt);
  const analysisText = typeof aiRes === 'string' ? aiRes : aiRes.text;

  const insights: AIInsightItem[] = [
    {
      title: 'Weekly Order & Cancellation Trend',
      insight: `Order volume changed by ${rawMetrics.orders.changePercent}% compared to last week. Order cancellations changed by ${rawMetrics.orders.cancellationChangePercent}%.`,
      evidence: rawMetrics.orders,
      type: rawMetrics.orders.cancellationChangePercent > 10 ? 'WARNING' : 'TREND',
    },
    {
      title: 'Inventory & Stock Level Alert',
      insight: `Currently ${rawMetrics.inventory.outOfStockItems} active items are out of stock and ${rawMetrics.inventory.lowStockItems} items are running on low inventory (<= 5 units).`,
      evidence: rawMetrics.inventory,
      type: rawMetrics.inventory.outOfStockItems > 0 ? 'ALERT' : 'INFO',
    },
    {
      title: 'Executive Operations Summary',
      insight: analysisText || 'Operations running within normal baseline parameters across verified suppliers.',
      evidence: { activeSuppliers: rawMetrics.suppliers.activeVerifiedCount },
      type: 'INFO',
    },
  ];

  return {
    insights,
    rawMetrics,
    generatedAt: new Date().toISOString(),
  };
}
