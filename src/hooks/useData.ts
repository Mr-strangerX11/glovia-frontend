import useSWR from 'swr';
import { productsAPI, categoriesAPI, cartAPI, wishlistAPI, ordersAPI, userAPI, bannersAPI, blogsAPI, adminAPI } from '@/lib/api';
import { Product, Category, Cart, WishlistItem, Order, User, Address, Banner, Blog } from '@/types';

const fetcher = (fn: () => Promise<any>) => fn().then(res => res.data);

export function useProducts(params?: any) {
  const { data, error, mutate } = useSWR(
    params ? ['/products', params] : '/products',
    () => fetcher(() => productsAPI.getAll(params))
  );

  return {
    products: data?.data as Product[],
    meta: data?.meta,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useProduct(slug: string) {
  const { data, error, mutate } = useSWR(
    slug ? `/products/${slug}` : null,
    () => fetcher(() => productsAPI.getBySlug(slug))
  );

  return {
    product: data as Product,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useFeaturedProducts(limit?: number) {
  const { data, error } = useSWR(
    ['/products/featured', limit],
    () => fetcher(() => productsAPI.getFeatured(limit))
  );

  return {
    products: data as Product[],
    isLoading: !error && !data,
    isError: error,
  };
}

export function useCategories() {
  const { data, error } = useSWR('/categories', () => fetcher(categoriesAPI.getAll));

  return {
    categories: data as Category[],
    isLoading: !error && !data,
    isError: error,
  };
}

export function useCart() {
  const { data, error, mutate } = useSWR('/cart', () => fetcher(cartAPI.get));

  return {
    cart: data as Cart,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useWishlist() {
  const { data, error, mutate } = useSWR('/wishlist', () => fetcher(wishlistAPI.get));

  return {
    wishlist: data as WishlistItem[],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useOrders() {
  const { data, error, mutate } = useSWR('/orders', () => fetcher(ordersAPI.getAll));

  return {
    orders: data as Order[],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useOrder(id: string) {
  const { data, error, mutate } = useSWR(
    id ? `/orders/${id}` : null,
    () => fetcher(() => ordersAPI.getById(id))
  );

  return {
    order: data as Order,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useProfile() {
  const { data, error, mutate } = useSWR('/users/profile', () => fetcher(userAPI.getProfile));

  return {
    user: data as User,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useAddresses() {
  const { data, error, mutate } = useSWR('/users/addresses', () => fetcher(userAPI.getAddresses));

  return {
    addresses: data as Address[],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useBanners() {
  const { data, error } = useSWR('/banners', () => fetcher(bannersAPI.getAll));

  return {
    banners: data as Banner[],
    isLoading: !error && !data,
    isError: error,
  };
}

export function useBlogs(params?: any) {
  const { data, error } = useSWR(
    params ? ['/blogs', params] : '/blogs',
    () => fetcher(() => blogsAPI.getAll(params))
  );

  return {
    blogs: data?.data as Blog[],
    meta: data?.meta,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useAdminDashboard() {
  const { data, error } = useSWR('/admin/dashboard', () => fetcher(adminAPI.getDashboard));

  return {
    dashboard: data,
    isLoading: !error && !data,
    isError: error,
  };
}
