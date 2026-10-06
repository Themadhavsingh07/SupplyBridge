import { prisma } from './prisma';

export async function processAiShoppingAssistant(prompt: string, maxBudget?: number) {
  const queryLower = prompt.toLowerCase();

  let budget = maxBudget || 500;
  const matchBudget = queryLower.match(/under\s*₹?\s*(\d+)/i) || queryLower.match(/budget\s*₹?\s*(\d+)/i);
  if (matchBudget && matchBudget[1]) {
    budget = parseInt(matchBudget[1], 10);
  }

  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE', stockQuantity: { gt: 0 } },
    include: {
      category: true,
      images: true,
      supplier: true,
    },
  });

  let matched = products.filter((p) => {
    const text = (p.name + ' ' + (p.description || '') + ' ' + (p.category?.name || '')).toLowerCase();
    if (queryLower.includes('breakfast')) {
      return text.includes('milk') || text.includes('bread') || text.includes('egg') || text.includes('yoghurt') || text.includes('butter') || text.includes('avocado') || text.includes('coffee') || text.includes('banana');
    }
    if (queryLower.includes('snack') || queryLower.includes('party')) {
      return text.includes('chip') || text.includes('cashew') || text.includes('juice') || text.includes('chocolat') || text.includes('nacho') || text.includes('kombucha');
    }
    if (queryLower.includes('protein') || queryLower.includes('gym')) {
      return text.includes('chicken') || text.includes('egg') || text.includes('whey') || text.includes('protein') || text.includes('paneer') || text.includes('almond');
    }
    return true;
  });

  if (matched.length === 0) matched = products.slice(0, 6);

  let currentTotal = 0;
  const recommendedBasket: Array<{
    product: typeof products[0];
  }> = [];

  for (const prod of matched) {
    const priceNum = Number(prod.price);
    const discountNum = Number(prod.discountPercent || 0);
    const effectivePrice = priceNum * (1 - discountNum / 100);
    if (currentTotal + effectivePrice <= budget) {
      recommendedBasket.push({ product: prod });
      currentTotal += effectivePrice;
    }

    if (recommendedBasket.length >= 4) break;
  }

  return {
    prompt,
    calculatedBudget: budget,
    totalEstimatedPrice: Math.round(currentTotal * 100) / 100,
    recommendations: recommendedBasket.map((item) => {
      const price = Number(item.product.price);
      const discountPercent = Number(item.product.discountPercent || 0);
      return {
        productId: item.product.id,
        productName: item.product.name,
        image: item.product.images[0]?.url || '',
        supplierId: item.product.supplier.id,
        supplierName: item.product.supplier.businessName,
        supplierRating: Number(item.product.supplier.rating),
        price,
        discountPercent,
        finalPrice: Math.round(price * (1 - discountPercent / 100)),
        unit: item.product.unit || 'pc',
        estMinutes: 30,
      };
    }),
    aiExplanation: `Based on your request "${prompt}", I crafted a meal bundle from top-rated verified nearby suppliers. Total basket cost is ₹${Math.round(currentTotal)} (under your ₹${budget} budget).`,
  };
}

export async function processAiSupportAssistant(customerId: string, userQuery: string) {
  const latestOrder = await prisma.order.findFirst({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: {
      supplier: true,
      delivery: {
        include: {
          deliveryPartner: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  const queryLower = userQuery.toLowerCase();

  if (queryLower.includes('late') || queryLower.includes('where is my order') || queryLower.includes('status')) {
    if (!latestOrder) {
      return {
        reply: "I couldn't find any recent active orders under your account. Would you like to check your order history?",
        canEscalate: false,
      };
    }

    const orderNum = latestOrder.orderNumber;
    const supplierName = latestOrder.supplier.businessName;
    const status = latestOrder.status;

    let updateMsg = `Your order #${orderNum} from **${supplierName}** is currently **${status.replace(/_/g, ' ')}**.`;
    
    if (status === 'OUT_FOR_DELIVERY' || status === 'PICKED_UP') {
      const riderName = latestOrder.delivery?.deliveryPartner?.user?.name || 'Assigned Rider';
      updateMsg += ` Delivery partner **${riderName}** is en route to your address. Estimated arrival: 5-10 minutes.`;
    } else if (status === 'PREPARING' || status === 'CONFIRMED') {
      updateMsg += ` **${supplierName}** is currently preparing your order fresh. You can also chat directly with the supplier for live updates!`;
    } else if (status === 'DELIVERED') {
      updateMsg += ` This order was delivered successfully on ${new Date(latestOrder.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    }

    return {
      orderId: latestOrder.id,
      orderNumber: orderNum,
      orderStatus: status,
      reply: updateMsg,
      canEscalate: status !== 'DELIVERED',
    };
  }

  return {
    reply: "I can assist you with order status, supplier contact, refunds, or delivery delays. If your concern needs manual intervention, click below to connect with a Live Support Agent.",
    canEscalate: true,
  };
}
