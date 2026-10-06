import { NextRequest, NextResponse } from 'next/server';
import { searchIntentSchema } from '@/lib/ai/ai-search';
import { executeSearch } from '@/server/services/search.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const rawParams = {
      query: searchParams.get('q') || searchParams.get('query') || undefined,
      categoryId: searchParams.get('category') || undefined,
      categorySlug: searchParams.get('categorySlug') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      supplierId: searchParams.get('supplier') || searchParams.get('supplierId') || undefined,
      supplierVerified: searchParams.get('supplierVerified') === 'true',
      minRating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      inStock: searchParams.get('inStock') !== 'false',
      latitude: searchParams.get('latitude') ? Number(searchParams.get('latitude')) : undefined,
      longitude: searchParams.get('longitude') ? Number(searchParams.get('longitude')) : undefined,
      radiusKm: searchParams.get('radius') ? Number(searchParams.get('radius')) : undefined,
      sortBy: (searchParams.get('sort') as any) || 'RELEVANCE',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    };

    const validatedIntent = searchIntentSchema.parse(rawParams);
    const searchResult = await executeSearch(validatedIntent);

    return NextResponse.json({
      success: true,
      ...searchResult,
    });
  } catch (err: any) {
    console.error('GET /api/search error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Invalid search parameters' },
      { status: 400 }
    );
  }
}
