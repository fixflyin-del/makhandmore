import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Flame,
  Leaf,
  MapPin,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  WheatOff,
} from 'lucide-react';
import {
  AnimatedDotCluster,
  AnimatedSparkle,
  CurvedGuideArrow,
  FloatingLotusLeaf,
  OrbitCircles,
  OrganicBlob,
  SafeImage,
  WavySectionDivider,
} from '../components/BrandVisuals';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { OFFICIAL_ASSETS } from '../data/seedData';
import { useSEO } from '../lib/seo';

function GoogleLogoSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

const GOOGLE_REVIEWS_SHOWCASE = [
  {
    id: 'g-1',
    authorName: 'Ananya Verma',
    city: 'Patna',
    rating: 5,
    timeAgo: '2 weeks ago',
    comment: 'Super jumbo Mithila kernels and zero husk. Roasted Pudina & Peri Peri jars are my everyday evening snack now!',
  },
  {
    id: 'g-2',
    authorName: 'Rohit Sharma',
    city: 'Delhi NCR',
    rating: 5,
    timeAgo: '1 month ago',
    comment: 'Ordered the 4-Flavour Combo + Jumbo 100g pouch. Packaging is airtight and crunch stays fresh till the last bite.',
  },
  {
    id: 'g-3',
    authorName: 'Priya Jha',
    city: 'Bengaluru',
    rating: 5,
    timeAgo: '3 weeks ago',
    comment: 'Authentic Darbhanga makhana taste! Lightly roasted, not oily at all. Kids love the Cheese jar.',
  },
  {
    id: 'g-4',
    authorName: 'Vikash Kumar',
    city: 'Mumbai',
    rating: 5,
    timeAgo: '1 week ago',
    comment: 'Fast delivery and genuine 6-suta size jumbo makhana. Himalayan Salt flavour is perfect for office snacking.',
  },
];

const APP_CATEGORIES = [
  {
    name: 'All Makhana',
    to: '/shop',
    image: OFFICIAL_ASSETS.flavourCollection,
    bg: 'from-[#B7E843] to-[#23884D]',
    ring: 'ring-[#23884D]/25',
  },
  {
    name: 'Jumbo Makhana',
    to: '/category/makhana',
    image: OFFICIAL_ASSETS.jumboPouch,
    bg: 'from-[#EBF9C8] to-[#F4B926]',
    ring: 'ring-[#F4B926]/35',
  },
  {
    name: 'Roasted Makhana',
    to: '/category/roasted-makhana',
    image: OFFICIAL_ASSETS.pudinaJar,
    bg: 'from-[#DFF8E6] to-[#6EE7B7]',
    ring: 'ring-[#23884D]/25',
  },
  {
    name: 'Flavoured Makhana',
    to: '/category/flavoured-makhana',
    image: OFFICIAL_ASSETS.fourJarsLineup,
    bg: 'from-[#FFE3D8] to-[#FF7F3E]',
    ring: 'ring-[#FF7F3E]/30',
  },
  {
    name: 'Combo Packs',
    to: '/category/makhana-combo',
    image: OFFICIAL_ASSETS.fourJarsLineup,
    bg: 'from-[#FFF1B8] to-[#F4B926]',
    ring: 'ring-[#F4B926]/40',
  },
  {
    name: 'Dry Fruits',
    to: '/category/dry-fruits',
    image: OFFICIAL_ASSETS.heroSnacks,
    bg: 'from-[#FFE4E1] to-[#F25C54]',
    ring: 'ring-[#F25C54]/30',
  },
];

const FLAVOUR_MOODS = [
  {
    id: 'pudina',
    name: 'Pudina',
    tag: 'Cool & Zesty',
    slug: 'roasted-makhana-pudina-90g',
    note: 'Fresh garden mint leaves & chatpata Indian spices tumbled on crisp slow-roasted fox nuts.',
    stage: 'from-[#DFF8E6] via-[#C6F2D4] to-[#EBF9C8]',
    pillActive: 'bg-[#175C41] text-[#B7E843]',
    dotColor: '#23884D',
    ringColor: '#B7E843',
  },
  {
    id: 'peri-peri',
    name: 'Peri Peri',
    tag: 'Bold & Fiery',
    slug: 'roasted-makhana-peri-peri-90g',
    note: 'Smoky red chilli, paprika & tangy citrus spice kick for late-night movie & chai cravings.',
    stage: 'from-[#FFE3D8] via-[#FFD0BE] to-[#FFF0C2]',
    pillActive: 'bg-[#F25C54] text-white',
    dotColor: '#FF7F3E',
    ringColor: '#F25C54',
  },
  {
    id: 'cheese',
    name: 'Cheese',
    tag: 'Creamy Crunch',
    slug: 'roasted-makhana-cheese-90g',
    note: 'Rich savoury cheddar-style seasoning dusted lightly over airy, melt-in-your-mouth kernels.',
    stage: 'from-[#FFF2BF] via-[#FFE08A] to-[#FFE7D4]',
    pillActive: 'bg-[#FF7F3E] text-white',
    dotColor: '#F4B926',
    ringColor: '#FF7F3E',
  },
  {
    id: 'himalayan',
    name: 'Himalayan Salt',
    tag: 'Clean & Light',
    slug: 'roasted-makhana-himalayan-salt-90g',
    note: 'Minimalist purity with genuine Sendha Namak — perfect for daily snacking & vrat days.',
    stage: 'from-[#E2F1FF] via-[#D0E8FF] to-[#FFF3E6]',
    pillActive: 'bg-[#0D3B2A] text-[#FFD45A]',
    dotColor: '#4A90D9',
    ringColor: '#F4B926',
  },
];

const BENEFIT_CARDS = [
  {
    icon: Leaf,
    title: '100% Natural',
    desc: 'Zero artificial polish',
    bg: 'bg-[#EBF9C8]',
    iconBg: 'bg-[#0D3B2A] text-[#B7E843]',
  },
  {
    icon: Sparkles,
    title: 'Plant Protein',
    desc: 'Light everyday crunch',
    bg: 'bg-[#FFF1B8]',
    iconBg: 'bg-[#F4B926] text-[#0D3B2A]',
  },
  {
    icon: WheatOff,
    title: 'Gluten Free',
    desc: 'Naturally roasted seeds',
    bg: 'bg-[#FFE7D4]',
    iconBg: 'bg-[#FF7F3E] text-white',
  },
  {
    icon: ShieldCheck,
    title: 'Airtight Fresh',
    desc: 'Reusable crisp jars',
    bg: 'bg-[#E2F6E7]',
    iconBg: 'bg-[#23884D] text-white',
  },
  {
    icon: MapPin,
    title: 'Mithila Origin',
    desc: 'Direct from Darbhanga',
    bg: 'bg-[#FFE4E1]',
    iconBg: 'bg-[#F25C54] text-white',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    desc: 'Pan-India above ₹299',
    bg: 'bg-[#E2F1FF]',
    iconBg: 'bg-[#0D3B2A] text-white',
  },
];

export function HomePage() {
  const { products, banners, blogs, reviews, settings, addToCart } = useStore();

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedFlavourId, setSelectedFlavourId] = useState('pudina');

  useSEO({
    title: settings.seoTitle,
    description: settings.seoDescription,
    canonicalPath: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'MAKH AND MORE',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${window.location.origin}/shop?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  });

  const heroBanners = banners.slice(0, 2);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const safeSlide = heroBanners.length > 0 ? activeSlide % heroBanners.length : 0;
  const currentBanner = heroBanners[safeSlide] || heroBanners[0];
  const primaryCtaLabel =
    currentBanner?.ctaText && currentBanner.ctaText.length <= 14
      ? currentBanner.ctaText
      : safeSlide === 1
        ? 'Shop Combo'
        : 'Shop Now';

  const mainSpotlightProduct =
    products.find((p) => p.slug === 'premium-jumbo-makhana-100g') ||
    products.find((p) => p.primaryImage === OFFICIAL_ASSETS.jumboPouch) ||
    products[0];
  const otherProducts = products.filter((p) => p.id !== mainSpotlightProduct?.id);
  const activeMood = FLAVOUR_MOODS.find((f) => f.id === selectedFlavourId) || FLAVOUR_MOODS[0];
  const activeMoodProduct =
    products.find((p) => p.slug === activeMood.slug) ||
    products.find((p) => p.slug === 'roasted-makhana-pudina-90g') ||
    products[0];
  const approvedReviews = reviews.filter((r) => r.approved).slice(0, 8);
  const combinedGoogleReviews = [
    ...approvedReviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      city: r.verifiedPurchase ? 'Verified Buyer' : 'Customer',
      rating: r.rating,
      timeAgo: 'Recent',
      comment: r.comment,
    })),
    ...GOOGLE_REVIEWS_SHOWCASE,
  ];

  const whatsappDigits = (settings.whatsappNumber || '+919135986786').replace(/\D/g, '');
  const whatsappClubLink = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
    'Hi MAKH AND MORE! I want to join the Crunch Club for fresh harvest drops & exclusive WhatsApp offers.'
  )}`;

  return (
    <div className="overflow-x-clip">
      {/* 1. MOBILE-FIRST COMPACT GREETING & ZERO-VOID HERO BANNER */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-4 pb-3 sm:pb-5">
        {/* Compact App Greeting (Search lives cleanly in Header only) */}
        <div className="mb-2.5">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#23884D]">
            <span className="w-2 h-2 rounded-full bg-[#B7E843] ring-2 ring-[#B7E843]/40" />
            Fresh Mithila Harvest · Darbhanga, Bihar
          </p>
          <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#0D3B2A] leading-tight">
            Ready for guilt-free crunch today?
          </h2>
        </div>

        {/* Tight, High-Impact Colourful Hero Card with 1:1 Square Product Showcase */}
        <div className="relative rounded-[26px] sm:rounded-[34px] bg-[#0D3B2A] bg-gradient-to-br from-[#0D3B2A] via-[#15573D] to-[#23884D] text-white overflow-hidden shadow-[0_14px_38px_rgba(13,59,42,0.22)]">
          <div className="absolute inset-0 bg-dots-light pointer-events-none" />
          <OrganicBlob
            fill="#B7E843"
            opacity={0.2}
            className="w-60 h-60 sm:w-80 sm:h-80 absolute -top-20 -right-16 pointer-events-none"
          />
          <OrganicBlob
            fill="#F4B926"
            opacity={0.16}
            className="w-52 h-52 absolute -bottom-20 -left-14 pointer-events-none"
          />
          <AnimatedDotCluster
            className="w-20 h-20 absolute top-4 right-6 opacity-55 pointer-events-none hidden sm:block"
            color="#B7E843"
            accentColor="#F4B926"
          />
          <FloatingLotusLeaf
            className="w-14 h-14 absolute bottom-4 left-1/2 -translate-x-1/2 opacity-45 pointer-events-none hidden lg:block"
            delay={0.8}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center p-4 sm:p-7 lg:p-8">
            {/* Hero Copy (Fixed Height Stage = 0px Vertical Jump on Mobile Slide Change) */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="h-[144px] sm:h-[172px] lg:h-[196px] flex flex-col justify-center overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentBanner?.id || `hero-copy-${safeSlide}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    className="space-y-2 sm:space-y-2.5"
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B7E843]/20 border border-[#B7E843]/45 text-[#B7E843] text-[11px] font-extrabold tracking-wide max-w-full">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {currentBanner?.eyebrow || 'Healthy Snacking Redefined'}
                      </span>
                    </div>

                    <h1 className="font-display text-[25px] sm:text-4xl lg:text-[2.85rem] font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-xs line-clamp-2">
                      {currentBanner?.title || 'Pure. Natural. Delicious.'}
                    </h1>

                    <p className="text-xs sm:text-sm lg:text-base text-[#FFF9EE]/92 leading-snug sm:leading-relaxed max-w-lg line-clamp-2">
                      {currentBanner?.subtitle ||
                        'Handpicked Mithila Makhana crafted with care. Roasted, never fried — bursting with real Indian flavours.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Single-Row Compact CTA Bar (Never Wraps Across Slides on Mobile) */}
              <div className="flex flex-nowrap items-center gap-2 sm:gap-2.5 relative">
                <Link
                  to={currentBanner?.ctaLink || '/shop'}
                  className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-11 px-4 sm:px-6 rounded-full bg-[#B7E843] text-[#0D3B2A] text-xs sm:text-sm font-extrabold hover:bg-[#cbf65e] transition-all shadow-md whitespace-nowrap shrink-0"
                >
                  <span>{primaryCtaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
                </Link>

                <Link
                  to="/category/makhana-combo"
                  className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-11 px-3.5 sm:px-5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-xs border border-white/35 text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                >
                  4-Flavour Combo
                </Link>

                <CurvedGuideArrow
                  direction="right"
                  color="#F4B926"
                  className="hidden xl:block w-20 h-10 -mt-1"
                />
              </div>

              {/* Compact Offer Perks & 2-Slide Controls */}
              <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-white/20">
                <div className="flex items-center gap-x-2 text-[11px] sm:text-xs font-semibold text-[#FFF9EE]/92 truncate">
                  <span className="text-[#F4B926] font-bold shrink-0">
                    Free Shipping ₹{settings.freeShippingThreshold}+
                  </span>
                  <span aria-hidden="true">•</span>
                  <span className="truncate">
                    {settings.bulkDiscountPercent || 20}% OFF on ₹
                    {settings.bulkDiscountThreshold || 599}+
                  </span>
                </div>

                {heroBanners.length > 1 && (
                  <div className="flex items-center gap-1.5 shrink-0" role="tablist" aria-label="Hero slides">
                    {heroBanners.map((b, index) => (
                      <button
                        key={b.id}
                        type="button"
                        role="tab"
                        aria-selected={safeSlide === index}
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Slide ${index + 1}: ${b.title}`}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          safeSlide === index
                            ? 'w-7 bg-[#B7E843]'
                            : 'w-2.5 bg-white/45 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Locked 1:1 Square Hero Visual Stage (Zero Height Shift) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-[216px] h-[216px] sm:w-[290px] sm:h-[290px] lg:w-[330px] lg:h-[330px] aspect-square shrink-0">
                <OrbitCircles
                  dotColor="#F4B926"
                  ringColor="#B7E843"
                  className="absolute -inset-3 w-[calc(100%+1.5rem)] h-[calc(100%+1.5rem)] opacity-70 animate-spin-slow"
                />
                <AnimatedSparkle
                  className="w-6 h-6 absolute -top-2 left-4 z-20"
                  color="#F4B926"
                />
                <AnimatedSparkle
                  className="w-5 h-5 absolute bottom-3 -right-1 z-20"
                  color="#B7E843"
                  delay={1.2}
                />

                {/* Floating Price / Farm Tag */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF1B8] text-[#0D3B2A] shadow-lg absolute -bottom-2.5 left-2 z-20 border-2 border-white">
                  <Flame className="w-3.5 h-3.5 text-[#FF7F3E] shrink-0" />
                  <div className="leading-tight">
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#23884D]">
                      Roasted Not Fried
                    </p>
                    <p className="text-[11px] font-extrabold">From ₹229</p>
                  </div>
                </div>

                <div className="relative z-10 w-full h-full rounded-[24px] overflow-hidden bg-white/95 border-[3px] border-white/30 shadow-2xl aspect-square">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentBanner?.image || `hero-img-${safeSlide}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="w-full h-full"
                    >
                      <SafeImage
                        src={currentBanner?.image || OFFICIAL_ASSETS.heroSnacks}
                        alt={currentBanner?.title || 'MAKH AND MORE Premium Mithila Makhana'}
                        priority
                        width={900}
                        className={`w-full h-full ${
                          currentBanner?.image === OFFICIAL_ASSETS.flavourCollection
                            ? 'object-contain bg-gradient-to-br from-[#FFF9EE] to-[#EBF9C8] p-3'
                            : 'object-cover'
                        }`}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HORIZONTAL APP CATEGORY SCROLLER (Square Thumbnails) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base sm:text-xl font-extrabold text-[#0D3B2A]">
              Explore Categories
            </h2>
            <CurvedGuideArrow
              direction="right"
              color="#23884D"
              className="w-12 h-6 hidden sm:block"
            />
          </div>
          <Link
            to="/shop"
            className="text-xs font-extrabold text-[#23884D] hover:text-[#0D3B2A] inline-flex items-center gap-1"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-1.5 no-scrollbar snap-x snap-mandatory">
          {APP_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.03 }}
              className="shrink-0 snap-start"
            >
              <Link
                to={cat.to}
                className="group flex flex-col items-center w-[78px] sm:w-[98px] text-center"
              >
                <div
                  className={`w-[72px] h-[72px] sm:w-[90px] sm:h-[90px] aspect-square rounded-[22px] bg-gradient-to-br ${cat.bg} p-1.5 ring-2 ${cat.ring} shadow-sm group-hover:scale-105 transition-all duration-300 flex items-center justify-center overflow-hidden`}
                >
                  <div className="w-full h-full aspect-square rounded-[16px] bg-white/90 p-1 flex items-center justify-center overflow-hidden">
                    <SafeImage
                      src={cat.image}
                      alt={cat.name}
                      width={240}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <span className="mt-1.5 text-[11px] sm:text-xs font-extrabold text-[#0D3B2A] group-hover:text-[#23884D] leading-tight">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. ASYMMETRICAL "TRENDING CRUNCH" PRODUCT SPOTLIGHT + GRID */}
      <section className="relative py-5 sm:py-8 bg-dots-mustard">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-2 mb-4">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF1B8] text-[#0D3B2A] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-[#FF7F3E]" /> Fresh Batch Drops
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
                Trending Crunch Picks
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <CurvedGuideArrow
                direction="down-right"
                color="#FF7F3E"
                className="w-14 h-9 hidden md:block"
              />
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold hover:bg-[#175C41] transition-colors whitespace-nowrap"
              >
                All ({products.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Asymmetrical Bento Layout: Big Featured Jumbo Makhana Card + 4 Colourful Square Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
            {mainSpotlightProduct && (
              <div className="lg:col-span-5">
                <ProductCard product={mainSpotlightProduct} variant="featured" />
              </div>
            )}

            <div className="lg:col-span-7 grid grid-cols-2 gap-2.5 sm:gap-4">
              {otherProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} variant="standard" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE "PICK YOUR FLAVOUR MOOD" STAGE */}
      <section className="relative">
        <WavySectionDivider fill="#E2F6E7" />
        <div className="bg-[#E2F6E7] bg-dots-lime py-6 sm:py-10 relative overflow-hidden">
          <OrganicBlob
            fill="#B7E843"
            opacity={0.32}
            className="w-64 h-64 absolute -top-20 -left-20 pointer-events-none"
          />

          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 sm:mb-6">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  Tap A Flavour Mood
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
                  Not Just Makhana, It’s a Flavour Vibe.
                </h2>
              </div>

              {/* Interactive Flavour Mood Pill Switcher */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {FLAVOUR_MOODS.map((mood) => {
                  const active = mood.id === activeMood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => setSelectedFlavourId(mood.id)}
                      className={`h-9 px-3.5 sm:px-4 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shadow-xs shrink-0 ${
                        active
                          ? `${mood.pillActive} shadow-md`
                          : 'bg-white text-[#0D3B2A] hover:bg-[#FFF9EE]'
                      }`}
                    >
                      {mood.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Morphing Flavour Card (Compact + Square Image) */}
            {activeMoodProduct && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMood.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.24 }}
                  className={`rounded-[26px] bg-gradient-to-br ${activeMood.stage} border-2 border-white shadow-lg p-4 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center`}
                >
                  <div className="lg:col-span-5 relative flex items-center justify-center">
                    <div className="relative w-44 h-44 sm:w-56 sm:h-56 aspect-square flex items-center justify-center">
                      <OrbitCircles
                        dotColor={activeMood.dotColor}
                        ringColor={activeMood.ringColor}
                        className="absolute inset-0 w-full h-full animate-spin-slow"
                      />
                      <AnimatedSparkle
                        className="w-6 h-6 absolute top-1 right-2"
                        color="#F4B926"
                      />
                      <div className="relative z-10 w-[86%] h-[86%] aspect-square animate-float">
                        <SafeImage
                          src={activeMoodProduct.primaryImage}
                          alt={activeMoodProduct.name}
                          imageCrop={activeMoodProduct.imageCrop}
                          width={600}
                          className="w-full h-full object-contain drop-shadow-[0_14px_18px_rgba(13,59,42,0.18)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-2.5 sm:space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/85 text-[11px] font-extrabold text-[#0D3B2A]">
                      <span>{activeMood.tag}</span>
                      <span>•</span>
                      <span>{activeMoodProduct.weight}</span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A] leading-tight">
                      {activeMoodProduct.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#12261E]/85 leading-relaxed max-w-xl">
                      {activeMood.note}
                    </p>

                    <div className="flex items-baseline gap-2.5 tabular-nums">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
                        ₹{activeMoodProduct.salePrice}
                      </span>
                      {activeMoodProduct.price > activeMoodProduct.salePrice && (
                        <span className="text-sm text-[#4A5E54] line-through">
                          ₹{activeMoodProduct.price}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-[#F25C54] text-white text-[10px] font-extrabold">
                        Roasted, Never Fried
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(activeMoodProduct, 1, true)}
                        className="h-11 px-5 sm:px-6 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 hover:bg-[#175C41] transition-colors shadow-md cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" /> Add {activeMood.name}
                      </motion.button>
                      <Link
                        to={`/product/${activeMoodProduct.slug}`}
                        className="h-11 px-5 rounded-full bg-white text-[#0D3B2A] text-xs sm:text-sm font-extrabold inline-flex items-center gap-1 hover:bg-[#FFF9EE] transition-colors shadow-sm"
                      >
                        View Pack <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
        <WavySectionDivider fill="#E2F6E7" flip />
      </section>

      {/* 5. COMPACT HORIZONTAL "QUICK CRUNCH" APP FEED (Jumbo & Roasted Packs) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        <div className="rounded-[26px] bg-[#FFE7D4]/65 border border-[#FF7F3E]/15 p-3.5 sm:p-6 bg-dots-coral">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF7F3E] text-white text-[10px] font-extrabold uppercase tracking-wider mb-1">
                Thumb-Friendly Quick Shop
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0D3B2A]">
                Stock Up Your Snack Shelf
              </h2>
            </div>
            <Link
              to="/category/makhana"
              className="text-xs font-extrabold text-[#0D3B2A] hover:text-[#C83B24] inline-flex items-center gap-1"
            >
              Jumbo Pouches & More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} variant="horizontal" />
            ))}
          </div>
        </div>
      </section>

      {/* 6. COLOURFUL TRUST & NUTRITION PILLARS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {BENEFIT_CARDS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.03 }}
                className={`${item.bg} rounded-[20px] p-3 sm:p-4 flex flex-col items-start gap-2 border border-[#0D3B2A]/6`}
              >
                <div
                  className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shadow-xs`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-xs sm:text-sm font-extrabold text-[#0D3B2A]">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-medium text-[#4A5E54] mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 7. MITHILA FARM-TO-HOME VIBRANT STORY BAND (1:1 Square Image) */}
      <section className="mt-4 sm:mt-6">
        <WavySectionDivider fill="#FFF1B8" />
        <div className="bg-[#FFF1B8] py-6 sm:py-10 bg-dots-mustard relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
              <div className="lg:col-span-5 relative">
                <div className="rounded-[26px] overflow-hidden border-4 border-white shadow-xl aspect-square max-w-[340px] lg:max-w-[400px] w-full mx-auto">
                  <SafeImage
                    src={OFFICIAL_ASSETS.farmer}
                    alt="Mithila farmers harvesting makhana in Darbhanga, Bihar wetlands"
                    width={900}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 right-4 sm:right-6 bg-[#0D3B2A] text-[#B7E843] px-3.5 py-2 rounded-xl shadow-lg border-2 border-white">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#F4B926]">
                    Vill. Jatuka · Darbhanga
                  </p>
                  <p className="font-display text-xs font-extrabold">Authentic Mithila Harvest</p>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-3.5 pt-2 lg:pt-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D3B2A] text-[#B7E843] text-[11px] font-extrabold">
                  Direct Farmer Partnership
                </span>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D3B2A] leading-tight">
                  From Mithila Wetlands Straight to Your Snack Bowl.
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-[#12261E]/85 leading-relaxed">
                  Rooted in Darbhanga, Bihar, <strong>ASR Enterprises</strong> works directly with
                  local Mithila pond farmers who hand-harvest lotus seeds using generations-old
                  craft. Graded for jumbo puff, slow-roasted, and sealed fresh without middlemen.
                </p>

                <div className="flex items-center gap-3 bg-white/85 rounded-2xl p-3 border border-white shadow-xs">
                  <CurvedGuideArrow
                    direction="loop"
                    color="#23884D"
                    className="w-18 h-10 shrink-0"
                  />
                  <div className="text-xs font-bold text-[#0D3B2A] space-y-0.5">
                    <p>Mithila Wetlands → Slow Roasted → Delivered Across India</p>
                    <p className="text-[#4A5E54] font-medium">
                      Hygienically processed · Zero artificial polish
                    </p>
                  </div>
                </div>

                <Link
                  to="/our-story"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs sm:text-sm font-extrabold hover:bg-[#175C41] transition-colors shadow-md"
                >
                  Read Our Mithila Story <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <WavySectionDivider fill="#FFF1B8" flip />
      </section>

      {/* 8. SNACK JOURNAL & RECIPES (Horizontal Scroll Carousel + 1:1 Square Images) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="flex items-end justify-between gap-2 mb-3.5">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-[10px] font-extrabold uppercase tracking-wider mb-1">
              Mithila Journal
            </span>
            <h2 className="font-display text-xl sm:text-3xl font-extrabold text-[#0D3B2A]">
              Recipes & Crunch Stories
            </h2>
          </div>
          <Link
            to="/blog"
            className="text-xs sm:text-sm font-extrabold text-[#23884D] hover:text-[#0D3B2A] inline-flex items-center gap-1 shrink-0"
          >
            All Stories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
          {blogs.map((post, idx) => {
            const cardTints = ['bg-[#EBF9C8]/60', 'bg-[#FFE7D4]/60', 'bg-[#E2F1FF]/60'];
            return (
              <article
                key={post.id}
                className={`group w-[248px] sm:w-[290px] lg:w-[320px] shrink-0 snap-start rounded-[22px] ${
                  cardTints[idx % cardTints.length]
                } border border-[#0D3B2A]/8 p-2.5 flex flex-col hover:shadow-md transition-all`}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="aspect-square rounded-[16px] bg-white overflow-hidden block"
                >
                  <SafeImage
                    src={post.featuredImage}
                    alt={post.title}
                    width={640}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-2 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#23884D] mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-white text-[#0D3B2A]">
                      {post.category}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="font-display text-sm sm:text-base font-extrabold text-[#0D3B2A] group-hover:text-[#23884D] leading-snug line-clamp-2 mb-1"
                  >
                    {post.title}
                  </Link>
                  <p className="text-[11px] sm:text-xs text-[#4A5E54] line-clamp-2 mb-2">
                    {post.excerpt}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="mt-auto inline-flex items-center gap-1 text-xs font-extrabold text-[#0D3B2A]"
                  >
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 9. MINI HORIZONTAL GOOGLE REVIEWS STRIP (Real Multi-Color Google Logo) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-5 sm:pb-7">
        <div className="rounded-[24px] bg-white border border-[#0D3B2A]/10 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#0D3B2A]/10 flex items-center justify-center shrink-0 shadow-2xs">
                <GoogleLogoSvg className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display text-sm sm:text-lg font-extrabold text-[#0D3B2A]">
                    Google Reviews
                  </h2>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#FFF1B8] text-[#0D3B2A] text-[10px] font-extrabold tabular-nums">
                    4.9 <Star className="w-2.5 h-2.5 fill-[#FBBC05] text-[#FBBC05]" />
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#4A5E54]">
                  Loved by healthy snackers across India
                </p>
              </div>
            </div>

            <Link
              to="/my-orders"
              className="text-[11px] sm:text-xs font-extrabold text-[#23884D] hover:text-[#0D3B2A] inline-flex items-center gap-1 shrink-0"
            >
              Rate Order <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 no-scrollbar snap-x snap-mandatory">
            {combinedGoogleReviews.map((rev) => (
              <div
                key={rev.id}
                className="w-[244px] sm:w-[276px] shrink-0 snap-start p-3 rounded-[18px] bg-[#FFF9EE]/75 border border-[#0D3B2A]/8 flex flex-col justify-between gap-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-[#0D3B2A] text-[#B7E843] text-[11px] font-extrabold flex items-center justify-center shrink-0">
                        {rev.authorName.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0 leading-tight">
                        <p className="text-xs font-extrabold text-[#0D3B2A] truncate">
                          {rev.authorName}
                        </p>
                        <p className="text-[10px] text-[#4A5E54] truncate">
                          {rev.city} · {rev.timeAgo}
                        </p>
                      </div>
                    </div>
                    <GoogleLogoSvg className="w-4 h-4 shrink-0" />
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rev.rating
                            ? 'fill-[#FBBC05] text-[#FBBC05]'
                            : 'text-[#0D3B2A]/15'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-[11px] sm:text-xs text-[#12261E]/85 leading-relaxed line-clamp-3">
                    "{rev.comment}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. JOIN THE CRUNCH CLUB — DIRECT WHATSAPP BUTTON (NO EMAIL FORM) */}
      <section className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pb-3">
        <div className="relative rounded-[26px] bg-[#D8F786] bg-gradient-to-br from-[#B7E843] via-[#D8F786] to-[#FFF1B8] p-5 sm:p-7 text-center overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-dots-forest pointer-events-none" />
          <AnimatedSparkle className="w-6 h-6 absolute top-4 left-6" color="#0D3B2A" />
          <AnimatedSparkle className="w-5 h-5 absolute bottom-4 right-6" color="#FF7F3E" delay={1} />

          <div className="relative z-10 space-y-2.5">
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-[11px] font-extrabold">
              Join the Crunch Club
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
              Fresh Harvest Drops & Exclusive Offers
            </h2>
            <p className="text-xs sm:text-sm text-[#12261E]/80 max-w-md mx-auto font-medium">
              Tap below to join our WhatsApp Crunch Club for new Mithila harvest alerts, festive combos & instant deals.
            </p>
            <div className="pt-1.5 flex justify-center">
              <a
                href={whatsappClubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-extrabold shadow-[0_10px_24px_rgba(37,211,102,0.35)] transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Join on WhatsApp</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
