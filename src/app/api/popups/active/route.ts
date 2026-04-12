import { NextResponse } from 'next/server';
import { getServerErrorSummary } from '@/lib/serverError';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/popups/active`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch active popups' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      `[API /popups/active] Proxy error: ${getServerErrorSummary(error)}`
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

