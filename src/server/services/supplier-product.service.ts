import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';
import { SupplierProductSchema } from '@/lib/validations/supplier';
import { z } from 'zod';

export async function listSupplierProducts(params: {
  supplierId: string;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  page?: number;
  limit?: number;
}) {
  const { supplierId, search, categoryId, status, stockStatus, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: any = {
    supplierId,
  };

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: 'insensitive' } },
      { sku: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (status) {
    where.status = status;
  }

  if (stockStatus === 'out_of_stock') {
    where.stockQuantity = 0;
  } else if (stockStatus === 'low_stock') {
    where.stockQuantity = { gt: 0, lte: prisma.product.fields.lowStockThreshold };
  } else if (stockStatus === 'in_stock') {
    where.stockQuantity = { gt: 0 };
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

export async function getSupplierProductById(supplierId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      supplierId, // STRICT ownership scoping
    },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      inventoryLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });

  if (!product) {
    throw new Error('Product not found or access denied');
  }

  return product;
}

export async function createSupplierProduct(
  supplierId: string,
  input: z.infer<typeof SupplierProductSchema>
) {
  const validated = SupplierProductSchema.parse(input);

  // Generate unique slug
  const baseSlug = validated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  // Create product + images + variants inside transaction
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        supplierId,
        categoryId: validated.categoryId,
        name: validated.name,
        slug,
        description: validated.description,
        sku: validated.sku,
        barcode: validated.barcode || null,
        price: validated.price,
        mrp: validated.mrp,
        discountPercent: validated.discount,
        unit: validated.unit,
        quantityValue: validated.quantity,
        stockQuantity: validated.initialStock,
        lowStockThreshold: validated.lowStockThreshold,
        isFeatured: validated.isFeatured,
        status: validated.isActive ? ProductStatus.ACTIVE : ProductStatus.INACTIVE,
        images: {
          create: validated.images.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
        variants: validated.variants?.length
          ? {
              create: validated.variants.map((v) => ({
                name: v.name,
                sku: v.sku,
                price: v.price,
                stock: v.stock,
                isActive: v.isActive,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    // Create initial InventoryLog if initial stock > 0
    if (validated.initialStock > 0) {
      await tx.inventoryLog.create({
        data: {
          productId: product.id,
          previousQuantity: 0,
          changeQuantity: validated.initialStock,
          newQuantity: validated.initialStock,
          reason: 'Initial Product Stock Creation',
        },
      });
    }

    return product;
  });
}

export async function updateSupplierProduct(
  supplierId: string,
  productId: string,
  input: Partial<z.infer<typeof SupplierProductSchema>>
) {
  // Ensure product ownership
  const existing = await prisma.product.findFirst({
    where: { id: productId, supplierId },
    include: { images: true, variants: true },
  });

  if (!existing) {
    throw new Error('Product not found or access denied');
  }

  return await prisma.$transaction(async (tx) => {
    const updateData: any = {};
    if (input.name) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.categoryId) updateData.categoryId = input.categoryId;
    if (input.sku) updateData.sku = input.sku;
    if (input.barcode !== undefined) updateData.barcode = input.barcode;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.mrp !== undefined) updateData.mrp = input.mrp;
    if (input.discount !== undefined) updateData.discountPercent = input.discount;
    if (input.unit !== undefined) updateData.unit = input.unit;
    if (input.quantity !== undefined) updateData.quantityValue = input.quantity;
    if (input.lowStockThreshold !== undefined) updateData.lowStockThreshold = input.lowStockThreshold;
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;
    if (input.isActive !== undefined) {
      updateData.status = input.isActive ? ProductStatus.ACTIVE : ProductStatus.INACTIVE;
    }

    if (input.images && input.images.length > 0) {
      // Re-create images list
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productImage.createMany({
        data: input.images.map((url, idx) => ({
          productId,
          url,
          sortOrder: idx,
        })),
      });
    }

    const updated = await tx.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    return updated;
  });
}

export async function toggleProductStatus(
  supplierId: string,
  productId: string,
  status: ProductStatus
) {
  const existing = await prisma.product.findFirst({
    where: { id: productId, supplierId },
  });

  if (!existing) {
    throw new Error('Product not found or access denied');
  }

  return await prisma.product.update({
    where: { id: productId },
    data: { status },
  });
}

export async function deleteSupplierProduct(supplierId: string, productId: string) {
  const existing = await prisma.product.findFirst({
    where: { id: productId, supplierId },
  });

  if (!existing) {
    throw new Error('Product not found or access denied');
  }

  // Soft delete by setting status to DELETED
  return await prisma.product.update({
    where: { id: productId },
    data: { status: ProductStatus.DELETED },
  });
}
