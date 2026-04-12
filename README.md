# Glovia Market place — Premium Marketplace Frontend

Glovia Market place is a modern multi-vendor e-commerce marketplace frontend built with Next.js, Tailwind CSS, Framer Motion, Three.js, and GSAP.

This repository now includes:
- Premium 3D hero interaction and animated homepage sections
- Conversion-focused UX blocks (categories, trust, offers, testimonials, newsletter)
- Glassmorphism header, dark mode, mobile bottom navigation
- Scalable backend/API/schema blueprint docs for full marketplace rollout

## Tech Stack

- Next.js 14
- React 18
- Tailwind CSS
- Framer Motion
- Three.js
- GSAP
- SWR + Zustand

## Project Structure

```txt
src/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ HomeContent.client.tsx
│  └─ client-layout.tsx
├─ components/
│  ├─ layout/Header.tsx
│  ├─ premium/HeroThreeScene.tsx
│  └─ ...
├─ lib/
│  ├─ api.ts
│  ├─ serverApi.ts
│  ├─ serverError.ts
│  └─ seoStructuredData.ts
└─ types/index.ts

docs/
├─ GOLVIA_MARKETPLACE_IMPLEMENTATION.md
├─ database-schema.sql
└─ sample-product-seed.json
```

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env.local
```

3. Run development server

```bash
npm run dev
```

4. Production build

```bash
npm run build
npm start
```

## Environment Configuration

Use `.env.example` as base. Key variables:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_ENABLE_3D` (optional)
- `NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS` (optional)

## Backend/API/Database Outputs

The requested backend structure and data modeling deliverables are included in:

- [docs/GOLVIA_MARKETPLACE_IMPLEMENTATION.md](docs/GOLVIA_MARKETPLACE_IMPLEMENTATION.md)
- [docs/database-schema.sql](docs/database-schema.sql)
- [docs/sample-product-seed.json](docs/sample-product-seed.json)
- [docs/IMPLEMENTATION_OUTPUTS.md](docs/IMPLEMENTATION_OUTPUTS.md)
- [docs/GLOVIA_BEAUTY_CATALOG_BLUEPRINT.md](docs/GLOVIA_BEAUTY_CATALOG_BLUEPRINT.md)

These include:
- Backend module/folder structure
- Role-based auth + payment integration design
- REST endpoint map
- PostgreSQL schema
- Sample seed data
- Deployment and env guidance

## Deployment

### Frontend
- Vercel recommended

### Backend (recommended)
- Render / Railway / Fly.io / AWS ECS

### Database
- Managed PostgreSQL (Neon / Supabase / RDS)

## Performance Targets

- Keep Lighthouse Performance > 90
- Use dynamic imports for heavy/interactive blocks
- Serve optimized product images (WebP/AVIF)
- Cache public catalog endpoints and hero data

## Roadmap

1. Full checkout provider verification (eSewa/Khalti/IME Pay)
2. Seller onboarding and KYC workflow
3. Recommendation service (events + model refresh jobs)
4. A/B testing for conversion funnel sections
