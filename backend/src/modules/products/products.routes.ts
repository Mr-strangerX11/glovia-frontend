import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const productCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().int().nonnegative(),
  category: z.string().min(2),
  brand: z.string().min(2),
  images: z.array(z.string().url()).min(1),
});

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: string;
  brand: string;
  images: string[];
};

const products: Product[] = [
  {
    id: 'prod_001',
    name: 'Himalayan Organic Honey',
    slug: 'himalayan-organic-honey',
    description: 'Pure organic honey sourced from high-altitude farms.',
    price: 899,
    compareAtPrice: 1099,
    stock: 120,
    category: 'Groceries',
    brand: 'Nepal Naturals',
    images: ['https://images.unsplash.com/photo-1587049352851-8d4e89133924'],
  },
];

export const productsRouter = Router();

productsRouter.get('/', (req, res) => {
  const search = String(req.query.search || '').toLowerCase();
  const category = String(req.query.category || '').toLowerCase();

  const filtered = products.filter((product) => {
    const searchMatch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search);
    const categoryMatch = !category || product.category.toLowerCase() === category;
    return searchMatch && categoryMatch;
  });

  return res.json({ ok: true, data: filtered });
});

productsRouter.get('/:slug', (req, res) => {
  const item = products.find((product) => product.slug === req.params.slug);
  if (!item) {
    return res.status(404).json({ ok: false, message: 'Product not found' });
  }

  return res.json({ ok: true, data: item });
});

productsRouter.post('/', requireAuth, requireRole(['seller', 'admin']), (req, res) => {
  const parsed = productCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const product = {
    id: `prod_${Date.now()}`,
    ...parsed.data,
  };

  products.unshift(product);

  return res.status(201).json({ ok: true, message: 'Product created', data: product });
});
