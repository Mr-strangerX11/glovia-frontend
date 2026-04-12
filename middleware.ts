import { NextResponse, NextRequest } from 'next/server';

const PROTECTED_PATHS = [/^\/dashboard/, /^\/account/, /^\/wishlist/, /^\/cart/, /^\/checkout/];
const ADMIN_PATHS = [/^\/dashboard\/admin/];
const VENDOR_PATHS = [/^\/dashboard\/vendor/];

async function verifyToken(token: string) {
  const secret = process.env.NEXT_PUBLIC_JWT_SECRET;
  if (!secret) return null;
  try {
    const { jwtVerify } = await import('jose');
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return payload as { role?: string };
  } catch (err) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some((regex) => regex.test(pathname));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('access_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Role-based gating for admin and vendor sections
  if (ADMIN_PATHS.some((r) => r.test(pathname)) && payload.role && !['ADMIN', 'SUPER_ADMIN'].includes(payload.role)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  if (VENDOR_PATHS.some((r) => r.test(pathname)) && payload.role !== 'VENDOR') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/wishlist', '/cart', '/checkout'],
};
