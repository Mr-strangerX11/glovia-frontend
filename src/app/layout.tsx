import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import ClientLayout from './client-layout';
import { getOrganizationStructuredData, getWebsiteStructuredData } from '@/lib/seoStructuredData';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: {
    default: 'Glovia Market place - Premium Beauty & Cosmetics',
    template: '%s | Glovia Market place',
  },
  description: 'Discover premium beauty and cosmetic products made for Nepal. Skincare, haircare, makeup, and organic products for radiant beauty.',
  keywords: ['cosmetics nepal', 'beauty products nepal', 'skincare nepal', 'makeup nepal', 'organic beauty', 'beauty store kathmandu'],
  authors: [{ name: 'Glovia Market place' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://glovia.com.np'),
  openGraph: {
    title: 'Glovia Market place - Premium Beauty & Cosmetics',
    description: 'Discover premium beauty and cosmetic products made for Nepal.',
    type: 'website',
    locale: 'en_NP',
    siteName: 'Glovia Market place',
    images: [
      {
        url: '/icon-512.svg',
        width: 1200,
        height: 630,
        alt: 'Glovia Market place',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glovia Market place - Premium Beauty & Cosmetics',
    description: 'Discover premium beauty and cosmetic products made for Nepal.',
    images: ['/icon-512.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#cc4460',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationData = getOrganizationStructuredData();
  const websiteData = getWebsiteStructuredData();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/icon-512.png" type="image/png" />
        <link rel="icon" href="/icon-512.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
        />
      </head>
      <body className="font-sans antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

