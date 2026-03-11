"use client";

import { Product, Category, Brand } from '@/types';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Product structured data
export function getProductStructuredData(product: Product) {
  const imageUrls = product.images?.map(img => img.url) || [];
  const brandName = product.brand?.name || '';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: brandName ? {
      '@type': 'Brand',
      name: brandName
    } : undefined,
    image: imageUrls,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'NPR',
      availability: product.stockQuantity > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Glovia Market place'
      }
    },
    aggregateRating: product.averageRating ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount || 0
    } : undefined
  };
}

// Breadcrumb structured data
export function getBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// Organization structured data
export function getOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Glovia Market place',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://glovia.com.np',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    description: 'Premium Beauty & Cosmetics in Nepal',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+977-98XXXXXXXX',
      contactType: 'customer service',
      availableLanguage: ['English', 'Nepali']
    },
    sameOn: [
      'https://www.facebook.com/glovianepal',
      'https://www.instagram.com/glovianepal'
    ]
  };
}

// Website structured data
export function getWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Glovia Market place',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://glovia.com.np',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://glovia.com.np'}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

// FAQ structured data
export function getFaqStructuredData(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// LocalBusiness structured data (for Nepal)
export function getLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: 'Glovia Market place',
    image: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NP',
      addressLocality: 'Kathmandu'
    },
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00'
    }
  };
}

// SEO Head component
interface SeoHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  product?: Product;
  category?: Category;
  brand?: Brand;
}

export function SeoHead({
  title,
  description,
  image,
  url,
  type = 'website',
  product,
  category,
  brand
}: SeoHeadProps) {
  const siteName = 'Glovia Market place';
  const defaultImage = '/icon-512.svg';
  const fullUrl = url ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}${url}` : undefined;
  
  // Generate structured data based on type
  let structuredData: Record<string, unknown> = {};
  
  if (type === 'product' && product) {
    structuredData = getProductStructuredData(product);
  } else {
    structuredData = getWebsiteStructuredData();
  }

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      <meta name="title" content={title ? `${title} | ${siteName}` : siteName} />
      <meta name="description" content={description || 'Discover premium beauty and cosmetic products made for Nepal. Skincare, haircare, makeup, and organic products.'} />
      
      {/* Canonical URL */}
      {fullUrl && (
        <>
          <link rel="canonical" href={fullUrl} />
          <meta name="twitter:url" content={fullUrl} />
        </>
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title ? `${title} | ${siteName}` : siteName} />
      <meta property="og:description" content={description || ''} />
      {fullUrl && <meta property="og:url" content={fullUrl} />}
      <meta property="og:image" content={image || defaultImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title ? `${title} | ${siteName}` : siteName} />
      <meta property="twitter:description" content={description || ''} />
      <meta property="twitter:image" content={image || defaultImage} />
      
      {/* JSON-LD Structured Data */}
      <JsonLd data={structuredData} />
    </>
  );
}

