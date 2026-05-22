import { NextResponse } from 'next/server';
import { getServerErrorSummary } from '@/lib/serverError';
import { getServerApiBaseUrl } from '@/lib/apiBase';

const API_URL = getServerApiBaseUrl();

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

