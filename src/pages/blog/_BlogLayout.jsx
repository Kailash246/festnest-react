// src/pages/blog/_BlogLayout.jsx
// Shared shell for all blog posts — TOC, breadcrumb, tags, related posts, CTA

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Calendar,
  Tag,
  ArrowRight,
  BookOpen,
  Zap,
} from 'lucide-react';
import { BLOG_POSTS } from './_blogData';

// ─── Callout box ─────────────────────────────────────────────────────────────
export function Callout({ type = 'tip', children }) {
  const styles = {
    tip: {
      bg: 'bg-indigo-50 border-indigo-400',
      label: 'text-indigo-700',
      text: 'text-indigo-900',
      badge: 'bg-indigo-100 text-indigo-700',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-400',
      label: 'text-amber-700',
      text: 'text-amber-900',
      badge: 'bg-amber-100 text-amber-700',
    },
    info: {
      bg: 'bg-blue-50 border-blue-400',
      label: 'text-blue-700',
      text: 'text-blue-900',
      badge: 'bg-blue-100 text-blue-700',
    },
    success: {
      bg: 'bg-green-50 border-green-400',
      label: 'text-green-700',
      text: 'text-green-900',
      badge: 'bg-green-100 text-green-700',
    },
  };
  const labels = { tip: '💡 Pro Tip', warning: '⚠️ Watch Out', info: 'ℹ️ Note', success: '✅ Key Takeaway' };
  const s = styles[type];
  return (
    <div className={`border-l-4 rounded-md p-4 my-6 ${s.bg}`}>
      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${s.label}`}>{labels[type]}</p>
      <div className={`text-sm leading-relaxed ${s.text}`}>{children}</div>
    </div>
  );
}

// ─── Find Events CTA ──────────────────────────────────────────────────────────
export function FindEventsCTA({ category, label }) {
  const slug = category?.toLowerCase().replace(/\s+/g, '-') || '';
  return (
    <div className="my-8 rounded-xl bg-gradient-to-r from-[#4F46E5] to-indigo-500 p-6 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={18} className="text-yellow-300" />
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">
          Find Events on FestNest
        </span>
      </div>
      <p className="text-lg font-bold font-syne mb-1">
        {label || `Browse ${category || 'College'} Events Near You`}
      </p>
      <p className="text-sm text-indigo-200 mb-4">
        Thousands of inter-college events, hackathons, and fests from 850+ colleges across India.
      </p>
      <Link
        to={slug ? `/category/${slug}` : '/explore'}
        className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors"
      >
        Explore Events <ArrowRight size={15} />
      </Link>
    </div>
  );
}

// ─── Section heading helper (anchored) ───────────────────────────────────────
export function PostSection({ id, title, level = 2, children }) {
  const Tag = `h${level}`;
  const sizeClass =
    level === 2
      ? 'text-xl font-bold text-gray-900 mt-10 mb-4 font-syne'
      : 'text-lg font-semibold text-gray-800 mt-6 mb-3 font-syne';
  return (
    <section id={id}>
      <Tag className={sizeClass}>{title}</Tag>
      {children}
    </section>
  );
}

// ─── Main layout shell ────────────────────────────────────────────────────────
export default function BlogLayout({ meta, sections = [], children, relatedSlugs = [] }) {
  const [tocOpen, setTocOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef(null);

  // Scroll spy
  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    );

    els.forEach((el) => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTocOpen(false);
  };

  const relatedPosts = BLOG_POSTS.filter((p) => relatedSlugs.includes(p.slug));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">{meta.category}</span>
          </nav>

          {/* Category chip */}
          <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-md mb-4">
            {meta.category}
          </span>

          {/* Title */}
          <h1 className="font-syne text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {meta.title}
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl">
            {meta.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {meta.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {meta.publishedAt}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} />
              FestNest Editorial
            </span>
          </div>

          {/* Author byline */}
          <p className="mt-3 text-sm text-gray-500">
            By{' '}
            <Link to="/about" className="font-semibold text-indigo-600 hover:underline">
              Kailash Kumar B
            </Link>
            , Founder of FestNest
          </p>
        </div>
      </div>

      {/* ── Mobile TOC ───────────────────────────────────────────────── */}
      {sections.length > 0 && (
        <div className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={() => setTocOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700"
          >
            <span className="flex items-center gap-2">
              <BookOpen size={15} className="text-indigo-600" />
              Table of Contents
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${tocOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {tocOpen && (
            <div className="px-4 pb-4 space-y-1 border-t border-gray-100">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`block w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors ${
                    activeId === s.id
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12 items-start">
          {/* Article */}
          <article className="prose-custom">
            {children}

            {/* Tags */}
            {meta.tags?.length > 0 && (
              <div className="mt-12 pt-6 border-t border-gray-200">
                <p className="flex items-center gap-2 text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
                  <Tag size={13} /> Keywords
                </p>
                <div className="flex flex-wrap gap-2">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Desktop sticky TOC */}
          {sections.length > 0 && (
            <aside className="hidden lg:block sticky top-24 self-start">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <BookOpen size={13} /> On This Page
                </p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={`block w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors leading-snug ${
                        activeId === s.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-gray-500 hover:text-indigo-600'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </nav>

                {/* Mini CTA */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-3">Discover live events on FestNest</p>
                  <Link
                    to="/explore"
                    className="flex items-center justify-center gap-2 bg-[#4F46E5] text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Browse Events <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* ── Related posts ─────────────────────────────────────────── */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200">
            <h2 className="font-syne text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-sm transition-all group"
                >
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {post.category}
                  </span>
                  <h3 className="font-syne font-bold text-gray-900 text-sm mt-3 mb-2 leading-snug group-hover:text-indigo-700 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={11} /> {post.readTime}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
