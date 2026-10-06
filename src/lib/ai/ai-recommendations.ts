import { getFrequentlyBoughtTogether, getPopularNearYou, getBuyAgainProducts, getSupplierRecommendations } from '@/server/services/recommendation.service';
import { getAIClient } from './ai-client';

export interface PersonalRecommendationsInput {
  userId?: string;
  city?: string;
  productId?: string;
  category?: string;
}

export async function getPersonalizedHomeRecommendations(input: PersonalRecommendationsInput) {
  const [popularNearYou, buyAgain, suppliers] = await Promise.all([
    getPopularNearYou(input.city, 8),
    input.userId ? getBuyAgainProducts(input.userId, 6) : Promise.resolve([]),
    getSupplierRecommendations(input.category, 4),
  ]);

  let frequentlyBoughtTogether: any[] = [];
  if (input.productId) {
    frequentlyBoughtTogether = await getFrequentlyBoughtTogether(input.productId, 4);
  }

  return {
    popularNearYou,
    buyAgain,
    frequentlyBoughtTogether,
    suppliers,
  };
}

export async function getAISupplierAdvice(query: string) {
  const client = getAIClient();
  const suppliers = await getSupplierRecommendations(query, 5);

  const prompt = `User asks: "${query}". Based on these actual suppliers: ${JSON.stringify(suppliers)}, summarize why these suppliers are best suited.`;
  const responseText = await client.generateText(prompt);

  return {
    summary: responseText,
    suppliers,
  };
}
