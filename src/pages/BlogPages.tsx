import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Search,
  Share2,
  Sparkles,
  User,
} from 'lucide-react';
import {
  AnimatedDotCluster,
  CurvedGuideArrow,
  SafeImage,
  WavySectionDivider,
} from '../components/BrandVisuals';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { useSEO } from '../lib/seo';

const CARD_TINTS = [
  'bg-[#E2F6E7]',
  'bg-[#FFF1B8]',
  'bg-[#FFE7D4]',
  'bg-[#EBF9C8]',
];

export function BlogListPage() {
  const { blogs } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useSEO({
    title: 'Mithila Journal & Healthy Snacking Blog | MAKH AND MORE',
    description:
      'Explore stories from Darbhanga makhana farms, wholesome roasted fox nut recipes, and flavour guides by MAKH AND MORE.',
    canonicalPath: '/blog',
  });

  const publishedBlogs = useMemo(() => blogs.filter((b) => b.published), [blogs]);
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(publishedBlogs.map((b) => b.category)))],
    [publishedBlogs]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publishedBlogs.filter((b) => {
      const catOk = selectedCategory === 'All' || b.category === selectedCategory;
      const qOk =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        (b.tags || []).some((t) => t.toLowerCase().includes(q));
      return catOk && qOk;
    });
  }, [publishedBlogs, searchQuery, selectedCategory]);

  return (
    <div className="bg-[#FFF9EE] min-h-[75vh] pb-16 sm:pb-24 overflow-hidden">
      {/* Dotted Forest Journal Header */}
      <section className="relative bg-gradient-to-br from-[#0D3B2A] via-[#134F39] to-[#23884D] text-[#FFF9EE] overflow-hidden">
        <div className="absolute inset-0 bg-dots-forest opacity-40 pointer-events-none" />
        <AnimatedDotCluster
          color="#B7E843"
          accentColor="#F4B926"
          className="w-24 h-24 absolute top-6 right-8 opacity-45 pointer-events-none hidden sm:block"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#B7E843]/15 border border-[#B7E843]/35 text-[#B7E843] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                The Mithila Journal
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold mt-3 leading-tight">
                Stories, Craft & <span className="text-[#B7E843]">Wholesome</span> Snacking
              </h1>
              <p className="text-sm sm:text-base text-[#FFF9EE]/80 mt-2.5 max-w-xl">
                From Darbhanga’s harvest ponds to creative ways to enjoy roasted makhana every day.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#0D3B2A]/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes & farm stories…"
                className="w-full min-h-[46px] pl-11 pr-4 py-2.5 rounded-full bg-white text-[#12261E] placeholder:text-[#4A5E54]/70 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#B7E843]"
              />
            </div>
          </div>
        </div>
        <WavySectionDivider fill="#FFF9EE" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Scrollable Category Filter Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[40px] px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0D3B2A] text-[#B7E843] shadow-sm'
                  : 'bg-white text-[#0D3B2A] border border-[#0D3B2A]/12 hover:border-[#23884D]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-[#0D3B2A]/10 p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF1B8] text-[#0D3B2A] flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-7 h-7" />
            </div>
            <p className="font-display text-xl font-extrabold text-[#0D3B2A]">
              No matching articles found.
            </p>
            <p className="text-xs text-[#4A5E54] mt-1">
              Try clearing your search or switching categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, idx) => (
              <article
                key={post.id}
                className="group bg-white rounded-[2rem] border border-[#0D3B2A]/10 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className={`block aspect-[16/10] ${CARD_TINTS[idx % CARD_TINTS.length]} overflow-hidden p-3`}
                >
                  <div className="w-full h-full rounded-[1.25rem] overflow-hidden">
                    <SafeImage
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-[11px] mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#EBF9C8] font-extrabold text-[#0D3B2A] uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#4A5E54] font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#23884D]" />
                      {post.readTime || '4 min read'}
                    </span>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="font-display text-xl font-extrabold text-[#0D3B2A] group-hover:text-[#23884D] transition-colors leading-snug">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-[#4A5E54] mt-2.5 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs border-t border-[#0D3B2A]/8 mt-5">
                    <span className="text-[#4A5E54] font-medium">{post.publishedAt}</span>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="font-bold text-[#0D3B2A] inline-flex items-center gap-1 group-hover:text-[#23884D]"
                    >
                      Read Story <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { blogs, products, showToast } = useStore();

  const article = blogs.find((b) => b.slug === slug);

  // Parse ## headings for Table of Contents
  const sections = useMemo(() => {
    if (!article) return [];
    const lines = article.content.split('\n');
    const headings: { id: string; text: string }[] = [];
    for (const line of lines) {
      if (line.startsWith('## ')) {
        const text = line.replace(/^##\s+/, '').trim();
        headings.push({ id: slugifyHeading(text), text });
      }
    }
    return headings;
  }, [article]);

  const jsonLd = useMemo(() => {
    if (!article) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.seoDescription || article.excerpt,
      image: article.featuredImage,
      author: {
        '@type': 'Organization',
        name: article.author || 'MAKH AND MORE',
      },
      publisher: {
        '@type': 'Organization',
        name: 'MAKH AND MORE (ASR ENTERPRISES)',
      },
      datePublished: article.publishedAt,
    };
  }, [article]);

  useSEO({
    title: article
      ? article.seoTitle || `${article.title} | MAKH AND MORE`
      : 'Article Not Found | MAKH AND MORE',
    description: article
      ? article.seoDescription || article.excerpt
      : 'Mithila Makhana journal article.',
    canonicalPath: `/blog/${slug || ''}`,
    ogImage: article?.featuredImage,
    ogType: 'article',
    jsonLd,
  });

  if (!article) {
    return (
      <div className="bg-[#FFF9EE] py-20 text-center px-4">
        <h1 className="font-display text-3xl font-extrabold text-[#0D3B2A] mb-3">
          Article Not Found
        </h1>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-display font-bold"
        >
          Back to Journal
        </Link>
      </div>
    );
  }

  const relatedProducts = products.filter(
    (p) => p.published && (article.relatedProductSlugs || []).includes(p.slug)
  );
  const relatedPosts = blogs.filter((b) => b.published && b.id !== article.id).slice(0, 2);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Article link copied to clipboard!');
    } catch {
      showToast('Copy URL from your browser address bar to share.', 'info');
    }
  };

  // Safe clean Markdown-lite renderer for ## headings, bullets, bold, italic
  const renderFormattedContent = (raw: string) => {
    const blocks = raw.split(/\n\n+/);
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s+/, '');
        return (
          <h2
            key={idx}
            id={slugifyHeading(text)}
            className="font-display text-2xl font-extrabold text-[#0D3B2A] mt-8 mb-3 scroll-mt-28"
          >
            {text}
          </h2>
        );
      }
      const lines = trimmed.split('\n');
      if (lines.every((l) => l.trim().startsWith('- ') || /^\d+\.\s/.test(l.trim()))) {
        return (
          <ul
            key={idx}
            className="list-disc pl-5 space-y-2 text-[#12261E]/85 text-sm sm:text-base leading-relaxed my-4 marker:text-[#23884D]"
          >
            {lines.map((l, i) => {
              const clean = l.replace(/^(-|\d+\.)\s+/, '');
              const parts = clean.split(/(\*\*.*?\*\*)/g);
              return (
                <li key={i}>
                  {parts.map((part, pi) =>
                    part.startsWith('**') && part.endsWith('**') ? (
                      <strong key={pi} className="text-[#0D3B2A] font-bold">
                        {part.slice(2, -2)}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </li>
              );
            })}
          </ul>
        );
      }
      const parts = trimmed.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <p key={idx} className="text-[#12261E]/85 text-sm sm:text-base leading-relaxed my-4">
          {parts.map((part, pi) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pi} className="text-[#0D3B2A] font-bold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <em key={pi} className="italic text-[#4A5E54]">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="bg-[#FFF9EE] py-8 sm:py-12 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#0D3B2A]/10 text-xs font-bold text-[#0D3B2A] hover:bg-[#EBF9C8] transition-colors mb-6 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Articles
        </Link>

        <article className="bg-white rounded-[2.25rem] border border-[#0D3B2A]/10 overflow-hidden shadow-sm">
          <div className="aspect-[16/8] bg-[#E2F6E7] overflow-hidden">
            <SafeImage
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#4A5E54] mb-4">
              <span className="px-3 py-1 rounded-full bg-[#EBF9C8] font-extrabold text-[#0D3B2A] uppercase tracking-wider">
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5 text-[#23884D]" />
                {article.author}
              </span>
              <span className="inline-flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#FF7F3E]" />
                {article.publishedAt}
              </span>
              <span className="inline-flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#23884D]" />
                {article.readTime}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0D3B2A] leading-tight">
              {article.title}
            </h1>
            <p className="text-base text-[#4A5E54] mt-4 leading-relaxed">{article.excerpt}</p>

            {/* Auto-generated Colourful Table of Contents */}
            {sections.length > 0 && (
              <div className="my-7 p-5 sm:p-6 rounded-[1.75rem] bg-[#FFF1B8]/70 border border-[#F4B926]/30">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#0D3B2A] mb-3">
                  In This Article
                </p>
                <ul className="space-y-2 text-sm">
                  {sections.map((s, idx) => (
                    <li key={s.id} className="flex items-start gap-2">
                      <span className="font-mono text-xs font-bold text-[#B36208] mt-0.5">
                        0{idx + 1}
                      </span>
                      <a
                        href={`#${s.id}`}
                        className="font-semibold text-[#0D3B2A] hover:text-[#23884D] hover:underline"
                      >
                        {s.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="max-w-none">{renderFormattedContent(article.content)}</div>

            {/* Share Bar */}
            <div className="mt-10 pt-6 border-t border-[#0D3B2A]/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {(article.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-[#FFF9EE] border border-[#0D3B2A]/10 text-[11px] font-semibold text-[#4A5E54]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="min-h-[40px] px-4 py-2 rounded-full bg-[#EBF9C8] text-xs font-bold text-[#0D3B2A] hover:bg-[#B7E843] transition-colors inline-flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Copy Link
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${article.title} — ${window.location.href}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold hover:bg-[#1ebe5d] transition-colors inline-flex items-center"
                >
                  Share on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
                Featured in This Story
              </h2>
              <CurvedGuideArrow
                direction="right"
                color="#23884D"
                className="w-20 h-10 hidden sm:block"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-14 pt-10 border-t border-[#0D3B2A]/10">
            <h2 className="font-display text-2xl font-extrabold text-[#0D3B2A] mb-6">
              More From The Mithila Journal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/blog/${rp.slug}`}
                  className="bg-white rounded-[1.75rem] border border-[#0D3B2A]/10 p-4 hover:border-[#23884D] hover:shadow-md transition-all flex gap-4 items-center"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-[#E2F6E7]">
                    <SafeImage
                      src={rp.featuredImage}
                      alt={rp.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EBF9C8] text-[10px] font-extrabold text-[#0D3B2A] uppercase">
                      {rp.category}
                    </span>
                    <h3 className="font-display text-base font-bold text-[#0D3B2A] line-clamp-2 mt-1">
                      {rp.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
