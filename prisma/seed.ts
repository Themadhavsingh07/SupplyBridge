import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for SupplyBridge...');

  // Clean existing tables in correct order
  await prisma.auditLog.deleteMany();
  await prisma.realtimeEventLog.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.loyaltyAccount.deleteMany();
  await prisma.subscriptionItem.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.complaintAttachment.deleteMany();
  await prisma.complaintMessage.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.currentDeliveryLocation.deleteMany();
  await prisma.deliveryPartnerLocation.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplierCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplierVerificationDocument.deleteMany();
  await prisma.supplierProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.deliveryPartnerProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create Core Users for each Role
  console.log('👤 Creating demo accounts...');
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@supplybridge.com',
      passwordHash: hashedPassword,
      name: 'Super Admin',
      phone: '+91 9876543210',
      role: 'ADMIN',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const supportAgent = await prisma.user.create({
    data: {
      email: 'support@supplybridge.com',
      passwordHash: hashedPassword,
      name: 'Sarah Support Agent',
      phone: '+91 9876543211',
      role: 'SUPPORT_AGENT',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@supplybridge.com',
      passwordHash: hashedPassword,
      name: 'Aarav Sharma',
      phone: '+91 9876543212',
      role: 'CUSTOMER',
      isEmailVerified: true,
      isPhoneVerified: true,
      customerProfile: {
        create: {
          totalOrders: 5,
          totalSpent: 1250.0,
        },
      },
      loyaltyAccount: {
        create: {
          points: 350,
          lifetimePoints: 500,
        },
      },
    },
  });

  // Create address for customer
  const customerAddress = await prisma.address.create({
    data: {
      userId: customerUser.id,
      label: 'Home',
      addressLine: 'Flat 402, Sunshine Heights, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      latitude: 12.9716,
      longitude: 77.5946,
      isDefault: true,
    },
  });

  // Create Cart for Customer
  await prisma.cart.create({
    data: {
      userId: customerUser.id,
    },
  });

  const deliveryPartnerUser = await prisma.user.create({
    data: {
      email: 'delivery@supplybridge.com',
      passwordHash: hashedPassword,
      name: 'Vikram Singh (Rider)',
      phone: '+91 9876543213',
      role: 'DELIVERY_PARTNER',
      isEmailVerified: true,
      isPhoneVerified: true,
      deliveryProfile: {
        create: {
          vehicleType: 'EV Scooter',
          vehicleNumber: 'KA-01-EV-4829',
          licenseNumber: 'DL-98202611',
          isOnline: true,
          isAvailable: true,
          rating: 4.9,
          totalDeliveries: 142,
          totalEarnings: 18400.0,
        },
      },
    },
  });

  // 2. Create Categories
  console.log('📁 Creating product categories...');
  const categoriesData = [
    { name: 'Fresh Fruits & Vegetables', slug: 'fruits-vegetables', description: 'Farm-fresh organic produce delivered within minutes', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop' },
    { name: 'Dairy, Bread & Eggs', slug: 'dairy-bread-eggs', description: 'Fresh milk, artisan butter, organic eggs & fresh bakery goods', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop' },
    { name: 'Snacks & Beverages', slug: 'snacks-beverages', description: 'Crisps, nuts, gourmet sodas, juices and artisan teas', imageUrl: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=600&auto=format&fit=crop' },
    { name: 'Meat, Seafood & Eggs', slug: 'meat-seafood', description: 'Antibiotic-free fresh cuts, ocean prawns and poultry', imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop' },
    { name: 'Electronics & Gadgets', slug: 'electronics-gadgets', description: 'Chargers, earbuds, cables & daily tech accessories', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop' },
    { name: 'Pharmacy & Wellness', slug: 'pharmacy-wellness', description: 'First aid, vitamins, personal hygiene and wellness items', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop' },
    { name: 'Home & Kitchen Cleaning', slug: 'home-cleaning', description: 'Detergents, disinfectants, tissues and kitchen essentials', imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop' },
  ];

  const categories = [];
  for (const catData of categoriesData) {
    const cat = await prisma.category.create({ data: catData });
    categories.push(cat);
  }

  // 3. Create Demo Suppliers
  console.log('🏪 Creating verified suppliers...');
  const demoSupplierUser = await prisma.user.create({
    data: {
      email: 'supplier@supplybridge.com',
      passwordHash: hashedPassword,
      name: 'Ramesh Patel (Green Valley)',
      phone: '+91 9111111101',
      role: 'SUPPLIER',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const demoSupplierProfile = await prisma.supplierProfile.create({
    data: {
      userId: demoSupplierUser.id,
      businessName: 'Green Valley Organic Farms',
      ownerName: 'Ramesh Patel',
      phone: '+91 9111111101',
      email: 'supplier@supplybridge.com',
      addressLine: 'Plot 12, Agro Park, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      gstNumber: '29ABCDE1234F1Z5',
      panNumber: 'ABCDE1000F',
      businessLicenseNumber: 'FSSAI-200001',
      verificationStatus: 'VERIFIED',
      onlineStatus: 'ONLINE',
      isOpen: true,
      rating: 4.9,
      totalRatings: 184,
      totalOrders: 420,
      latitude: 12.9716,
      longitude: 77.5946,
      verificationDocuments: {
        create: [
          {
            type: 'GST',
            documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
            documentNo: '29ABCDE1234F1Z5',
            isVerified: true,
            verifiedAt: new Date(),
          },
        ],
      },
    },
  });

  // 4. Create Products for Supplier
  console.log('📦 Creating catalog products...');
  const catFruits = categories.find(c => c.slug === 'fruits-vegetables')!;
  const catDairy = categories.find(c => c.slug === 'dairy-bread-eggs')!;

  const p1 = await prisma.product.create({
    data: {
      supplierId: demoSupplierProfile.id,
      categoryId: catFruits.id,
      name: 'Fresh Hass Avocado (2 Pcs)',
      slug: 'fresh-hass-avocado-2-pcs',
      description: 'Ripe, creamy imported Hass avocados packed with healthy fats.',
      sku: 'PROD-AVO-01',
      price: 180.0,
      mrp: 220.0,
      discountPercent: 18.0,
      stockQuantity: 45,
      status: 'ACTIVE',
      isFeatured: true,
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600' }],
      },
    },
  });

  const p2 = await prisma.product.create({
    data: {
      supplierId: demoSupplierProfile.id,
      categoryId: catDairy.id,
      name: 'Full Cream Organic Cow Milk (1 Litre)',
      slug: 'full-cream-organic-cow-milk-1-litre',
      description: 'Homogenized, pasteurized 100% pure cow milk with rich cream layer.',
      sku: 'PROD-MLK-11',
      price: 68.0,
      mrp: 75.0,
      discountPercent: 9.0,
      stockQuantity: 120,
      status: 'ACTIVE',
      isFeatured: true,
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600' }],
      },
    },
  });

  // 5. Create Demo Order
  console.log('🛒 Creating sample order & live chat...');
  const demoOrder = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-98124',
      customerId: customerUser.id,
      supplierId: demoSupplierProfile.id,
      status: 'OUT_FOR_DELIVERY',
      subtotal: 136.0,
      deliveryFee: 15.0,
      discount: 10.0,
      tax: 5.0,
      total: 146.0,
      deliveryName: 'Aarav Sharma',
      deliveryPhone: '+91 9876543212',
      addressLine: 'Flat 402, Sunshine Heights, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      items: {
        create: [
          {
            productId: p2.id,
            productName: p2.name,
            sku: p2.sku,
            quantity: 2,
            unitPrice: 68.0,
            totalPrice: 136.0,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: demoOrder.id,
      provider: 'RAZORPAY',
      providerPaymentId: 'pay_N7x91Q67890',
      providerOrderId: 'order_N7x90P12345',
      method: 'CARD',
      status: 'PAID',
      amount: 146.0,
      paidAt: new Date(),
    },
  });

  const deliveryPartnerProfile = await prisma.deliveryPartnerProfile.findUnique({
    where: { userId: deliveryPartnerUser.id },
  });

  if (deliveryPartnerProfile) {
    await prisma.delivery.create({
      data: {
        orderId: demoOrder.id,
        deliveryPartnerId: deliveryPartnerProfile.id,
        status: 'STARTED',
        assignedAt: new Date(Date.now() - 20 * 60 * 1000),
        startedAt: new Date(Date.now() - 10 * 60 * 1000),
      },
    });
  }

  // 6. Real-Time Conversation
  const conversation = await prisma.conversation.create({
    data: {
      type: 'ORDER',
      orderId: demoOrder.id,
      supplierId: demoSupplierProfile.id,
      title: 'Order ORD-2026-98124 Support Chat',
      participants: {
        create: [
          { userId: customerUser.id },
          { userId: demoSupplierUser.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: customerUser.id,
        messageType: 'TEXT',
        content: 'Hi Ramesh! Is this organic cow milk fresh from today morning’s batch?',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        conversationId: conversation.id,
        senderId: demoSupplierUser.id,
        messageType: 'TEXT',
        content: 'Hello Aarav! Yes, we received the fresh pasteurized batch at 6:00 AM today.',
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
      },
    ],
  });

  // 7. Coupons
  await prisma.coupon.create({
    data: {
      code: 'WELCOME50',
      description: 'Get 50% OFF on your first order',
      type: 'PERCENTAGE',
      value: 50.0,
      maxDiscount: 100.0,
      minOrderAmount: 199.0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // 8. Notifications
  await prisma.notification.create({
    data: {
      recipientId: customerUser.id,
      type: 'ORDER',
      title: 'Order Out for Delivery 🚚',
      message: 'Your order ORD-2026-98124 is out for delivery with rider Vikram Singh.',
    },
  });

  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
