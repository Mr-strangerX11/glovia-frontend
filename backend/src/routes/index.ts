import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { productsRouter } from '../modules/products/products.routes.js';
import { ordersRouter } from '../modules/orders/orders.routes.js';
import { paymentsRouter } from '../modules/payments/payments.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/payments', paymentsRouter);
