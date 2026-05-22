const DEFAULT_BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'https://backend-glovia-delta.vercel.app';

function ensureProtocol(url: string): string {
  return url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`;
}

export function getApiBaseUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_API_URL || '').trim();

  if (configured) {
    const normalized = ensureProtocol(configured).replace(/\/+$/, '');
    return normalized.includes('/api/') ? normalized : `${normalized}/api/v1`;
  }

  return `${DEFAULT_BACKEND_ORIGIN.replace(/\/+$/, '')}/api/v1`;
}

export function getBackendOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/v\d+.*$/, '');
}
