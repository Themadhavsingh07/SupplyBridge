import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const categorySlug = searchParams.get('category') || '';
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const supplierId = searchParams.get('supplierId') || '';

    const where: any = { status: 'ACTIVE' };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (query) {
      const qLower = query.toLowerCase();
      const budgetMatch = qLower.match(/under\s*₹?\s*(\d+)/i);
      const parsedMaxPrice = budgetMatch ? parseFloat(budgetMatch[1]) : maxPrice;

      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { category: { name: { contains: query } } },
      ];

      if (parsedMaxPrice) {
        where.price = { lte: parsedMaxPrice };
      }
    } else if (maxPrice) {
      where.price = { lte: maxPrice };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        supplier: true,
      },
      take: 50,
    });

    const formatted = products.map((p) => {
      const price = Number(p.price);
      const discountPercent = Number(p.discountPercent || 0);
      const finalPrice = Math.round(price * (1 - discountPercent / 100));

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: p.categoryId,
        categoryName: p.category.name,
        categorySlug: p.category.slug,
        primaryImage: p.images[0]?.url || '',
        price,
        mrp: p.mrp ? Number(p.mrp) : price,
        discountPercent,
        finalPrice,
        stockQuantity: p.stockQuantity,
        unit: p.unit || '1 pc',
        supplierId: p.supplier.id,
        supplierName: p.supplier.businessName,
        supplierRating: Number(p.supplier.rating || 5),
      };
    });

    return NextResponse.json({ products: formatted });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
