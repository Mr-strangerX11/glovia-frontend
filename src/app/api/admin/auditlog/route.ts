import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Forward request to backend API
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const res = await fetch(`${backendUrl}/api/auditlog`, {
    headers: {
      'Content-Type': 'application/json',
      ...(req.headers.get('cookie') ? { 'cookie': req.headers.get('cookie')! } : {}),
    },
    credentials: 'include',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
