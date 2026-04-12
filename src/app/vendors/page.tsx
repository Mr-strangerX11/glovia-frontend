import VendorsContent from "./VendorsContent.client";
import type { Metadata } from 'next';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'All Vendors — Glovia Marketplace',
  description: 'Browse all verified vendors on Glovia Marketplace Nepal. Find trusted sellers across Beauty, Medicine, Clothing & Essentials.',
  alternates: { canonical: '/vendors' },
};

export default async function VendorsPage() {
  // Vendors are fetched client-side to handle authentication properly
  return <VendorsContent vendors={null} />;
}
