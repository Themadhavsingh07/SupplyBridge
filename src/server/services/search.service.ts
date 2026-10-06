import { prisma } from '@/lib/prisma';
import { SearchIntent } from '@/lib/ai/ai-search';
import { rankSearchResults } from './search-ranking.service';

export interface FormattedSearchResult {
  id: string;
  productId: string;
  supplierId: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  rating: number;
  categoryName: string;
  supplierName: string;
  supplierVerified: boolean;
  supplierRating: number;
  imageUrl: string;
  distanceKm?: number;
  rankingScore?: number;
  rankingReason?: string;
}

export interface SearchResultResponse {
  query?: string;
  intent: Partial<SearchIntent>;
  results: FormattedSearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  fallbackUsed?: boolean;
}

// Haversine formula for straight-line geographic distance calculation
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export async function executeSearch(intent: SearchIntent): Promise<SearchResultResponse> {
  const page = Math.max(1, intent.page || 1);
  const limit = Math.min(50, Math.max(1, intent.limit || 20));
  const skip = (page - 1) * limit;

  try {
    const where: any = { status: 'ACTIVE' };

    // Stock Filter
    if (intent.inStock) {
      where.stockQuantity = { gt: 0 };
    }

    // Price Range Filter
    if (intent.minPrice !== undefined || intent.maxPrice !== undefined) {
      where.price = {};
      if (intent.minPrice !== undefined) where.price.gte = intent.minPrice;
      if (intent.maxPrice !== undefined) where.price.lte = intent.maxPrice;
    }

    // Category Filter
    if (intent.categoryId) {
      where.categoryId = intent.categoryId;
    } else if (intent.categorySlug) {
      where.category = { slug: intent.categorySlug };
    }

    // Supplier Filter
    if (intent.supplierId) {
      where.supplierId = intent.supplierId;
    }

    // Verified Supplier Filter
    if (intent.supplierVerified) {
      where.supplier = { ...(where.supplier || {}), verificationStatus: 'VERIFIED' };
    }

    // Minimum Rating Filter
    if (intent.minRating) {
      where.rating = { gte: intent.minRating };
    }

    // Keyword Search
    if (intent.query && intent.query.trim().length > 0) {
      const q = intent.query.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
        { supplier: { businessName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // Fetch count and raw records from PostgreSQL via Prisma
    const [totalCount, rawProducts] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              businessName: true,
              rating: true,
              verificationStatus: true,
              latitude: true,
              longitude: true,
            },
          },
          category: { select: { id: true, name: true } },
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
        take: 100,
      }),
    ]);

    // Calculate straight-line geographic distance if user location is provided
    let itemsWithDistance = rawProducts.map((p) => {
      let distanceKm: number | undefined;
      if (
        intent.latitude !== undefined &&
        intent.longitude !== undefined &&
        p.supplier?.latitude &&
        p.supplier?.longitude
      ) {
        distanceKm = calculateHaversineDistance(
          intent.latitude,
          intent.longitude,
          Number(p.supplier.latitude),
          Number(p.supplier.longitude)
        );
      }
      return { product: p, distanceKm };
    });

    // Filter by distance radius if radiusKm is provided
    if (intent.radiusKm && intent.latitude !== undefined && intent.longitude !== undefined) {
      itemsWithDistance = itemsWithDistance.filter(
        (item) => item.distanceKm !== undefined && item.distanceKm <= (intent.radiusKm || 50)
      );
    }

    // Apply Ranking Engine
    const ranked = rankSearchResults(
      itemsWithDistance.map((i) => i.product),
      {
        maxPrice: intent.maxPrice,
        minRating: intent.minRating,
        keywords: intent.query ? intent.query.split(' ') : undefined,
      }
    );

    // Map ranked items back with computed distance and details
    const formattedResults: FormattedSearchResult[] = ranked.map(({ item, score, reason }) => {
      const matchedItem = itemsWithDistance.find((i) => i.product.id === item.id);
      return {
        id: item.id,
        productId: item.id,
        supplierId: item.supplierId,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        stockQuantity: item.stockQuantity,
        rating: Number(item.rating || item.supplier?.rating || 4.5),
        categoryName: item.category?.name || 'General',
        supplierName: item.supplier?.businessName || 'Verified Supplier',
        supplierVerified: item.supplier?.verificationStatus === 'VERIFIED',
        supplierRating: Number(item.supplier?.rating || 4.8),
        imageUrl: item.images[0]?.url || '/placeholder-product.png',
        distanceKm: matchedItem?.distanceKm,
        rankingScore: score,
        rankingReason: reason,
      };
    });

    // Apply requested sorting if specified
    if (intent.sortBy === 'PRICE_ASC') {
      formattedResults.sort((a, b) => a.price - b.price);
    } else if (intent.sortBy === 'PRICE_DESC') {
      formattedResults.sort((a, b) => b.price - a.price);
    } else if (intent.sortBy === 'RATING_DESC') {
      formattedResults.sort((a, b) => b.rating - a.rating);
    } else if (intent.sortBy === 'DISTANCE_ASC') {
      formattedResults.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    }

    // Paginate formatted results
    const paginatedResults = formattedResults.slice(skip, skip + limit);
    const total = formattedResults.length > 0 ? formattedResults.length : totalCount;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      query: intent.query,
      intent,
      results: paginatedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
      },
    };
  } catch (dbErr: any) {
    console.warn('[executeSearch] Database query failed or offline, returning empty result set:', dbErr.message?.split('\n')[0]);
    return {
      query: intent.query,
      intent,
      results: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
      },
      fallbackUsed: true,
    };
  }
}
