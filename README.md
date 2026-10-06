# SUPPLIER2PUBLIC — Multi-Vendor Quick-Commerce Marketplace

> **Core Differentiator**: Customers can directly communicate with verified local suppliers before and after ordering.

---

## 🌟 Product Vision & Architecture

**SUPPLIER2PUBLIC** connects:
`CUSTOMERS` ↔ `VERIFIED SUPPLIERS` ↔ `DELIVERY PARTNERS` ↔ `ADMIN & SUPPORT`

Unlike traditional dark-store quick-commerce applications, **SUPPLIER2PUBLIC** empowers customers to compare prices across nearby verified local stores, check live inventory, and communicate directly with suppliers via real-time chat for stock inquiries, bulk discounts, and special packaging requests.

---

## 🚀 Key Features

1. **Direct Customer-Supplier Communication**:
   - Real-time chat threads between buyers and sellers.
   - Attach text messages, image proofs, and shared product/order cards.
   - Message timestamps, unread counts, online/offline availability indicators.

2. **Smart Product-Supplier Comparison Matrix**:
   - Compares the SAME catalog item across multiple nearby stores.
   - Displays Price, Distance (km), Rating, Stock count, Estimated delivery time, and Verification badge.

3. **Multi-Role RBAC System**:
   - Customer, Supplier, Delivery Partner, Admin, Support Agent.
   - Full server-side authorization enforcement via JWT cookies and Prisma checks.

4. **AI-Powered Assistants**:
   - **AI Shopping Assistant**: Recommends multi-product meal/grocery bundles under a customer's specific budget.
   - **AI Support Assistant**: Inspects active order status, rider ETA, and handles issue escalation.

5. **Supplier Dashboard & Verification**:
   - Store KPIs: Today revenue, total orders, low-stock threshold alerts, average rating.
   - Verification document portal for GST, FSSAI, PAN, and store photos.

6. **Delivery Partner App**:
   - On-duty/Off-duty toggle, nearby delivery jobs, pickup confirmation, OTP verification.

7. **Disputes & Customer Support**:
   - Complaint ticketing system with multi-party communication and refund workflows.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router, TypeScript, React)
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM
- **Authentication**: JWT HttpOnly cookies, bcryptjs password hashing, role-based access control
- **Icons & Animations**: Lucide Icons, Framer Motion

---

## 🔐 Demo Credentials

All passwords are: `Password123!`

- **Customer**: `customer@supplier2public.com`
- **Supplier**: `supplier@supplier2public.com`
- **Delivery Partner**: `delivery@supplier2public.com`
- **Admin**: `admin@supplier2public.com`
- **Support Agent**: `support@supplier2public.com`

---

## 💻 Local Setup Instructions

1. **Clone repository & install dependencies**:
   ```bash
   npm install
   ```

2. **Database Push & Seed**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.
