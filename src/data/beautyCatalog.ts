export type MainCategorySlug =
  | 'skincare'
  | 'makeup'
  | 'haircare'
  | 'body-care'
  | 'tools-accessories'
  | 'fragrance'
  | 'organic-natural'
  | 'mens-grooming';

export type SmartTag =
  | 'Best Seller'
  | 'Trending'
  | 'New Arrival'
  | 'Limited Edition'
  | 'Dermatologist Approved'
  | 'Organic'
  | 'Cruelty-Free'
  | 'Vegan'
  | 'Imported'
  | 'Authentic Guaranteed';

export const GLOVIA_MAIN_CATEGORIES: Array<{ slug: MainCategorySlug; label: string }> = [
  { slug: 'skincare', label: 'Skincare' },
  { slug: 'makeup', label: 'Makeup' },
  { slug: 'haircare', label: 'Haircare' },
  { slug: 'body-care', label: 'Body Care' },
  { slug: 'tools-accessories', label: 'Tools & Accessories' },
  { slug: 'fragrance', label: 'Fragrance' },
  { slug: 'organic-natural', label: 'Organic & Natural' },
  { slug: 'mens-grooming', label: 'Men’s Grooming' },
];

export const GLOVIA_SUBCATEGORY_GROUPS: Record<MainCategorySlug, Array<{ group: string; items: string[] }>> = {
  skincare: [
    {
      group: 'By Product Type',
      items: [
        'Cleanser',
        'Face Wash',
        'Toner',
        'Serum',
        'Moisturizer',
        'Sunscreen',
        'Face Mask',
        'Exfoliator',
        'Eye Cream',
        'Spot Treatment',
        'Night Cream',
      ],
    },
    {
      group: 'By Skin Concern',
      items: [
        'Acne & Pimple',
        'Dark Spots',
        'Dry Skin',
        'Oily Skin',
        'Sensitive Skin',
        'Anti-Aging',
        'Hyperpigmentation',
        'Dull Skin',
      ],
    },
    {
      group: 'By Skin Type',
      items: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'],
    },
  ],
  makeup: [
    {
      group: 'Face',
      items: ['Foundation', 'BB/CC Cream', 'Concealer', 'Compact Powder', 'Blush', 'Highlighter', 'Bronzer'],
    },
    {
      group: 'Eyes',
      items: ['Mascara', 'Eyeliner', 'Kajal', 'Eyeshadow', 'Eyebrow Pencil'],
    },
    {
      group: 'Lips',
      items: ['Lipstick', 'Liquid Lipstick', 'Lip Gloss', 'Lip Tint', 'Lip Balm'],
    },
  ],
  haircare: [
    {
      group: 'Haircare',
      items: ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Mask', 'Hair Serum', 'Hair Color', 'Anti-Hair Fall', 'Dandruff Control'],
    },
  ],
  'body-care': [
    {
      group: 'Body Care',
      items: ['Body Lotion', 'Body Butter', 'Body Wash', 'Scrub', 'Hand Cream', 'Foot Care'],
    },
  ],
  'tools-accessories': [
    {
      group: 'Tools & Accessories',
      items: ['Makeup Brushes', 'Beauty Blender', 'Hair Tools', 'Facial Roller', 'Eyelash Curler'],
    },
  ],
  fragrance: [
    {
      group: 'Fragrance',
      items: ['Perfume (Women)', 'Perfume (Men)', 'Body Mist', 'Deodorant'],
    },
  ],
  'organic-natural': [
    {
      group: 'Organic & Natural',
      items: ['Herbal Skincare', 'Organic Oils', 'Chemical-Free Makeup', 'Ayurvedic Products'],
    },
  ],
  'mens-grooming': [
    {
      group: 'Men’s Grooming Types',
      items: ['Beard Oil', 'Face Wash', 'Hair Wax', "Men's Perfume"],
    },
  ],
};

export const GLOVIA_BRAND_LAYERS = [
  'Korean Brands',
  'Indian Brands',
  'Nepali Brands',
  'Luxury Brands',
  'Drugstore Brands',
] as const;

export const GLOVIA_PRICE_FILTERS = [
  { id: 'all', label: 'All Prices', min: 0, max: Number.POSITIVE_INFINITY },
  { id: 'under-500', label: 'Under Rs. 500', min: 0, max: 500 },
  { id: '500-1000', label: 'Rs. 500–1000', min: 500, max: 1000 },
  { id: '1000-2000', label: 'Rs. 1000–2000', min: 1000, max: 2000 },
  { id: '2000-plus', label: 'Rs. 2000+', min: 2000, max: Number.POSITIVE_INFINITY },
] as const;

export const GLOVIA_SMART_TAGS: SmartTag[] = [
  'Best Seller',
  'Trending',
  'New Arrival',
  'Limited Edition',
  'Dermatologist Approved',
  'Organic',
  'Cruelty-Free',
  'Vegan',
  'Imported',
  'Authentic Guaranteed',
];

export const GLOVIA_AI_SHORTCUTS = [
  'Find products for my skin',
  'Build my skincare routine',
  'Recommended for you',
  'Customers also bought',
] as const;

export const GLOVIA_FUTURE_EXPANSION = [
  'Phase 1 → Beauty Only',
  'Phase 2 → Add Health Supplements',
  'Phase 3 → Launch Glovia Private Label',
  'Phase 4 → Multi-vendor Marketplace',
] as const;

export function inferSmartTags(product: any): SmartTag[] {
  const tags = new Set<SmartTag>();
  const name = String(product?.name || '').toLowerCase();
  const description = String(product?.description || '').toLowerCase();

  if (product?.isBestSeller) tags.add('Best Seller');
  if (product?.isNew || product?.isNewProduct) tags.add('New Arrival');
  if (Number(product?.averageRating || 0) >= 4.5) tags.add('Trending');
  if (/limited|exclusive|edition/.test(name) || /limited|exclusive|edition/.test(description)) tags.add('Limited Edition');
  if (/dermatologist|doctor tested/.test(description)) tags.add('Dermatologist Approved');
  if (/organic|natural|herbal|ayurvedic/.test(name) || /organic|natural|herbal|ayurvedic/.test(description)) tags.add('Organic');
  if (/cruelty[- ]?free/.test(description)) tags.add('Cruelty-Free');
  if (/vegan/.test(description)) tags.add('Vegan');
  if (/imported|korean|k-beauty/.test(name) || /imported|korean|k-beauty/.test(description)) tags.add('Imported');
  tags.add('Authentic Guaranteed');

  return [...tags];
}

export function inferMainCategorySlug(product: any): MainCategorySlug {
  const categoryName = String(product?.category?.name || '').toLowerCase();
  const productName = String(product?.name || '').toLowerCase();
  const haystack = `${categoryName} ${productName}`;

  if (/skin|serum|cleanser|toner|moisturizer|sunscreen/.test(haystack)) return 'skincare';
  if (/makeup|lip|foundation|concealer|mascara|eyeliner/.test(haystack)) return 'makeup';
  if (/hair|shampoo|conditioner|dandruff/.test(haystack)) return 'haircare';
  if (/body|lotion|scrub|butter/.test(haystack)) return 'body-care';
  if (/tool|brush|blender|roller|curler/.test(haystack)) return 'tools-accessories';
  if (/perfume|fragrance|mist|deodorant/.test(haystack)) return 'fragrance';
  if (/organic|natural|herbal|ayurvedic/.test(haystack)) return 'organic-natural';
  if (/men|beard|groom/.test(haystack)) return 'mens-grooming';

  return 'skincare';
}
