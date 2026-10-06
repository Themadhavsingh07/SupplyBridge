# SupplyBridge — API Documentation

## Auth Endpoints
- `POST /api/auth/register` — Register new Customer, Supplier, or Delivery Partner account
- `POST /api/auth/login` — Authenticate user and set HTTP-only JWT cookie
- `GET /api/auth/me` — Retrieve current active session and user profile details
- `POST /api/auth/logout` — Clear active session cookie

## Products & Catalog
- `GET /api/products` — Search and filter products with multi-supplier price comparison
  - Query parameters: `q`, `category`, `maxPrice`, `supplierId`
- `GET /api/cart` — Fetch customer's active cart with calculated subtotal, discounts, and delivery fees
- `POST /api/cart` — Add product to cart with quantity validation
- `DELETE /api/cart` — Remove specific item or clear entire cart

## Supplier Operations & Dashboard API
- `POST /api/supplier/register` — 6-Step multi-step supplier business onboarding
- `GET /api/supplier/profile` — Fetch supplier store details (business name, hours, location)
- `PUT /api/supplier/profile` — Update editable store fields (protected compliance fields ignored)
- `PUT /api/supplier/status` — Toggle supplier `onlineStatus` (`ONLINE`, `OFFLINE`, `BUSY`) & `isOpen`, publish `SUPPLIER_STATUS_CHANGED`
- `GET /api/supplier/verification` — Retrieve document verification status & uploaded KYC files
- `POST /api/supplier/verification` — Resubmit updated verification details for admin review
- `GET /api/supplier/products` — List supplier products scoped by `supplierId` with pagination and status filters
- `POST /api/supplier/products` — Create new product with variants, image uploads, and initial stock log
- `GET /api/supplier/products/[id]` — Fetch product details with variants and inventory log history
- `PUT /api/supplier/products/[id]` — Update product price, stock threshold, variants, or active status
- `DELETE /api/supplier/products/[id]` — Soft delete product (`status: DELETED`)
- `GET /api/supplier/inventory` — Retrieve inventory items with stock level status (`in_stock`, `low_stock`, `out_of_stock`)
- `POST /api/supplier/inventory/[productId]` — Atomically adjust stock level, create `InventoryLog`, and publish realtime alerts
- `GET /api/supplier/orders` — Fetch supplier order fulfillment queue
- `GET /api/supplier/orders/[id]` — Fetch supplier order details, items, timeline, and customer contact info
- `POST /api/supplier/orders/[id]` — Execute valid status transition (`CONFIRM`, `START_PREPARING`, `MARK_READY`, `CANCEL`)
- `GET /api/supplier/customers` — Retrieve aggregated list of customers with repeat purchase metrics & AOV
- `GET /api/supplier/offers` — List supplier-scoped discount coupons
- `POST /api/supplier/offers` — Create new supplier coupon code (% OFF, ₹ OFF, Free Delivery)
- `PATCH /api/supplier/offers` — Enable or disable coupon code
- `POST /api/supplier/offers/validate` — Server-side coupon code validation & discount calculation
- `GET /api/supplier/analytics` — Server-side aggregated dashboard metrics, revenue time-series, and top products

## Direct Supplier Communication
- `GET /api/chat/conversations` — Fetch customer direct conversation threads with local verified suppliers
- `POST /api/chat/conversations` — Find or initiate a 1:1 conversation thread with a supplier
- `GET /api/chat/messages?conversationId={id}` — Fetch conversation message history from PostgreSQL
- `POST /api/chat/messages` — Send message/attachment, persist to Prisma DB, and broadcast via Supabase Realtime

## Orders & Live Delivery Tracking
- `GET /api/orders` — List customer orders (filtered by active, delivered, cancelled)
- `POST /api/orders` — Execute atomic checkout transaction (stock validation, payment, status history, outbox event)
- `GET /api/orders/[id]` — Retrieve full order detail, items, payment status, and delivery details
- `PATCH /api/orders/[id]` — Transition order lifecycle status with authorization check
- `GET /api/delivery/location?orderId={id}` — Retrieve current delivery partner GPS coordinates for active order tracking
- `POST /api/delivery/location` — Assigned delivery partner GPS location update (throttled & validated)

## Customer Preferences & Dispute Management
- `GET /api/notifications` — Retrieve customer realtime notifications
- `PATCH /api/notifications` — Mark all notifications as read
- `GET /api/complaints` — Retrieve customer support complaint tickets
- `POST /api/complaints` — Raise a new dispute/complaint ticket for an order or product

## AI Assistants
- `POST /api/ai/shopping` — AI Shopping Assistant meal bundle & budget recommendation
- `POST /api/ai/support` — AI Support Assistant order tracking & issue escalation
