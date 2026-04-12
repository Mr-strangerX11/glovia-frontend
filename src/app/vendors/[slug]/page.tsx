import { adminAPI } from "@/lib/api";
import { fetchProducts } from "@/lib/serverApi";
import { getServerErrorSummary } from "@/lib/serverError";
import VendorStoreContent from "./VendorStoreContent.client";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data } = await adminAPI.getAllVendors();
    const vendors = Array.isArray(data) ? data : data?.data ?? [];
    const vendor = vendors.find((v: any) => {
      const emailSlug = (v.email || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
      return emailSlug === params.slug;
    });
    if (vendor) {
      const name = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email;
      return {
        title: `${name} — Glovia Marketplace`,
        description: vendor.vendorDescription || `Shop products from ${name} on Glovia Marketplace Nepal.`,
      };
    }
  } catch {
    return { title: `Vendor Store — Glovia Marketplace` };
  }
  return { title: `Vendor Store — Glovia Marketplace` };
}

export default async function VendorStorePage({ params }: Props) {
  const { slug } = params;

  let vendor: any = null;
  let products: any[] = [];

  // Fetch all vendors and find by slug
  try {
    const vendorsResult = await adminAPI.getAllVendors();
    const vendors = Array.isArray(vendorsResult?.data) ? vendorsResult.data : vendorsResult?.data?.data ?? [];

    vendor = vendors.find((v: any) => {
      const emailSlug = (v.email || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
      return emailSlug === slug;
    });

    if (!vendor) {
      console.warn(`[VendorStore] Vendor not found for slug: ${slug}`);
      notFound();
    }

    // Fetch products by vendor email
    const productsResult = await fetchProducts({ brand: vendor.email, limit: 50 });
    products = Array.isArray(productsResult) ? productsResult : productsResult?.data ?? [];
  } catch (err) {
    console.warn(`[VendorStore] Fetch failed (${getServerErrorSummary(err)})`);
    notFound();
  }

  if (!vendor) notFound();

  return <VendorStoreContent vendor={vendor} products={products} slug={slug} />;
}
