# Glovia Nepal Beauty Catalog Blueprint

This blueprint implements the requested beauty-first category system in a format that is clean, SEO-friendly, easy to expand, and ready for relational database rollout.

## 1) Core Catalog Taxonomy (Implemented)

Source of truth in code:
- `src/data/beautyCatalog.ts`

Includes:
- Main categories (10)
- Deep subcategory groups (skincare, makeup, haircare, etc.)
- Brand filter layers
- Price filter bands
- Smart tag vocabulary
- AI browse shortcut intents
- Future phase roadmap constants

## 2) UI Integration (Implemented)

### Product listing/category page
- `src/app/products/ProductsContent.client.tsx`

Added:
- Main category filtering
- Subcategory context display
- Price preset filtering (`Under 500`, `500-1000`, `1000-2000`, `2000+`)
- Smart tag filtering
- AI shortcut links for guided browsing

### Product detail page
- `src/app/products/[slug]/page.tsx`

Added:
- Smart tag badges
- Skin type compatibility section
- Delivery estimate
- FAQ section
- AI routine/recommendation shortcut links

## 3) Relational Database Model (Developer Ready)

Recommended entities:

1. `categories`
- id, name, slug, description, parent_id (nullable), level, is_active

2. `brands`
- id, name, slug, brand_layer (`KOREAN`, `INDIAN`, `NEPALI`, `LUXURY`, `DRUGSTORE`), is_active

3. `products`
- id, name, slug, brand_id, category_id, description, ingredients, how_to_use, price, compare_at_price, discount_pct, is_active

4. `product_variants`
- id, product_id, sku, variant_type (`SIZE`, `SHADE`), label, value, price_delta, stock_quantity

5. `product_tags`
- id, product_id, tag (enum from smart tags)

6. `product_skin_types`
- id, product_id, skin_type (`OILY`, `DRY`, `COMBINATION`, `SENSITIVE`, `NORMAL`)

7. `inventory_movements`
- id, product_id, variant_id, movement_type (`IN`, `OUT`, `ADJUSTMENT`), quantity, reason, created_at

8. `reviews`
- id, product_id, user_id, rating, title, comment, created_at

9. `offers`
- id, title, type (`FLASH`, `SEASONAL`, `BUNDLE`), starts_at, ends_at, is_active

10. `coupons`
- id, code, discount_type (`PERCENT`, `FLAT`), discount_value, min_order_amount, usage_limit, expires_at, is_active

## 4) SEO Strategy for Beauty Niche Domination

- Category landing pages with targeted metadata per concern/type (e.g., acne, anti-aging)
- Smart tags included in structured product descriptors
- Internal linking via related categories + AI shortcut pages
- Long-tail URL strategy:
  - `/products?category=skincare&concern=acne`
  - `/products?category=makeup&tag=cruelty-free`

## 5) AI Category System

Planned endpoints:
- `GET /ai/find-products-for-skin?skinType=&concern=`
- `POST /ai/build-routine`
- `GET /ai/recommended-for-you?userId=`
- `GET /ai/customers-also-bought?productId=`

Current frontend AI shortcut intents are implemented and routed through `/ai` query prompts.

## 6) Expansion Roadmap

- Phase 1: Beauty only (active)
- Phase 2: Health supplements
- Phase 3: Glovia private label
- Phase 4: Full multi-vendor marketplace scale-up

## 7) Recommended Next Engineering Steps

1. Persist smart tags and skin type compatibility in product admin forms.
2. Add `subcategory` and `concern` URL params to listing route and SSR fetch layer.
3. Create dedicated SEO pages for each major concern and K-beauty segment.
4. Add analytics tracking for filter interactions and AI shortcut usage.
