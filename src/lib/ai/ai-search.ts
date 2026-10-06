import { z } from 'zod';
import { getAIClient } from './ai-client';
import { executeWithAIFallback } from './ai-fallback';

// 1. Zod Search Schema (Strict Server Validation)
export const searchIntentSchema = z.object({
  query: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  supplierId: z.string().optional(),
  supplierVerified: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  inStock: z.boolean().optional().default(true),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusKm: z.number().min(0.1).max(100).optional(),
  sortBy: z
    .enum(['RELEVANCE', 'PRICE_ASC', 'PRICE_DESC', 'RATING_DESC', 'DISTANCE_ASC', 'POPULARITY'])
    .default('RELEVANCE'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

export type SearchIntent = z.infer<typeof searchIntentSchema>;

// 2. Deterministic Intent Extractor (Used as fallback or fast parser)
export function parseNaturalLanguageSearchIntent(rawQuery: string): SearchIntent {
  const q = rawQuery.toLowerCase().trim();
  let maxPrice: number | undefined;
  let minPrice: number | undefined;
  let minRating: number | undefined;
  let supplierVerified: boolean | undefined;
  let sortBy: SearchIntent['sortBy'] = 'RELEVANCE';
  let inStock = true;

  // Price extraction e.g. "under 500", "under ₹300", "less than 200", "between 100 and 300"
  const betweenMatch = q.match(/between\s*₹?\s*(\d+)\s*and\s*₹?\s*(\d+)/i);
  if (betweenMatch) {
    minPrice = parseFloat(betweenMatch[1]);
    maxPrice = parseFloat(betweenMatch[2]);
  } else {
    const budgetMatch = q.match(/(under|below|less than|within|₹|\$)\s*(\d+)/i);
    if (budgetMatch && budgetMatch[2]) {
      maxPrice = parseFloat(budgetMatch[2]);
    }
  }

  // Keywords like "cheap", "cheapest", "best", "popular", "top rated"
  if (q.includes('cheap') || q.includes('cheapest')) {
    sortBy = 'PRICE_ASC';
  } else if (q.includes('best') || q.includes('top rated') || q.includes('good quality')) {
    minRating = 4.0;
    sortBy = 'RATING_DESC';
  } else if (q.includes('popular') || q.includes('trending')) {
    sortBy = 'POPULARITY';
  }

  if (q.includes('verified')) {
    supplierVerified = true;
  }

  // Stop word removal for search query term
  const stopWords = [
    'under',
    'below',
    'less',
    'than',
    'cheap',
    'cheapest',
    'best',
    'top',
    'rated',
    'good',
    'quality',
    'verified',
    'items',
    'products',
    'show',
    'me',
    'find',
    'give',
    'for',
    'near',
    'available',
    'within',
  ];

  const cleanWords = q
    .replace(/[₹\$]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.includes(w) && !/^\d+$/.test(w));

  const queryTerm = cleanWords.join(' ');

  return searchIntentSchema.parse({
    query: queryTerm || rawQuery,
    minPrice,
    maxPrice,
    minRating,
    supplierVerified,
    inStock,
    sortBy,
    page: 1,
    limit: 20,
  });
}

// 3. AI-Powered Intent Extraction with Fallback & Zod Validation
export async function extractSearchIntentWithAI(
  userQuery: string,
  userLocation?: { lat: number; lng: number }
): Promise<SearchIntent> {
  return (
    await executeWithAIFallback({
      feature: 'SMART_SEARCH',
      aiAction: async () => {
        const client = getAIClient();
        const prompt = `Extract structured search intent from user query: "${userQuery}".
Return JSON object strictly matching these fields:
- query: string (cleaned product keyword)
- maxPrice: number or null
- minPrice: number or null
- minRating: number or null
- supplierVerified: boolean or null
- sortBy: "RELEVANCE" | "PRICE_ASC" | "PRICE_DESC" | "RATING_DESC" | "POPULARITY"`;

        const res = await client.generateText(prompt);
        const text = typeof res === 'string' ? res : res.text;

        const deterministic = parseNaturalLanguageSearchIntent(userQuery);

        let json: any = {};
        try {
          const match = text.match(/\{[\s\S]*\}/);
          if (match) json = JSON.parse(match[0]);
        } catch (e) {
          json = {};
        }

        return searchIntentSchema.parse({
          query: json.query || deterministic.query || userQuery,
          maxPrice: json.maxPrice ? Number(json.maxPrice) : deterministic.maxPrice,
          minPrice: json.minPrice ? Number(json.minPrice) : deterministic.minPrice,
          minRating: json.minRating ? Number(json.minRating) : deterministic.minRating,
          supplierVerified:
            typeof json.supplierVerified === 'boolean'
              ? json.supplierVerified
              : deterministic.supplierVerified,
          sortBy: json.sortBy || deterministic.sortBy || 'RELEVANCE',
          latitude: userLocation?.lat,
          longitude: userLocation?.lng,
          inStock: true,
          page: 1,
          limit: 20,
        });
      },
      fallbackAction: async () => {
        const deterministic = parseNaturalLanguageSearchIntent(userQuery);
        if (userLocation) {
          deterministic.latitude = userLocation.lat;
          deterministic.longitude = userLocation.lng;
        }
        return deterministic;
      },
    })
  ).result;
}

export function parseSearchIntent(query: string) {
  const parsed = parseNaturalLanguageSearchIntent(query);
  return {
    category: parsed.query,
    keywords: parsed.query ? [parsed.query] : [],
    budget: parsed.maxPrice,
    ratingPreference: parsed.minRating,
  };
}
