import { NextResponse } from 'next/server';
import { getServerErrorSummary } from '@/lib/serverError';
import { getServerApiBaseUrl } from '@/lib/apiBase';

const API_URL = getServerApiBaseUrl();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const productId = searchParams.get('productId');

  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (productId) params.append('productId', productId);

    const response = await fetch(`${API_URL}/recommendations?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch recommendations' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      `[API /recommendations] Proxy error: ${getServerErrorSummary(error)}`
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

