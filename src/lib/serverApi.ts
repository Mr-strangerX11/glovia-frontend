import { cookies as nextCookies } from "next/headers";
import axios from "axios";

const rawApiBase = process.env.NEXT_PUBLIC_API_URL || "https://backend-glovia.vercel.app";
const normalizedApiBase = rawApiBase.startsWith("http") ? rawApiBase : `https://${rawApiBase}`;
const API_BASE = normalizedApiBase.includes("/api/")
  ? normalizedApiBase.replace(/\/+$/, "")
  : `${normalizedApiBase.replace(/\/+$/, "")}/api/v1`;

type ProductQuery = {
  category?: string;
  brand?: string;
  search?: string;
  page?: number;
  limit?: number;
};

function extractProducts(payload: unknown): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data?: unknown[] }).data)
  ) {
    return (payload as { data: unknown[] }).data;
  }

  return [];
}

export async function fetchProducts({ category, brand, search, page, limit }: ProductQuery) {
  const params: ProductQuery = {};
  if (category) params.category = category;
  if (brand) params.brand = brand;
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  const res = await axios.get(`${API_BASE}/products`, { params });
  return res.data;
}

export async function fetchAllProducts(filters: Omit<ProductQuery, 'page' | 'limit'> = {}) {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const allProducts: any[] = [];

  while (page <= totalPages) {
    const response = await fetchProducts({ ...filters, page, limit: pageSize });
    const productsChunk = extractProducts(response);

    allProducts.push(...productsChunk);

    const meta =
      response &&
      typeof response === 'object' &&
      'meta' in response &&
      typeof (response as { meta?: unknown }).meta === 'object'
        ? (response as { meta?: { totalPages?: number } }).meta
        : undefined;

    if (meta?.totalPages && Number.isFinite(meta.totalPages)) {
      totalPages = Math.max(1, Number(meta.totalPages));
    } else {
      if (productsChunk.length < pageSize) {
        break;
      }
      totalPages = page + 1;
    }

    page += 1;
    if (page > 200) {
      break;
    }
  }

  const seen = new Set<string>();
  return allProducts.filter((product) => {
    if (!product || typeof product !== 'object') {
      return false;
    }
    const key = String((product as { id?: string; _id?: string }).id || (product as { _id?: string })._id || '');
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function fetchBrands() {
  const res = await axios.get(`${API_BASE}/brands`);
  return res.data;
}

export async function fetchCategories() {
  const res = await axios.get(`${API_BASE}/categories`);
  return res.data;
}

export async function fetchFeaturedProducts(limit = 12) {
  const res = await axios.get(`${API_BASE}/products/featured`, { params: { limit } });
  return res.data;
}

export async function fetchWishlist(cookies: ReturnType<typeof nextCookies>) {
  // Example: get token from cookies for auth
  const token = cookies.get("token")?.value;
  if (!token) return [];
  const res = await axios.get(`${API_BASE}/wishlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchBanners() {
  const res = await axios.get(`${API_BASE}/banners`);
  return res.data;
}
