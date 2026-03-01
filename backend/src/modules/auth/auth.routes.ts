import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['customer', 'seller']).default('customer'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = Router();

const jwtSecret: jwt.Secret = process.env.JWT_SECRET || 'dev-secret';
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const data = parsed.data;
  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = {
    id: `usr_${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    passwordHash,
  };

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  return res.status(201).json({
    ok: true,
    message: 'Registered successfully',
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const data = parsed.data;
  const fakeStoredHash = await bcrypt.hash('password123', 10);
  const valid = await bcrypt.compare(data.password, fakeStoredHash);

  if (!valid) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  }

  const user = {
    id: 'usr_demo_customer',
    name: 'Demo User',
    email: data.email,
    role: 'customer',
  };

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  return res.json({ ok: true, message: 'Login successful', user, token });
});
