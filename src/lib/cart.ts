import { prisma } from './prisma';

export async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              supplier: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                supplier: true,
              },
            },
          },
        },
      },
    });
  }

  return cart;
}

export async function calculateCartSummary(userId: string) {
  const cart = await getOrCreateCart(userId);
  let subtotal = 0;
  let totalDiscount = 0;
  let deliveryFee = 0;
  const supplierIds = new Set<string>();

  const formattedItems = cart.items.map((item) => {
    const price = Number(item.product.price);
    const discountPercent = Number(item.product.discountPercent || 0);
    const finalUnitPrice = price * (1 - discountPercent / 100);
    const itemTotal = finalUnitPrice * item.quantity;

    subtotal += price * item.quantity;
    totalDiscount += (price - finalUnitPrice) * item.quantity;
    supplierIds.add(item.product.supplierId);

    const supplierDeliveryFee = 25; // default delivery fee
    if (supplierDeliveryFee > deliveryFee) {
      deliveryFee = supplierDeliveryFee;
    }

    return {
      cartItemId: item.id,
      quantity: item.quantity,
      supplierProductId: item.productId,
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.images[0]?.url || '',
      unit: item.product.unit || '1 pc',
      unitPrice: price,
      discountPercent,
      finalUnitPrice,
      totalPrice: itemTotal,
      supplierId: item.product.supplier.id,
      supplierName: item.product.supplier.businessName,
      supplierRating: Number(item.product.supplier.rating || 5),
      stock: item.product.stockQuantity,
    };
  });

  if (formattedItems.length === 0) deliveryFee = 0;
  const totalAmount = Math.max(0, subtotal - totalDiscount + deliveryFee);

  return {
    cartId: cart.id,
    items: formattedItems,
    itemCount: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    distinctSuppliersCount: supplierIds.size,
  };
}
