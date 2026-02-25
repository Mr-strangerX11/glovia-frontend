import { cookies as nextCookies } from "next/headers";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://backend-glovia.vercel.app";

export async function fetchProducts({ category, brand, search }: any) {
  const params: any = {};
  if (category) params.category = category;
  if (brand) params.brand = brand;
  if (search) params.search = search;
  const res = await axios.get(`${API_BASE}/products`, { params });
  return res.data;
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
  const res = await axios.get(`${API_BASE}/products`, { params: { featured: true, limit } });
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
