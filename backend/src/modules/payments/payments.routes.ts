import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';

const verifySchema = z.object({
  orderId: z.string().min(3),
  provider: z.enum(['khalti', 'esewa']),
  transactionId: z.string().min(3),
  amount: z.number().positive(),
});

export const paymentsRouter = Router();

paymentsRouter.post('/verify', requireAuth, (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const verified = parsed.data.transactionId.startsWith('tx_');

  if (!verified) {
    return res.status(400).json({ ok: false, message: 'Payment verification failed' });
  }

  return res.json({
    ok: true,
    message: `${parsed.data.provider} payment verified`,
    data: {
      orderId: parsed.data.orderId,
      transactionId: parsed.data.transactionId,
      amount: parsed.data.amount,
      status: 'paid',
    },
  });
});
