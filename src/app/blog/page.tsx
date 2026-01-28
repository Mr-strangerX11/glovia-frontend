'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const blogPosts = [
    {
      id: '1',
      title: '10 Korean Skincare Tips for Glowing Skin',
      excerpt: 'Discover the secrets of Korean beauty with these essential skincare tips...',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      author: 'Glovia Nepal Team',
      date: 'Jan 15, 2026',
      category: 'Skincare',
    },
    {
      id: '2',
      title: 'The Complete Guide to Double Cleansing',
      excerpt: 'Learn why double cleansing is essential for healthy, radiant skin...',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80',
      author: 'Glovia Nepal Team',
      date: 'Jan 10, 2026',
      category: 'Skincare',
    },
    {
      id: '3',
      title: 'Best Hair Care Routine for Nepali Climate',
      excerpt: 'Adapt your hair care routine to suit the unique weather conditions...',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      author: 'Glovia Nepal Team',
      date: 'Jan 5, 2026',
      category: 'Haircare',
    },
  ];

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <BookOpen className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-4xl font-serif font-bold mb-4">Beauty Tips & Guides</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover expert beauty tips, skincare routines, and product guides to help you achieve your best skin
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <article key={post.id} className="card group cursor-pointer hover:shadow-lg transition-shadow">
            <div className="aspect-video overflow-hidden rounded-lg mb-4">
              <img
                src={post.image}
                alt={post.title}
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

      <div className="text-center mt-12">
        <p className="text-gray-600">More beauty tips and guides coming soon!</p>
      </div>
    </div>
  );
}
