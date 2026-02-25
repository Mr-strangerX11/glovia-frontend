"use client";
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function BlogContent({ blogPosts }: { blogPosts: any[] }) {
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
            <h2 className="text-lg font-bold mb-2 group-hover:text-primary-600 transition-colors">
              {post.title}
            </h2>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{post.author}</span>
              <span>{post.date}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
