import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Flame,
  Leaf,
  MapPin,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  WheatOff,
} from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  AnimatedDotCluster,
  AnimatedSparkle,
  CurvedGuideArrow,
  FloatingLotusLeaf,
  getProductTheme,
  OrbitCircles,
  OrganicBlob,
  SafeImage,
  WavySectionDivider,
} from '../components/BrandVisuals';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { OFFICIAL_ASSETS } from '../data/seedData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useSEO } from '../lib/seo';

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
  const { products, banners, blogs, reviews, settings, addToCart, showToast } = useStore();
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedFlavourId, setSelectedFlavourId] = useState('pudina');
  const [heroSearch, setHeroSearch] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterBusy, setNewsletterBusy] = useState(false);

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

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const currentBanner = banners[activeSlide] || banners[0];
  const comboProduct =
    products.find((p) => p.slug === 'roasted-makhana-combo-4-flavours') || products[0];
  const otherProducts = products.filter((p) => p.id !== comboProduct?.id);
  const activeMood = FLAVOUR_MOODS.find((f) => f.id === selectedFlavourId) || FLAVOUR_MOODS[0];
  const activeMoodProduct =
    products.find((p) => p.slug === activeMood.slug) ||
    products.find((p) => p.slug === 'roasted-makhana-pudina-90g') ||
    products[0];
  const approvedReviews = reviews.filter((r) => r.approved).slice(0, 6);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) {
      navigate('/shop');
      return;
    }
    navigate(`/shop?q=${encodeURIComponent(heroSearch.trim())}`);
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setNewsletterBusy(true);
    try {
      const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await setDoc(doc(db, 'subscribers', id), {
        email,
        subscribedAt: serverTimestamp(),
      });
      setNewsletterEmail('');
      showToast('Welcome to MAKH AND MORE! You are subscribed.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'subscribers', false);
      showToast('Subscription could not be saved right now.', 'error');
    } finally {
      setNewsletterBusy(false);
    }
  };

  return (
    <div className="overflow-x-clip">
      {/* 1. MOBILE-FIRST APP GREETING & HERO BANNER */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8">
        {/* Friendly App Greeting & Quick Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 mb-5">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#23884D]">
              <span className="w-2 h-2 rounded-full bg-[#B7E843] ring-4 ring-[#B7E843]/35" />
              Fresh Mithila Harvest · Darbhanga, Bihar
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0D3B2A] mt-0.5">
              Ready for guilt-free crunch today?
            </h2>
          </div>

          <form onSubmit={handleHeroSearch} className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-[#23884D] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Search Pudina, Peri Peri, Jumbo 200g..."
              className="w-full h-12 pl-11 pr-24 rounded-full bg-white border-2 border-[#0D3B2A]/10 text-sm font-medium text-[#12261E] shadow-xs focus:outline-none focus:border-[#23884D]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold hover:bg-[#175C41] transition-colors cursor-pointer"
            >
              Find
            </button>
          </form>
        </div>

        {/* Colourful Hero Card with Floating Product, Animated Dots & Curved Guide Arrow */}
        <div className="relative rounded-[34px] sm:rounded-[42px] bg-gradient-to-br from-[#0D3B2A] via-[#15573D] to-[#23884D] text-white overflow-hidden shadow-[0_20px_50px_rgba(13,59,42,0.22)] bg-dots-light">
          {/* Decorative Organic Blobs & Floating Dots */}
          <OrganicBlob
            fill="#B7E843"
            opacity={0.22}
            className="w-72 h-72 sm:w-96 sm:h-96 absolute -top-24 -right-20 pointer-events-none"
          />
          <OrganicBlob
            fill="#F4B926"
            opacity={0.18}
            className="w-64 h-64 absolute -bottom-24 -left-16 pointer-events-none"
          />
          <AnimatedDotCluster
            className="w-24 h-24 absolute top-5 right-8 opacity-65 pointer-events-none hidden sm:block"
            color="#B7E843"
            accentColor="#F4B926"
          />
          <FloatingLotusLeaf
            className="w-16 h-16 absolute bottom-6 left-1/2 -translate-x-1/2 opacity-50 pointer-events-none hidden lg:block"
            delay={0.8}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center p-6 sm:p-10 lg:p-12">
            {/* Hero Copy */}
            <div className="lg:col-span-6 space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBanner?.id || 'hero-copy'}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B7E843]/20 border border-[#B7E843]/40 text-[#B7E843] text-xs font-extrabold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentBanner?.eyebrow || 'Healthy Snacking Redefined'}</span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.06] tracking-tight text-white">
                    {currentBanner?.title || 'Pure. Natural. Delicious.'}
                  </h1>

                  <p className="text-sm sm:text-base text-[#FFF9EE]/88 leading-relaxed max-w-lg">
                    {currentBanner?.subtitle ||
                      'Wholesome Mithila Makhana snacks crafted with care in Darbhanga. Roasted, never fried — bursting with real Indian flavours.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* CTA Row + Hand-Drawn Curved Guide Arrow */}
              <div className="flex flex-wrap items-center gap-3 pt-1 relative">
                <Link
                  to={currentBanner?.ctaLink || '/shop'}
                  className="inline-flex items-center gap-2 h-13 px-7 rounded-full bg-[#B7E843] text-[#0D3B2A] text-sm font-extrabold hover:bg-[#cbf65e] transition-all shadow-lg shadow-black/15 hover:scale-[1.02] whitespace-nowrap"
                >
                  {currentBanner?.ctaText || 'SHOP NOW'}
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <Link
                  to="/category/makhana-combo"
                  className="inline-flex items-center gap-2 h-13 px-6 rounded-full bg-white/14 hover:bg-white/22 backdrop-blur-xs border border-white/25 text-white text-sm font-bold transition-colors whitespace-nowrap"
                >
                  4-Flavour Combo
                </Link>

                <CurvedGuideArrow
                  direction="right"
                  color="#F4B926"
                  className="hidden xl:block w-24 h-12 -mt-2"
                />
              </div>

              {/* Compact Offer Perks & Slide Dots */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-white/15">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#FFF9EE]/85">
                  <span className="text-[#F4B926]">
                    Free Shipping ₹{settings.freeShippingThreshold}+
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>
                    {settings.bulkDiscountPercent || 20}% OFF on ₹
                    {settings.bulkDiscountThreshold || 599}+
                  </span>
                </div>

                {banners.length > 1 && (
                  <div className="flex items-center gap-2">
                    {banners.map((b, index) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Slide ${index + 1}: ${b.title}`}
                        className={`h-2.5 rounded-full transition-all cursor-pointer ${
                          activeSlide === index
                            ? 'w-8 bg-[#B7E843]'
                            : 'w-2.5 bg-white/35 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Floating Hero Visual Stage */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-[460px]">
                <OrbitCircles
                  dotColor="#F4B926"
                  ringColor="#B7E843"
                  className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] opacity-75 animate-spin-slow"
                />
                <AnimatedSparkle
                  className="w-8 h-8 absolute -top-3 left-6 z-20"
                  color="#F4B926"
                />
                <AnimatedSparkle
                  className="w-6 h-6 absolute bottom-4 -right-2 z-20"
                  color="#B7E843"
                  delay={1.2}
                />

                {/* Floating Price / Farm Tag */}
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FFF1B8] text-[#0D3B2A] shadow-xl absolute -bottom-3 left-4 z-20 border-2 border-white">
                  <Flame className="w-4 h-4 text-[#FF7F3E] shrink-0" />
                  <div className="leading-tight">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#23884D]">
                      Roasted Not Fried
                    </p>
                    <p className="text-xs font-extrabold">Packs from ₹229</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBanner?.image || 'hero-img'}
                    initial={{ opacity: 0, scale: 0.94, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10 rounded-[30px] overflow-hidden bg-white/95 border-4 border-white/25 shadow-2xl aspect-[4/3] animate-float"
                  >
                    <SafeImage
                      src={currentBanner?.image || OFFICIAL_ASSETS.heroSnacks}
                      alt={currentBanner?.title || 'MAKH AND MORE Premium Mithila Makhana'}
                      priority
                      width={1100}
                      className={`w-full h-full ${
                        currentBanner?.image === OFFICIAL_ASSETS.flavourCollection
                          ? 'object-contain bg-gradient-to-br from-[#FFF9EE] to-[#EBF9C8] p-4'
                          : 'object-cover'
                      }`}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HORIZONTAL APP CATEGORY SCROLLER (Circular/Squircle Thumbnails) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg sm:text-2xl font-extrabold text-[#0D3B2A]">
              Explore Categories
            </h2>
            <CurvedGuideArrow
              direction="right"
              color="#23884D"
              className="w-14 h-7 hidden sm:block"
            />
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-extrabold text-[#23884D] hover:text-[#0D3B2A] inline-flex items-center gap-1"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-3.5 sm:gap-5 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
          {APP_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
              className="shrink-0 snap-start"
            >
              <Link
                to={cat.to}
                className="group flex flex-col items-center w-[92px] sm:w-[116px] text-center"
              >
                <div
                  className={`w-[82px] h-[82px] sm:w-[104px] sm:h-[104px] rounded-[28px] bg-gradient-to-br ${cat.bg} p-2 ring-4 ${cat.ring} shadow-md group-hover:scale-105 group-hover:-rotate-2 transition-all duration-300 flex items-center justify-center overflow-hidden`}
                >
                  <div className="w-full h-full rounded-[20px] bg-white/85 p-1.5 flex items-center justify-center overflow-hidden">
                    <SafeImage
                      src={cat.image}
                      alt={cat.name}
                      width={240}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <span className="mt-2.5 text-xs sm:text-[13px] font-extrabold text-[#0D3B2A] group-hover:text-[#23884D] leading-tight">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. ASYMMETRICAL "TRENDING CRUNCH" PRODUCT SPOTLIGHT + GRID */}
      <section className="relative py-10 sm:py-14 bg-dots-mustard">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1B8] text-[#0D3B2A] text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-[#FF7F3E]" /> Fresh Batch Drops
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B2A]">
                Trending Crunch Picks
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <CurvedGuideArrow
                direction="down-right"
                color="#FF7F3E"
                className="w-16 h-11 hidden md:block"
              />
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs sm:text-sm font-extrabold hover:bg-[#175C41] transition-colors whitespace-nowrap"
              >
                Shop All ({products.length}) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Asymmetrical Bento Layout: Big Featured Card Left + 4 Colourful Cards Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {comboProduct && (
              <div className="lg:col-span-5">
                <ProductCard product={comboProduct} variant="featured" />
              </div>
            )}

            <div className="lg:col-span-7 grid grid-cols-2 gap-3.5 sm:gap-5">
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
        <div className="bg-[#E2F6E7] bg-dots-lime py-12 sm:py-16 relative overflow-hidden">
          <OrganicBlob
            fill="#B7E843"
            opacity={0.35}
            className="w-80 h-80 absolute -top-24 -left-24 pointer-events-none"
          />

          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D3B2A] text-[#B7E843] text-[11px] font-extrabold uppercase tracking-wider mb-2">
                  Tap A Flavour Mood
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B2A]">
                  Not Just Makhana, It’s a Flavour Vibe.
                </h2>
              </div>

              {/* Interactive Flavour Mood Pill Switcher */}
              <div className="flex flex-wrap gap-2">
                {FLAVOUR_MOODS.map((mood) => {
                  const active = mood.id === activeMood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => setSelectedFlavourId(mood.id)}
                      className={`h-11 px-4 sm:px-5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xs ${
                        active
                          ? `${mood.pillActive} scale-105 shadow-md`
                          : 'bg-white text-[#0D3B2A] hover:bg-[#FFF9EE]'
                      }`}
                    >
                      {mood.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Morphing Flavour Card */}
            {activeMoodProduct && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMood.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28 }}
                  className={`rounded-[34px] bg-gradient-to-br ${activeMood.stage} border-2 border-white shadow-xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center`}
                >
                  <div className="lg:col-span-5 relative flex items-center justify-center min-h-[240px]">
                    <OrbitCircles
                      dotColor={activeMood.dotColor}
                      ringColor={activeMood.ringColor}
                      className="absolute inset-0 w-full h-full max-w-[300px] mx-auto animate-spin-slow"
                    />
                    <AnimatedSparkle
                      className="w-7 h-7 absolute top-2 right-8"
                      color="#F4B926"
                    />
                    <div className="relative z-10 w-52 h-52 sm:w-64 sm:h-64 animate-float">
                      <SafeImage
                        src={activeMoodProduct.primaryImage}
                        alt={activeMoodProduct.name}
                        imageCrop={activeMoodProduct.imageCrop}
                        width={600}
                        className="w-full h-full object-contain drop-shadow-[0_18px_24px_rgba(13,59,42,0.2)]"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/85 text-xs font-extrabold text-[#0D3B2A]">
                      <span>{activeMood.tag}</span>
                      <span>•</span>
                      <span>{activeMoodProduct.weight}</span>
                    </div>

                    <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B2A]">
                      {activeMoodProduct.name}
                    </h3>

                    <p className="text-sm sm:text-base text-[#12261E]/85 leading-relaxed max-w-xl">
                      {activeMood.note}
                    </p>

                    <div className="flex items-baseline gap-3 tabular-nums pt-1">
                      <span className="text-3xl font-extrabold text-[#0D3B2A]">
                        ₹{activeMoodProduct.salePrice}
                      </span>
                      {activeMoodProduct.price > activeMoodProduct.salePrice && (
                        <span className="text-base text-[#4A5E54] line-through">
                          ₹{activeMoodProduct.price}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full bg-[#F25C54] text-white text-xs font-extrabold">
                        Roasted, Never Fried
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(activeMoodProduct, 1, true)}
                        className="h-12 px-7 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold inline-flex items-center gap-2 hover:bg-[#175C41] transition-colors shadow-lg cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" /> Add {activeMood.name} to Bag
                      </motion.button>
                      <Link
                        to={`/product/${activeMoodProduct.slug}`}
                        className="h-12 px-6 rounded-full bg-white text-[#0D3B2A] text-sm font-extrabold inline-flex items-center gap-1.5 hover:bg-[#FFF9EE] transition-colors shadow-sm"
                      >
                        View Pack <ArrowRight className="w-4 h-4" />
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
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-12">
        <div className="rounded-[34px] bg-[#FFE7D4]/65 border border-[#FF7F3E]/15 p-5 sm:p-8 bg-dots-coral">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7F3E] text-white text-[11px] font-extrabold uppercase tracking-wider mb-2">
                Thumb-Friendly Quick Shop
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
                Stock Up Your Snack Shelf
              </h2>
            </div>
            <Link
              to="/category/makhana"
              className="text-xs sm:text-sm font-extrabold text-[#0D3B2A] hover:text-[#C83B24] inline-flex items-center gap-1"
            >
              Jumbo Pouches & More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} variant="horizontal" />
            ))}
          </div>
        </div>
      </section>

      {/* 6. COLOURFUL TRUST & NUTRITION PILLARS */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {BENEFIT_CARDS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.04 }}
                className={`${item.bg} rounded-[26px] p-4 flex flex-col items-start gap-2.5 border border-[#0D3B2A]/6`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-xs`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-extrabold text-[#0D3B2A]">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-medium text-[#4A5E54] mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 7. MITHILA FARM-TO-HOME VIBRANT STORY BAND */}
      <section className="mt-10">
        <WavySectionDivider fill="#FFF1B8" />
        <div className="bg-[#FFF1B8] py-12 sm:py-16 bg-dots-mustard relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-6 relative">
                <div className="rounded-[34px] overflow-hidden border-4 border-white shadow-2xl aspect-[16/11]">
                  <SafeImage
                    src={OFFICIAL_ASSETS.farmer}
                    alt="Mithila farmers harvesting makhana in Darbhanga, Bihar wetlands"
                    width={1100}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 right-4 sm:right-6 bg-[#0D3B2A] text-[#B7E843] px-4 py-2.5 rounded-2xl shadow-xl border-2 border-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#F4B926]">
                    Vill. Jatuka · Darbhanga
                  </p>
                  <p className="font-display text-sm font-extrabold">Authentic Mithila Harvest</p>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-5 pt-2 lg:pt-0">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold">
                  Direct Farmer Partnership
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B2A] leading-tight">
                  From Mithila Wetlands Straight to Your Snack Bowl.
                </h2>
                <p className="text-sm sm:text-base text-[#12261E]/85 leading-relaxed">
                  Rooted in Darbhanga, Bihar, <strong>ASR Enterprises</strong> works directly with
                  local Mithila pond farmers who hand-harvest lotus seeds using generations-old
                  craft. Graded for jumbo puff, slow-roasted, and sealed fresh without middlemen.
                </p>

                <div className="flex items-center gap-4 bg-white/85 rounded-2xl p-4 border border-white shadow-xs">
                  <CurvedGuideArrow
                    direction="loop"
                    color="#23884D"
                    className="w-24 h-12 shrink-0"
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
                  className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold hover:bg-[#175C41] transition-colors shadow-md"
                >
                  Read Our Mithila Story <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <WavySectionDivider fill="#FFF1B8" flip />
      </section>

      {/* 8. SNACK JOURNAL & RECIPES */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-[11px] font-extrabold uppercase tracking-wider mb-2">
              Mithila Journal
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B2A]">
              Recipes, Origin & Crunch Stories
            </h2>
          </div>
          <Link
            to="/blog"
            className="text-sm font-extrabold text-[#23884D] hover:text-[#0D3B2A] inline-flex items-center gap-1"
          >
            All Stories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {blogs.slice(0, 3).map((post, idx) => {
            const cardTints = ['bg-[#EBF9C8]/55', 'bg-[#FFE7D4]/55', 'bg-[#E2F1FF]/55'];
            return (
              <article
                key={post.id}
                className={`group rounded-[28px] ${
                  cardTints[idx % cardTints.length]
                } border border-[#0D3B2A]/8 p-3 flex flex-col hover:shadow-lg transition-all`}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="aspect-[16/10] rounded-[20px] bg-white overflow-hidden block"
                >
                  <SafeImage
                    src={post.featuredImage}
                    alt={post.title}
                    width={640}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-3.5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#23884D] mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#0D3B2A]">
                      {post.category}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="font-display text-lg font-extrabold text-[#0D3B2A] group-hover:text-[#23884D] leading-snug mb-2"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs sm:text-sm text-[#4A5E54] line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="mt-auto inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0D3B2A]"
                  >
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 9. VERIFIED CUSTOMER REVIEWS (Real Firestore Data Only) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-[34px] bg-white border border-[#0D3B2A]/10 p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1B8] text-[#0D3B2A] text-[11px] font-extrabold uppercase tracking-wider mb-2">
                Verified Voices Only
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
                What Real Snackers Say
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs sm:text-sm font-extrabold text-[#23884D] hover:text-[#0D3B2A] inline-flex items-center gap-1"
            >
              Rate Your Favourite Pack <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {approvedReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {approvedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-[24px] bg-[#FFF9EE] border border-[#0D3B2A]/8 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-2.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating
                              ? 'fill-[#F4B926] text-[#F4B926]'
                              : 'text-[#0D3B2A]/15'
                          }`}
                        />
                      ))}
                    </div>
                    {rev.title && (
                      <h3 className="font-display font-bold text-sm text-[#0D3B2A] mb-1">
                        {rev.title}
                      </h3>
                    )}
                    <p className="text-xs sm:text-sm text-[#4A5E54] leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                  <div className="pt-3 mt-4 border-t border-[#0D3B2A]/8 text-xs flex items-center justify-between">
                    <span className="font-extrabold text-[#0D3B2A]">{rev.authorName}</span>
                    {rev.verifiedPurchase && (
                      <span className="px-2 py-0.5 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-[10px] font-extrabold">
                        Verified Buyer
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[26px] bg-gradient-to-r from-[#EBF9C8] to-[#FFF1B8] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 text-[#0D3B2A]">
                  <PackageCheck className="w-5 h-5" />
                  <h3 className="font-display text-xl font-extrabold">
                    100% Genuine Customer Reviews Only
                  </h3>
                </div>
                <p className="text-sm text-[#12261E]/80 leading-relaxed">
                  We never display fake ratings. Every review published here comes from verified
                  MAKH AND MORE customers sharing real tasting notes on our product pages.
                </p>
              </div>
              <Link
                to="/shop"
                className="px-6 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs sm:text-sm font-extrabold hover:bg-[#175C41] whitespace-nowrap shrink-0"
              >
                Explore & Review
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 10. COLOURFUL NEWSLETTER BOX */}
      <section className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 pb-6">
        <div className="relative rounded-[34px] bg-gradient-to-br from-[#B7E843] via-[#D8F786] to-[#FFF1B8] p-7 sm:p-12 text-center overflow-hidden shadow-lg bg-dots-forest">
          <AnimatedSparkle className="w-7 h-7 absolute top-6 left-8" color="#0D3B2A" />
          <AnimatedSparkle className="w-6 h-6 absolute bottom-6 right-8" color="#FF7F3E" delay={1} />

          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold">
              Join the Crunch Club
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B2A]">
              Fresh Harvest Drops & Exclusive Offers
            </h2>
            <p className="text-sm sm:text-base text-[#12261E]/80 max-w-lg mx-auto font-medium">
              Get seasonal Mithila makhana recipes, early flavour launches, and bundle deals straight
              to your inbox.
            </p>
            <form
              onSubmit={handleNewsletter}
              className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5 pt-2"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 h-12 px-5 rounded-full bg-white border-2 border-[#0D3B2A]/12 text-sm font-medium text-[#12261E] focus:outline-none focus:border-[#0D3B2A]"
              />
              <button
                type="submit"
                disabled={newsletterBusy}
                className="h-12 px-7 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold hover:bg-[#175C41] transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-md"
              >
                {newsletterBusy ? 'Joining...' : 'Join Free'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
