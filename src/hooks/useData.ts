import useSWR from 'swr';
import { productsAPI, categoriesAPI, brandsAPI, cartAPI, wishlistAPI, ordersAPI, userAPI, bannersAPI, blogsAPI, adminAPI } from '@/lib/api';
import { Product, Category, Brand, Cart, WishlistItem, Order, User, Address, Banner, Blog } from '@/types';

const normalizeEntity = <T extends Record<string, any>>(entity?: T | null): T | null => {
  if (!entity) return entity as T | null;
  if (entity.id || !entity._id) return entity;
  return { ...entity, id: entity._id } as T;
};

const normalizeArray = <T extends Record<string, any>>(items?: T[] | null): T[] | null | undefined => {
  if (!items) return items;
  return items.map((item) => normalizeEntity(item) as T);
};

const normalizeCart = (cart?: any): Cart | undefined => {
  if (!cart) return cart;
  const items = normalizeArray(cart.items)?.map((item) => ({
    ...item,
    product: normalizeEntity(item.product),
  }));
  return { ...cart, items } as Cart;
};

const normalizeWishlist = (items?: any): WishlistItem[] | undefined => {
  if (!items) return items;
  return normalizeArray(items)?.map((item) => ({
    ...item,
    product: normalizeEntity(item.product),
  })) as WishlistItem[];
};

const normalizeOrders = (orders?: any): Order[] | undefined => {
  if (!orders) return orders;
  return normalizeArray(orders)?.map((order) => ({
    ...order,
    user: normalizeEntity(order.user),
    items: normalizeArray(order.items)?.map((item) => ({
      ...item,
      product: normalizeEntity(item.product),
    })),
  })) as unknown as Order[];
};

const normalizeOrder = (order?: any): Order | null | undefined => {
  if (!order) return order;
  return {
    ...normalizeEntity(order),
    user: normalizeEntity(order.user),
    items: normalizeArray(order.items)?.map((item) => ({
      ...item,
      product: normalizeEntity(item.product),
    })),
  } as Order;
};

const fetcher = (fn: () => Promise<any>) => fn().then(res => res.data);

export function useProducts(params?: any) {
  const { data, error, mutate } = useSWR(
    params ? ['/products', params] : '/products',
    () => fetcher(() => productsAPI.getAll(params))
  );

  return {
    products: normalizeArray(data?.data) as Product[],
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
    product: normalizeEntity(data) as Product,
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
    products: normalizeArray(data) as Product[],
    isLoading: !error && !data,
    isError: error,
  };
}

export function useCategories() {
  const { data, error } = useSWR('/categories', () => fetcher(categoriesAPI.getAll));

  return {
    categories: normalizeArray(data) as Category[],
    isLoading: !error && !data,
    isError: error,
  };
}

export function useBrands() {
  const { data, error } = useSWR('/brands', () => fetcher(brandsAPI.getAll));

  return {
    brands: normalizeArray(data?.data) as Brand[],
    isLoading: !error && !data,
    isError: error,
  };
}

export function useBrandsList() {
  const { data, error } = useSWR('/brands/list', () => fetcher(brandsAPI.getList));

  return {
    brands: normalizeArray(data?.data) as Brand[],
    isLoading: !error && !data,
    isError: error,
  };
}

export function useBrand(slug: string) {
  const { data, error, mutate } = useSWR(
    slug ? `/brands/${slug}` : null,
    () => fetcher(() => brandsAPI.getBySlug(slug))
  );

  const normalizedBrand = data?.data
    ? {
        ...normalizeEntity(data.data),
        products: normalizeArray(data.data.products),
      }
    : data?.data;

  return {
    brand: normalizedBrand as Brand,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useCart() {
  const { data, error, mutate } = useSWR('/cart', () => fetcher(cartAPI.get));

  return {
    cart: normalizeCart(data),
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useWishlist() {
  const { data, error, mutate } = useSWR('/wishlist', () => fetcher(wishlistAPI.get));

  return {
    wishlist: normalizeWishlist(data),
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useOrders() {
  const { data, error, mutate } = useSWR('/orders', () => fetcher(ordersAPI.getAll));

  return {
    orders: normalizeOrders(data),
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
    order: normalizeOrder(data),
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useProfile() {
  const { data, error, mutate } = useSWR('/users/profile', () => fetcher(userAPI.getProfile));

  return {
    user: normalizeEntity(data) as User,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useAddresses() {
  const { data, error, mutate } = useSWR('/users/addresses', () => fetcher(userAPI.getAddresses));

  return {
    addresses: normalizeArray(data) as Address[],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useBanners() {
  const { data, error } = useSWR('/banners', () => fetcher(bannersAPI.getAll));

  return {
    banners: normalizeArray(data) as Banner[],
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
    blogs: normalizeArray(data?.data) as Blog[],
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

export function useAdminBrandAnalytics() {
  const { data, error } = useSWR('/brands/admin/analytics', () => fetcher(adminAPI.getBrandAnalytics));

  return {
    analytics: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
}
