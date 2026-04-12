# Glovia Market place Implementation Blueprint

This blueprint is designed for a premium multi-vendor e-commerce marketplace with modern UX, scalable backend, and Nepal-specific payments.

## 1) Recommended Monorepo Structure

```txt
glovia-marketplace/
├─ apps/
│  ├─ web/                          # Next.js frontend
│  └─ api/                          # Express backend (alternative: Django DRF)
├─ packages/
│  ├─ ui/                           # shared component library
│  ├─ config/                       # eslint/tsconfig/tailwind presets
│  └─ types/                        # shared TS types
├─ infra/
│  ├─ docker/
│  └─ nginx/
├─ docs/
│  ├─ api-spec.md
│  ├─ deployment.md
│  └─ architecture.md
└─ .github/workflows/
```

## 2) Backend API Structure (Node.js + Express)

```txt
api/
├─ src/
│  ├─ app.ts
│  ├─ server.ts
│  ├─ config/
│  │  ├─ env.ts
│  │  └─ database.ts
│  ├─ middleware/
│  │  ├─ auth.ts
│  │  ├─ roles.ts
│  │  ├─ csrf.ts
│  │  ├─ rateLimit.ts
│  │  └─ errorHandler.ts
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ users/
│  │  ├─ sellers/
│  │  ├─ products/
│  │  ├─ categories/
│  │  ├─ cart/
│  │  ├─ orders/
│  │  ├─ payments/
│  │  ├─ reviews/
│  │  ├─ recommendations/
│  │  └─ analytics/
│  └─ jobs/
│     ├─ inventorySync.ts
│     └─ recommendationRefresh.ts
└─ prisma/
   ├─ schema.prisma
   └─ seed.ts
```

## 3) Core REST Endpoints

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Marketplace
- `GET /api/v1/products`
- `GET /api/v1/products/:slug`
- `GET /api/v1/categories`
- `GET /api/v1/brands`
- `GET /api/v1/recommendations?userId=...`

### Cart & Checkout
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/:itemId`
- `DELETE /api/v1/cart/items/:itemId`
- `POST /api/v1/checkout/session`

### Orders
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`
- `PATCH /api/v1/orders/:id/status`

### Seller
- `GET /api/v1/vendor/products`
- `POST /api/v1/vendor/products`
- `PATCH /api/v1/vendor/products/:id`
- `GET /api/v1/vendor/analytics`

### Admin
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/sellers`
- `GET /api/v1/admin/reports/sales`

## 4) Role-Based Access

- `CUSTOMER`: browse, order, review, wishlist
- `SELLER`: manage own products/orders/analytics
- `ADMIN`: full platform controls

Use middleware chain:
- `authRequired`
- `requireRole('SELLER' | 'ADMIN')`

## 5) Database Schema (PostgreSQL)

Tables:
- `users` (customer/seller/admin)
- `seller_profiles`
- `categories`
- `brands`
- `products`
- `product_images`
- `inventory`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `reviews`
- `wishlists`
- `support_tickets`
- `recommendation_events`

Indexes:
- `products (slug)` unique
- `products (is_featured, created_at)`
- `orders (user_id, created_at)`
- `reviews (product_id, created_at)`

## 6) Payments Integration Pattern

Providers:
- eSewa
- Khalti
- IME Pay
- COD

Flow:
1. Create payment intent from checkout summary.
2. Redirect/initiate provider transaction.
3. Verify callback signature/server-to-server status.
4. Mark `payments.status = COMPLETED`.
5. Confirm order and trigger receipt + SMS.

## 7) AI Recommendation Engine

Signals:
- product views
- cart additions
- purchases
- wishlist actions

Approach:
- short-term: rule-based + category affinity
- mid-term: collaborative filtering batch job
- serving route: `GET /api/v1/recommendations`

## 8) Security Checklist

- JWT access + refresh rotation
- bcrypt password hashing
- CSRF token on mutating browser requests
- rate limiting on auth/payment routes
- secure HTTP-only cookies
- payment callback verification

## 9) Frontend Performance Targets

- Next.js App Router with SSR/streaming where needed
- dynamic imports for heavy sections
- optimized images (WebP/AVIF)
- edge caching for public catalogs
- Lighthouse goal: 90+

## 10) Deployment

Frontend:
- Vercel

Backend:
- Render / Railway / ECS / Fly.io

Database:
- Managed PostgreSQL (Neon, RDS, Supabase)

CDN:
- Vercel edge + object storage for media

## 11) Environment Variables

```env
# frontend
NEXT_PUBLIC_SITE_URL=https://www.golvia.com.np
NEXT_PUBLIC_API_URL=https://api.golvia.com.np/api/v1

# backend
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
COOKIE_DOMAIN=.golvia.com.np

# payments
ESEWA_MERCHANT_CODE=...
ESEWA_SECRET=...
KHALTI_SECRET_KEY=...
IMEPAY_MERCHANT_ID=...
IMEPAY_SECRET_KEY=...

# infra
REDIS_URL=redis://...
S3_BUCKET=golvia-assets
S3_REGION=ap-south-1
```
