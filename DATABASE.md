# SupplyBridge — Database Architecture Specification

## Overview

SupplyBridge uses **PostgreSQL** as its authoritative relational database and **Prisma ORM** for type-safe database access and migrations. Supabase Realtime acts strictly as an event transport layer, and Supabase Storage manages media assets.

---

## Data Models & Core Relationships

### 1. User & Identity
- **`User`**: Central user account with enum roles (`CUSTOMER`, `SUPPLIER`, `DELIVERY_PARTNER`, `ADMIN`, `SUPPORT_AGENT`) and statuses (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `DELETED`).
- **`CustomerProfile`**: 1:1 extension of User for customer metrics (`totalOrders`, `totalSpent`).
- **`SupplierProfile`**: 1:1 extension storing business details, verification status (`PENDING`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `SUSPENDED`), GST/PAN numbers, GPS location (`latitude`, `longitude`), and ratings.
- **`DeliveryPartnerProfile`**: 1:1 extension storing vehicle information (`vehicleType`, `vehicleNumber`), availability (`isOnline`, `isAvailable`), and rating metrics.
- **`Address`**: Saved customer delivery addresses with lat/long coordinates.

### 2. Catalog & Inventory
- **`Category`**: Hierarchical product categories (`parentId` -> `Category`).
- **`SupplierCategory`**: Many-to-many join model between `SupplierProfile` and `Category`.
- **`Product`**: Catalog products linked to a `SupplierProfile` and `Category`, with pricing (`price`, `mrp`, `discountPercent`), stock (`stockQuantity`), and images (`ProductImage`).
- **`ProductVariant`**: Product variants (e.g. size/color).
- **`InventoryLog`**: Audit history of stock movements (`previousQuantity`, `changeQuantity`, `newQuantity`).

### 3. Shopping & Checkout
- **`Cart` & `CartItem`**: Unique cart per customer storing selected products and quantities.
- **`WishlistItem`**: Customer saved products.

### 4. Orders & Fulfillment
- **`Order`**: Authoritative order record capturing snapshot of delivery address, financial totals (`subtotal`, `deliveryFee`, `discount`, `tax`, `total`), and status lifecycle (`PLACED` -> `CONFIRMED` -> `PREPARING` -> `READY_FOR_PICKUP` -> `PICKED_UP` -> `OUT_FOR_DELIVERY` -> `DELIVERED` | `CANCELLED`).
- **`OrderItem`**: Line items snapshot per order.
- **`OrderStatusHistory`**: Immutable history log of all order status changes with timestamps and actor IDs.

### 5. Delivery & GPS Location
- **`Delivery`**: Fulfillment record mapping an `Order` to a `DeliveryPartnerProfile`.
- **`CurrentDeliveryLocation`**: High-speed single-row table storing current GPS coordinates (`latitude`, `longitude`, `accuracy`, `heading`, `speed`, `timestamp`) per active delivery.
- **`DeliveryPartnerLocation`**: Throttled historical GPS trail for audit and routing analysis.

### 6. Payments & Refunds
- **`Payment`**: Financial transaction record storing provider (`RAZORPAY`), provider IDs (`providerOrderId`, `providerPaymentId`), method (`COD`, `UPI`, `CARD`, `NET_BANKING`, `WALLET`), and status (`PENDING`, `AUTHORIZED`, `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`).
- **`Refund`**: Refund records linked to a Payment.

### 7. Communication & Messaging
- **`Conversation`**: Direct messaging channel (`CUSTOMER_SUPPLIER`, `CUSTOMER_DELIVERY`, `CUSTOMER_SUPPORT`, `SUPPLIER_SUPPORT`, `ORDER`).
- **`ConversationParticipant`**: Join model linking `User` participants to a `Conversation`.
- **`Message`**: Individual chat message (`TEXT`, `IMAGE`, `PRODUCT`, `ORDER`, `SYSTEM`).

### 8. Dispute & Support
- **`Complaint`**: Ticket management system (`WRONG_PRODUCT`, `DAMAGED_PRODUCT`, `MISSING_PRODUCT`, `LATE_DELIVERY`, `PAYMENT`, `SUPPLIER`, `DELIVERY_PARTNER`, `REFUND`, `OTHER`).
- **`ComplaintMessage` & `ComplaintAttachment`**: Threaded communication and media evidence for dispute resolution.

### 9. Promotions, Loyalty & Auditing
- **`Coupon` & `CouponUsage`**: Promo codes (`PERCENTAGE`, `FIXED`, `FREE_DELIVERY`).
- **`LoyaltyAccount` & `LoyaltyTransaction`**: Points program for purchases (`EARNED`, `REDEEMED`, `EXPIRED`, `BONUS`, `REFUND`).
- **`Referral`**: Customer referral reward tracking.
- **`Subscription` & `SubscriptionItem`**: Recurring delivery subscriptions.
- **`RealtimeEventLog`**: Outbox event queue for reliable event transport.
- **`AuditLog`**: Immutable administrative log for sensitive operations.

---

## Indexing Strategy

Indexes are explicitly configured in `prisma/schema.prisma` for critical lookup patterns:
- User role/status: `@@index([role])`, `@@index([status])`
- Geographic queries: `@@index([latitude, longitude])`
- Product status/supplier: `@@index([supplierId])`, `@@index([categoryId])`, `@@index([status])`
- Order queries: `@@index([customerId])`, `@@index([supplierId])`, `@@index([status])`, `@@index([createdAt])`
- Realtime Outbox: `@@index([eventType])`, `@@index([entityId])`, `@@index([orderId])`, `@@index([createdAt])`, `@@index([processedAt])`
