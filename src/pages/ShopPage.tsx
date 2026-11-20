import React, { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import {
  AnimatedDotCluster,
  AnimatedSparkle,
  CurvedGuideArrow,
  OrganicBlob,
  SafeImage,
} from '../components/BrandVisuals';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { OFFICIAL_ASSETS } from '../data/seedData';
import { useSEO } from '../lib/seo';

const CATEGORY_THUMBS = [
  { slug: 'all', name: 'All Makhana', to: '/shop', image: OFFICIAL_ASSETS.flavourCollection, bg: 'from-[#B7E843] to-[#23884D]' },
  { slug: 'makhana', name: 'Jumbo Makhana', to: '/category/makhana', image: OFFICIAL_ASSETS.jumboPouch, bg: 'from-[#EBF9C8] to-[#F4B926]' },
  { slug: 'roasted-makhana', name: 'Roasted Makhana', to: '/category/roasted-makhana', image: OFFICIAL_ASSETS.pudinaJar, bg: 'from-[#DFF8E6] to-[#6EE7B7]' },
  { slug: 'flavoured-makhana', name: 'Flavoured', to: '/category/flavoured-makhana', image: OFFICIAL_ASSETS.fourJarsLineup, bg: 'from-[#FFE3D8] to-[#FF7F3E]' },
  { slug: 'makhana-combo', name: 'Combo Packs', to: '/category/makhana-combo', image: OFFICIAL_ASSETS.fourJarsLineup, bg: 'from-[#FFF1B8] to-[#F4B926]' },
  { slug: 'dry-fruits', name: 'Dry Fruits', to: '/category/dry-fruits', image: OFFICIAL_ASSETS.heroSnacks, bg: 'from-[#FFE4E1] to-[#F25C54]' },
];

export function ShopPage() {
  const { slug: categorySlug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, loadingStore } = useStore();

  const initialQuery = searchParams.get('q') || '';
  const [queryText, setQueryText] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || 'all');
  const [selectedFlavour, setSelectedFlavour] = useState('all');
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [visibleCount, setVisibleCount] = useState(12);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  React.useEffect(() => {
    setSelectedCategory(categorySlug || 'all');
  }, [categorySlug]);

  React.useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setQueryText(q);
  }, [searchParams]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  const pageTitle = activeCategoryObj
    ? `${activeCategoryObj.name} — Shop Mithila Makhana`
    : 'Shop All Premium Mithila Makhana & Healthy Snacks';
  const pageDescription =
    activeCategoryObj?.description ||
    'Browse all MAKH AND MORE products including Premium Jumbo Makhana, Pudina, Peri Peri, Cheese, Himalayan Salt, and 4-Flavour Roasted Combos.';

  useSEO({
    title: pageTitle,
    description: pageDescription,
    canonicalPath: categorySlug ? `/category/${categorySlug}` : '/shop',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: activeCategoryObj ? activeCategoryObj.name : 'Shop',
          item: window.location.href,
        },
      ],
    },
  });

  const flavours = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.flavour) set.add(p.flavour);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => {
        if (selectedCategory === 'makhana') {
          return p.category === 'makhana' || p.slug.includes('makhana');
        }
        if (selectedCategory === 'roasted-makhana') {
          return p.category === 'roasted-makhana' || p.category === 'flavoured-makhana';
        }
        return p.category === selectedCategory;
      });
    }

    if (selectedFlavour !== 'all') {
      list = list.filter((p) => p.flavour === selectedFlavour);
    }

    if (queryText.trim()) {
      const q = queryText.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          (p.flavour || '').toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    list = list.filter((p) => p.salePrice <= maxPrice);

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.salePrice - a.salePrice);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.price - b.salePrice) / b.price - (a.price - a.salePrice) / a.price);
    }

    return list;
  }, [products, selectedCategory, selectedFlavour, queryText, maxPrice, sortBy]);

  const activeFilterCount =
    (selectedFlavour !== 'all' ? 1 : 0) +
    (maxPrice < 1500 ? 1 : 0) +
    (sortBy !== 'featured' ? 1 : 0);

  const resetFilters = () => {
    setQueryText('');
    setSelectedCategory('all');
    setSelectedFlavour('all');
    setMaxPrice(1500);
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
      {/* Colourful Dotted Banner Header */}
      <div className="relative rounded-[24px] bg-[#0D3B2A] bg-gradient-to-br from-[#0D3B2A] via-[#175C41] to-[#23884D] text-white p-4 sm:p-6 mb-3.5 overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-dots-light pointer-events-none" />
        <OrganicBlob
          fill="#B7E843"
          opacity={0.22}
          className="w-56 h-56 absolute -top-20 -right-16 pointer-events-none"
        />
        <AnimatedDotCluster
          className="w-16 h-16 absolute bottom-2 right-6 opacity-50 hidden sm:block pointer-events-none"
          color="#F4B926"
        />

        <div className="relative z-10 space-y-1.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-[#B7E843] font-bold">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/shop" className="hover:underline">
              Explore
            </Link>
            {activeCategoryObj && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white">{activeCategoryObj.name}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                  {activeCategoryObj ? activeCategoryObj.name : 'Explore All Snacks'}
                </h1>
                <AnimatedSparkle className="w-5 h-5 shrink-0" color="#F4B926" />
              </div>
              <p className="text-xs text-[#FFF9EE]/85 leading-snug line-clamp-2">
                {pageDescription}
              </p>
            </div>
            <CurvedGuideArrow
              direction="down-right"
              color="#B7E843"
              className="w-16 h-10 hidden lg:block shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Swipeable Horizontal Category Thumbnail Scroller */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar snap-x">
        {CATEGORY_THUMBS.map((cat) => {
          const active = selectedCategory === cat.slug;
          return (
            <Link
              key={cat.slug}
              to={cat.to}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`snap-start shrink-0 flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border-2 transition-all ${
                active
                  ? 'bg-[#0D3B2A] border-[#0D3B2A] text-[#B7E843] shadow-sm'
                  : 'bg-white border-[#0D3B2A]/10 text-[#0D3B2A] hover:border-[#23884D]'
              }`}
            >
              <div
                className={`w-8 h-8 aspect-square rounded-full bg-gradient-to-br ${cat.bg} p-0.5 flex items-center justify-center shrink-0`}
              >
                <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
                  <SafeImage
                    src={cat.image}
                    alt={cat.name}
                    width={100}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <span className="text-[11px] font-extrabold whitespace-nowrap">{cat.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Compact Filter & Sort Controls Bar (Search kept cleanly in Header only) */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A5E54]">
          <Sparkles className="w-3.5 h-3.5 text-[#F4B926]" />
          Showing <strong className="text-[#0D3B2A] tabular-nums">{filteredProducts.length}</strong>{' '}
          fresh {filteredProducts.length === 1 ? 'pack' : 'packs'}
          {queryText ? (
            <span className="text-[#23884D]">for “{queryText}”</span>
          ) : null}
        </span>

        <div className="flex items-center gap-2">
          {(queryText || selectedCategory !== 'all' || selectedFlavour !== 'all' || maxPrice < 1500) && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFE4E1] text-[#F25C54] text-xs font-extrabold hover:bg-[#F25C54] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}

          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="lg:hidden h-9 px-3.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold inline-flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#F4B926] text-[#0D3B2A] text-[10px] font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Desktop Inline Controls */}
          <div className="hidden lg:flex items-center gap-3 bg-white rounded-full px-4 py-1.5 border-2 border-[#0D3B2A]/10 shadow-xs">
            <select
              aria-label="Filter by flavour"
              value={selectedFlavour}
              onChange={(e) => setSelectedFlavour(e.target.value)}
              className="h-9 px-3 rounded-full bg-[#EBF9C8]/70 text-xs font-extrabold text-[#0D3B2A] focus:outline-none cursor-pointer"
            >
              <option value="all">All Flavours</option>
              {flavours.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-bold text-[#4A5E54] whitespace-nowrap">
                Up to <strong className="text-[#0D3B2A] tabular-nums">₹{maxPrice}</strong>
              </span>
              <input
                aria-label="Max price"
                type="range"
                min={200}
                max={1500}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-28 accent-[#23884D]"
              />
            </div>

            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-9 px-3 rounded-full bg-[#FFF1B8] text-xs font-extrabold text-[#0D3B2A] focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Biggest Savings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid or Skeleton Loader */}
      {loadingStore && products.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-[22px] p-2.5 border border-[#0D3B2A]/8 animate-pulse">
              <div className="aspect-square rounded-[18px] bg-[#EBF9C8]/60 mb-2.5" />
              <div className="h-3.5 bg-[#0D3B2A]/10 rounded-full w-3/4 mb-1.5" />
              <div className="h-3.5 bg-[#0D3B2A]/10 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-[24px] bg-gradient-to-br from-[#FFF1B8] to-[#FFE7D4] border-2 border-white p-7 sm:p-10 text-center space-y-3 shadow-sm">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0D3B2A]">
            {selectedCategory === 'dry-fruits'
              ? 'New Dry Fruits Harvest Arriving Soon!'
              : 'No matching snacks found'}
          </h2>
          <p className="text-xs sm:text-sm text-[#12261E]/80 max-w-md mx-auto">
            {selectedCategory === 'dry-fruits'
              ? 'Our curated dry fruits selection is being freshly packed in Darbhanga. Explore our Premium Jumbo and Roasted Flavoured Makhana in the meantime!'
              : 'Try broadening your search or clearing flavour and price filters.'}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-6 py-2.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs sm:text-sm font-extrabold hover:bg-[#175C41] cursor-pointer shadow-md"
          >
            Explore All Makhana
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredProducts.slice(0, visibleCount).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length > visibleCount && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 12)}
                className="px-7 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs sm:text-sm font-extrabold hover:bg-[#175C41] cursor-pointer shadow-md"
              >
                Load More Snacks
              </button>
            </div>
          )}
        </>
      )}

      {/* Mobile Filter Bottom Sheet Drawer */}
      <AnimatePresence>
        {filterSheetOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterSheetOpen(false)}
              className="fixed inset-0 bg-[#0D3B2A]/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-full bg-[#FFF9EE] rounded-t-[32px] p-6 pb-8 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="w-11 h-1.5 rounded-full bg-[#0D3B2A]/20 mx-auto -mt-2 mb-2" />

              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-extrabold text-[#0D3B2A]">
                  Filter & Sort Snacks
                </h2>
                <button
                  type="button"
                  onClick={() => setFilterSheetOpen(false)}
                  aria-label="Close filters"
                  className="w-9 h-9 rounded-full bg-white text-[#0D3B2A] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Flavour Chips */}
              <div className="space-y-2.5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#23884D]">
                  Flavour
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFlavour('all')}
                    className={`px-4 py-2 rounded-full text-xs font-extrabold cursor-pointer ${
                      selectedFlavour === 'all'
                        ? 'bg-[#0D3B2A] text-[#B7E843]'
                        : 'bg-white text-[#0D3B2A] border border-[#0D3B2A]/12'
                    }`}
                  >
                    All Flavours
                  </button>
                  {flavours.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFlavour(f)}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold cursor-pointer ${
                        selectedFlavour === f
                          ? 'bg-[#0D3B2A] text-[#B7E843]'
                          : 'bg-white text-[#0D3B2A] border border-[#0D3B2A]/12'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold text-[#0D3B2A]">
                  <span className="uppercase tracking-wider text-[#23884D]">Maximum Price</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1B8] tabular-nums">
                    ₹{maxPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={1500}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#23884D]"
                />
              </div>

              {/* Sort */}
              <div className="space-y-2.5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#23884D]">
                  Sort By
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'featured', label: 'Featured' },
                    { id: 'price-asc', label: 'Price: Low → High' },
                    { id: 'price-desc', label: 'Price: High → Low' },
                    { id: 'discount', label: 'Biggest Savings' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id as typeof sortBy)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold cursor-pointer ${
                        sortBy === opt.id
                          ? 'bg-[#B7E843] text-[#0D3B2A]'
                          : 'bg-white text-[#0D3B2A] border border-[#0D3B2A]/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    setFilterSheetOpen(false);
                  }}
                  className="h-12 rounded-full border-2 border-[#0D3B2A]/15 text-[#0D3B2A] text-xs font-extrabold cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setFilterSheetOpen(false)}
                  className="h-12 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold cursor-pointer shadow-md"
                >
                  Show {filteredProducts.length} Packs
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
