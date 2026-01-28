import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/common/AnnouncementBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Glovia Nepal - Premium Beauty & Cosmetics',
  description: 'Discover premium beauty and cosmetic products made for Nepal. Skincare, haircare, makeup, and organic products for radiant beauty.',
  keywords: ['cosmetics nepal', 'beauty products nepal', 'skincare nepal', 'makeup nepal', 'organic beauty'],
  authors: [{ name: 'Glovia Nepal' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Glovia Nepal - Premium Beauty & Cosmetics',
    description: 'Discover premium beauty and cosmetic products made for Nepal.',
    type: 'website',
    locale: 'en_NP',
    siteName: 'Glovia Nepal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glovia Nepal - Premium Beauty & Cosmetics',
    description: 'Discover premium beauty and cosmetic products made for Nepal.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
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
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
