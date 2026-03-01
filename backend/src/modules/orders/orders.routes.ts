import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';

const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(3),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
      })
    )
    .min(1),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(7),
    city: z.string().min(2),
    district: z.string().min(2),
    street: z.string().min(3),
  }),
  paymentMethod: z.enum(['cod', 'khalti', 'esewa']),
});

type Order = {
  id: string;
  userId: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
  paymentMethod: 'cod' | 'khalti' | 'esewa';
};

const orders: Order[] = [];

export const ordersRouter = Router();

ordersRouter.get('/me', requireAuth, (req, res) => {
  const userOrders = orders.filter((order) => order.userId === req.user?.sub);
  return res.json({ ok: true, data: userOrders });
});

ordersRouter.post('/', requireAuth, (req, res) => {
  const parsed = orderCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const totalAmount = parsed.data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  const order: Order = {
    id: `ord_${Date.now()}`,
    userId: req.user!.sub,
    items: parsed.data.items,
    totalAmount,
    status: parsed.data.paymentMethod === 'cod' ? 'processing' : 'pending',
    paymentMethod: parsed.data.paymentMethod,
  };

  orders.unshift(order);

  return res.status(201).json({ ok: true, message: 'Order created', data: order });
});
