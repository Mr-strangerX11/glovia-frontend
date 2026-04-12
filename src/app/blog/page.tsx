'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

export default function BlogPage() {
  const blogPosts = [
    {
      id: '1',
      title: '10 Korean Skincare Tips for Glowing Skin',
      excerpt: 'Discover the secrets of Korean beauty with these essential skincare tips...',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      author: 'Glovia Market place Team',
      date: 'Jan 15, 2026',
      category: 'Skincare',
    },
    {
      id: '2',
      title: 'The Complete Guide to Double Cleansing',
      excerpt: 'Learn why double cleansing is essential for healthy, radiant skin...',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80',
      author: 'Glovia Market place Team',
      date: 'Jan 10, 2026',
      category: 'Skincare',
    },
    {
      id: '3',
      title: 'Best Hair Care Routine for Nepali Climate',
      excerpt: 'Adapt your hair care routine to suit the unique weather conditions...',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      author: 'Glovia Market place Team',
      date: 'Jan 5, 2026',
      category: 'Haircare',
    },
  ];

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Glovia Market place Blog",
          "description": "Beauty tips, skincare routines, and product guides for Nepal.",
          "blogPost": blogPosts.map(post => ({
            "@type": "BlogPosting",
            "headline": post.title,
            "image": post.image,
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "datePublished": post.date,
            "description": post.excerpt
          }))
        }) }} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 pt-10 pb-20">
          <div className="container text-center text-white">
            <BookOpen className="w-14 h-14 mx-auto mb-4 text-rose-200" />
            <h1 className="text-4xl font-serif font-bold mb-3">Beauty Tips & Guides</h1>
            <p className="text-pink-100 max-w-2xl mx-auto">
              Discover expert beauty tips, skincare routines, and product guides to help you achieve your best skin.
            </p>
          </div>
        </div>

        <div className="container -mt-10 pb-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <article key={post.id} className="group bg-white rounded-2xl border border-gray-100 shadow-soft p-4 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden rounded-xl mb-4">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={800}
                    height={450}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mb-2">
                  <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
