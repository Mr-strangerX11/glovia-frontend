export function getOrganizationStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://glovia.com.np';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Glovia Nepal',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
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

export function getWebsiteStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://glovia.com.np';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Glovia Nepal',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}