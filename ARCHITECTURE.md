# SupplyBridge — System Architecture Specification

## Overview

SupplyBridge is architected as a high-performance, multi-vendor quick-commerce platform connecting customers directly with local verified suppliers. The platform enforces strict separation between database state persistence and realtime event delivery.

---

## Technical Stack Architecture

```text
Next.js (App Router, Server Components & Route Handlers)
   │
   ├── Auth & RBAC (Session, JWT, Server-Side Role Enforcement)
   │
   ├── Validations (Zod Schemas)
   │
   └── Services (Business Rules & Transactions)
            │
            ▼
         Prisma ORM
            │
            ▼
       PostgreSQL (Authoritative Source of Truth)
```

---

## Realtime Architecture (Outbox Pattern)

```text
Business Operation (e.g. Order Placed / Chat Sent / Driver Relocated)
       │
       ▼
Prisma Database Transaction
  ├── 1. Authoritative State Mutation (PostgreSQL)
  └── 2. Insert Record into RealtimeEventLog (Outbox)
       │
       ▼
     COMMIT
       │
       ▼
Async Event Publisher (Retries & Idempotency Check)
       │
       ▼
Supabase Realtime Channel Broadcast
       │
       ▼
Authorized Connected Clients (Customer / Supplier / Delivery Partner UI)
```

---

## Storage Architecture

```text
Browser Client
   │
   ▼
Authenticated Route Handler / Server Action
   │ (Validates MIME type, file size & ownership)
   ▼
Supabase Storage Bucket
   ├── product-images/
   ├── supplier-documents/
   ├── complaint-attachments/
   └── delivery-proofs/
```

---

## Maps & Location Architecture

```text
Delivery Partner Device (navigator.geolocation.watchPosition)
   │ (Throttled: >10m distance AND >5s elapsed)
   ▼
POST /api/delivery/location
   │ (Authenticated & Assigned Order Verified)
   ▼
Upsert CurrentDeliveryLocation & DeliveryPartnerLocation Log
   │
   ▼
Outbox Event DELIVERY_LOCATION_UPDATED
   │
   ▼
Supabase Realtime Channel: order:{orderId}:tracking
   │
   ▼
Customer UI Live Mapbox Tracking View
```

---

## Payments Architecture

```text
Customer Checkout
   │
   ▼
Razorpay Payment Order Creation
   │
   ▼
Razorpay Checkout SDK Modal (Client)
   │
   ▼
Server-side Verification & Webhook Event Processing
   │ (Idempotency check: providerPaymentId)
   ▼
Prisma Transaction (Mark Order & Payment PAID)
```

---

## Security & Access Control

1. **Authentication**:
   - HTTP-only secure cookie signed with JWT secret.
   - Secure salted password hashing via `bcryptjs`.
2. **RBAC Matrix**:
   - Roles: `CUSTOMER`, `SUPPLIER`, `DELIVERY_PARTNER`, `ADMIN`, `SUPPORT_AGENT`.
   - Permissions enforced server-side before executing any service logic.
3. **Database Isolation**:
   - `SUPABASE_SERVICE_ROLE_KEY` is server-only and protected by runtime import guards.
