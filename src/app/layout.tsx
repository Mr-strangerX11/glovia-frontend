import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/common/AnnouncementBar';
import ClientLayout from './ClientLayout';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { getOrganizationStructuredData, getWebsiteStructuredData } from '@/lib/seoStructuredData';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: {
    default: 'Glovia Nepal - Premium Beauty & Cosmetics',
    template: '%s | Glovia Nepal',
  },
  description: 'Discover premium beauty and cosmetic products made for Nepal. Skincare, haircare, makeup, and organic products for radiant beauty.',
  keywords: ['cosmetics nepal', 'beauty products nepal', 'skincare nepal', 'makeup nepal', 'organic beauty', 'beauty store kathmandu'],
  authors: [{ name: 'Glovia Nepal' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://glovia.com.np'),
  openGraph: {
    title: 'Glovia Nepal - Premium Beauty & Cosmetics',
    description: 'Discover premium beauty and cosmetic products made for Nepal.',
    type: 'website',
    locale: 'en_NP',
    siteName: 'Glovia Nepal',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Glovia Nepal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glovia Nepal - Premium Beauty & Cosmetics',
    description: 'Discover premium beauty and cosmetic products made for Nepal.',
    images: ['/og-image.jpg'],
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
        <ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <AnnouncementBar />
          <Header />
          <ClientLayout>
            <main className="min-h-screen" id="main-content">
              {children}
            </main>
          </ClientLayout>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}

