// src/pages/blog/BlogHub.jsx
// Route: /blog

import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Zap } from 'lucide-react';
import Seo from '../../components/Seo';
import { BLOG_POSTS } from './_blogData';

const CATEGORIES = ['All', 'Hackathons', 'Competitions', 'College Events'];

export default function BlogHub() {
  return (
    <>
      <Seo
        title="Blog — Hackathon Tips, College Events & Competition Guides | FestNest"
        description="Expert guides on winning hackathons, pitch competitions, and inter-college events in India. Your playbook for college competition success."
        canonical="https://festnest.in/blog"
      />

      <div className="min-h-screen bg-gray-50">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#4F46E5] via-indigo-600 to-purple-700 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 text-center">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-md mb-4 uppercase tracking-widest">
              FestNest Blog
            </span>
            <h1 className="font-syne text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Your Playbook for College<br className="hidden sm:block" /> Competition Success
            </h1>
            <p className="text-indigo-200 text-base sm:text-lg max-w-2xl mx-auto">
              Expert guides on winning hackathons, crushing pitch competitions, and discovering
              the best inter-college events across India.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* ── Featured post (first) ───────────────────────────────── */}
          {BLOG_POSTS[0] && (
            <Link
              to={`/blog/${BLOG_POSTS[0].slug}`}
              className="block bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden mb-10 group"
            >
              <div className="bg-gradient-to-r from-[#4F46E5] to-indigo-500 h-2" />
              <div className="p-7">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {BLOG_POSTS[0].category}
                  </span>
                  <span className="text-xs text-gray-400">Featured</span>
                </div>
                <h2 className="font-syne text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-700 transition-colors leading-tight">
                  {BLOG_POSTS[0].title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-2xl">
                  {BLOG_POSTS[0].description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock size={13} /> {BLOG_POSTS[0].readTime}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:gap-2.5 transition-all">
                    Read Article <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* ── All posts grid ──────────────────────────────────────── */}
          <h2 className="font-syne text-lg font-bold text-gray-800 mb-6">All Articles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BLOG_POSTS.slice(1).map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-sm transition-all group flex flex-col"
              >
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md self-start mb-4">
                  {post.category}
                </span>
                <h3 className="font-syne font-bold text-gray-900 text-base mb-2 leading-snug group-hover:text-indigo-700 transition-colors flex-1">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                  {post.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {post.readTime}
                  </span>
                  <ArrowRight size={15} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {/* ── Bottom CTA ─────────────────────────────────────────── */}
          <div className="mt-16 rounded-xl bg-gradient-to-r from-[#4F46E5] to-indigo-500 p-8 text-center text-white">
            <Zap size={28} className="text-yellow-300 mx-auto mb-3" />
            <h2 className="font-syne text-xl font-bold mb-2">
              Ready to compete? Find events on FestNest.
            </h2>
            <p className="text-indigo-200 text-sm mb-5">
              Browse hackathons, fests, workshops and inter-college competitions from 850+ colleges across India.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-indigo-50 transition-colors"
            >
              Browse All Events <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
