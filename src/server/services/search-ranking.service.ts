import { prisma } from '@/lib/prisma';
import { AIShoppingParams } from '@/lib/ai/ai-types';

export interface RankedProduct {
  product: any;
  score: number;
  explanation: string;
}

export function rankSearchResults(
  products: any[],
  options?: { maxPrice?: number; minRating?: number; keywords?: string[] }
) {
  return products.map((p) => {
    let score = 50;
    const reasons: string[] = [];

    if (options?.keywords && options.keywords.length > 0) {
      const matchCount = options.keywords.filter((kw) =>
        p.name.toLowerCase().includes(kw.toLowerCase())
      ).length;
      score += matchCount * 20;
      if (matchCount > 0) reasons.push('matches your search query');
    }

    if (p.stockQuantity > 0) {
      score += 15;
      reasons.push('currently in stock');
    } else {
      score -= 30;
    }

    const price = Number(p.price);
    if (options?.maxPrice && price <= options.maxPrice) {
      score += 15;
      reasons.push(`fits within budget (₹${price})`);
    }

    const rating = Number(p.rating || p.supplier?.rating || 4.5);
    score += rating * 5;
    if (rating >= 4.5) reasons.push('highly rated');

    if (p.supplier?.verificationStatus === 'VERIFIED') {
      score += 10;
      reasons.push('from a verified local supplier');
    }

    return {
      item: p,
      score: Math.round(score),
      reason: `Recommended because it ${reasons.join(', ')}.`,
    };
  }).sort((a, b) => b.score - a.score);
}

export async function getRankedSearchProducts(params: AIShoppingParams, limit: number = 20): Promise<RankedProduct[]> {
  const where: any = { status: 'ACTIVE' };

  if (params.maxPrice) {
    where.price = { lte: params.maxPrice };
  }
  if (params.minPrice) {
    where.price = { ...where.price, gte: params.minPrice };
  }
  if (params.keywords && params.keywords.length > 0) {
    where.OR = params.keywords.map((kw) => ({
      OR: [
        { name: { contains: kw, mode: 'insensitive' } },
        { description: { contains: kw, mode: 'insensitive' } },
        { category: { name: { contains: kw, mode: 'insensitive' } } },
      ],
    }));
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      supplier: {
        select: {
          id: true,
          businessName: true,
          rating: true,
          onlineStatus: true,
          verificationStatus: true,
        },
      },
      category: { select: { id: true, name: true } },
      images: { take: 1, orderBy: { sortOrder: 'asc' } },
    },
    take: 50,
  });

  const ranked = rankSearchResults(products, {
    maxPrice: params.maxPrice,
    keywords: params.keywords,
  });

  return ranked.slice(0, limit).map((r) => ({
    product: r.item,
    score: r.score,
    explanation: r.reason,
  }));
}
