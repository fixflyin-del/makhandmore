import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Minus,
  Package,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  ZoomIn,
} from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  AnimatedSparkle,
  getProductTheme,
  OrbitCircles,
  SafeImage,
} from '../components/BrandVisuals';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useSEO } from '../lib/seo';

const FLAVOUR_VARIANTS = [
  { label: 'Pudina', slug: 'roasted-makhana-pudina-90g', swatch: 'bg-[#23884D]' },
  { label: 'Peri Peri', slug: 'roasted-makhana-peri-peri-90g', swatch: 'bg-[#F25C54]' },
  { label: 'Cheese', slug: 'roasted-makhana-cheese-90g', swatch: 'bg-[#F4B926]' },
  { label: 'Himalayan Salt', slug: 'roasted-makhana-himalayan-salt-90g', swatch: 'bg-[#4A90D9]' },
];

const JUMBO_WEIGHT_VARIANTS = [
  { label: '100g Pouch', slug: 'premium-jumbo-makhana-100g' },
  { label: '200g Family Pack', slug: 'premium-jumbo-makhana-200g' },
];

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    products,
    reviews,
    settings,
    addToCart,
    toggleWishlist,
    isWishlisted,
    recentlyViewedIds,
    recordRecentlyViewed,
    showToast,
  } = useStore();
  const { user, signInWithGoogle } = useAuth();

  const product = useMemo(
    () => products.find((p) => p.slug === slug || p.id === slug),
    [products, slug]
  );

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [qty, setQty] = useState(1);
  const [pinInput, setPinInput] = useState('');
  const [pinResult, setPinResult] = useState<{
    serviceable: boolean;
    message?: string;
    region?: string;
    estimatedDays?: string;
    codAvailable?: boolean;
  } | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');

  // Review Form
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');
  const [submittingRev, setSubmittingRev] = useState(false);

  useEffect(() => {
    setSelectedImageIdx(0);
    setQty(1);
    if (product) {
      recordRecentlyViewed(product.id);
    }
  }, [product?.id, recordRecentlyViewed]);

  const productReviews = useMemo(
    () => (product ? reviews.filter((r) => r.productId === product.id && r.approved) : []),
    [reviews, product]
  );

  const avgRating = useMemo(() => {
    if (productReviews.length === 0) return 0;
    return productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
  }, [productReviews]);

  const jsonLd = useMemo(() => {
    if (!product) return undefined;
    const productSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: [product.primaryImage, ...(product.gallery || [])].map((img) =>
        img.startsWith('http') ? img : `${window.location.origin}${img}`
      ),
      description: product.shortDescription,
      sku: product.sku,
      brand: { '@type': 'Brand', name: 'MAKH AND MORE' },
      offers: {
        '@type': 'Offer',
        url: `${window.location.origin}/product/${product.slug}`,
        priceCurrency: 'INR',
        price: product.salePrice,
        availability:
          product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'ASR ENTERPRISES' },
      },
    };
    if (productReviews.length > 0) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: productReviews.length,
      };
    }
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${window.location.origin}/shop` },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.name,
          item: `${window.location.origin}/product/${product.slug}`,
        },
      ],
    };
    return [productSchema, breadcrumbSchema];
  }, [product, productReviews, avgRating]);

  useSEO({
    title: product?.seoTitle || product?.name || 'Product Not Found',
    description:
      product?.seoDescription ||
      product?.shortDescription ||
      'Authentic Mithila Makhana crafted by MAKH AND MORE.',
    image: product?.primaryImage,
    type: 'product',
    canonicalPath: product ? `/product/${product.slug}` : undefined,
    jsonLd,
  });

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-3xl font-extrabold text-[#0D3B2A]">Snack Not Found</h1>
        <p className="text-sm text-[#4A5E54]">
          The pack you are looking for may have moved or been updated.
        </p>
        <Link
          to="/shop"
          className="inline-block px-7 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold"
        >
          Browse All Snacks
        </Link>
      </div>
    );
  }

  const theme = getProductTheme(product);
  const galleryImages =
    product.gallery && product.gallery.length > 0 ? product.gallery : [product.primaryImage];
  const currentImg = galleryImages[selectedImageIdx] || product.primaryImage;
  const useCropOnCurrent = selectedImageIdx === 0 ? product.imageCrop : 'none';
  const wishlisted = isWishlisted(product.id);
  const discountPct =
    product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const isSingleFlavourJar = FLAVOUR_VARIANTS.some((f) => f.slug === product.slug);
  const isJumboPouch = JUMBO_WEIGHT_VARIANTS.some((w) => w.slug === product.slug);

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4);
  const recentlyViewedProducts = recentlyViewedIds
    .filter((id) => id !== product.id)
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4) as typeof products;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.shortDescription,
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Product link copied to clipboard!');
      }
    } catch {
      // user cancelled share
    }
  };

  const handlePinCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9]\d{5}$/.test(pinInput.trim())) {
      setPinResult({ serviceable: false, message: 'Enter a valid 6-digit Indian PIN code.' });
      return;
    }
    setCheckingPin(true);
    try {
      const res = await fetch(`/api/pincode/${pinInput.trim()}`);
      const data = await res.json();
      setPinResult(data);
    } catch {
      setPinResult({ serviceable: false, message: 'Could not verify PIN code right now.' });
    } finally {
      setCheckingPin(false);
    }
  };

  const handleBuyNow = () => {
    addToCart(product, qty, false);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in with Google to submit a verified review.', 'info');
      return;
    }
    if (revComment.trim().length < 5) {
      showToast('Please write at least a short comment (5+ characters).', 'error');
      return;
    }
    setSubmittingRev(true);
    try {
      const revId = `rev_${Date.now()}_${user.uid.slice(0, 6)}`;
      await setDoc(doc(db, 'reviews', revId), {
        productId: product.id,
        productName: product.name,
        userId: user.uid,
        authorName: (user.displayName || user.email?.split('@')[0] || 'Customer').slice(0, 80),
        rating: revRating,
        title: revTitle.trim().slice(0, 120),
        comment: revComment.trim().slice(0, 1200),
        verifiedPurchase: true,
        approved: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setRevTitle('');
      setRevComment('');
      showToast('Thank you! Your review has been submitted for moderation.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reviews', false);
      showToast(
        'Reviews require a verified account and seeded product catalog in Firestore.',
        'error'
      );
    } finally {
      setSubmittingRev(false);
    }
  };

  const accordionSections = [
    {
      id: 'description',
      title: 'About This Pack',
      content: (
        <div className="space-y-3 text-sm text-[#4A5E54] leading-relaxed">
          <p>{product.description}</p>
          <p className="text-xs font-semibold text-[#23884D]">
            Packed & Marketed by ASR ENTERPRISES, Vill. Jatuka, Darbhanga, Bihar – 847422, India.
          </p>
        </div>
      ),
    },
    {
      id: 'ingredients',
      title: 'Clean Ingredients',
      content: <p className="text-sm text-[#4A5E54] leading-relaxed">{product.ingredients}</p>,
    },
    {
      id: 'nutrition',
      title: 'Nutritional Snapshot',
      content: product.nutrition ? (
        <div className="space-y-3">
          {product.nutrition.servingSize && (
            <p className="text-xs font-bold text-[#23884D]">
              Per {product.nutrition.servingSize}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              ['Energy', product.nutrition.energy],
              ['Protein', product.nutrition.protein],
              ['Carbs', product.nutrition.carbohydrates],
              ['Fibre', product.nutrition.dietaryFiber],
              ['Total Fat', product.nutrition.totalFat],
            ]
              .filter(([, val]) => Boolean(val))
              .map(([label, val]) => (
                <div key={label} className="p-3 rounded-2xl bg-[#FFF9EE] border border-[#0D3B2A]/8">
                  <p className="text-[11px] font-bold text-[#4A5E54]">{label}</p>
                  <p className="text-sm font-extrabold text-[#0D3B2A] tabular-nums mt-0.5">{val}</p>
                </div>
              ))}
          </div>
          <p className="text-[11px] text-[#4A5E54]">
            Approximate values for natural agricultural produce; not medical advice.
          </p>
        </div>
      ) : (
        <p className="text-sm text-[#4A5E54]">
          Refer to the printed nutrition panel on the physical pouch/jar.
        </p>
      ),
    },
    {
      id: 'storage',
      title: 'Packaging, Shelf Life & Storage',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-3.5 rounded-2xl bg-[#EBF9C8]/50">
            <p className="text-xs font-extrabold text-[#0D3B2A] mb-0.5">Net Weight</p>
            <p className="text-[#4A5E54]">{product.weight}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FFF1B8]/60">
            <p className="text-xs font-extrabold text-[#0D3B2A] mb-0.5">Shelf Life</p>
            <p className="text-[#4A5E54]">{product.shelfLife}</p>
          </div>
          <div className="sm:col-span-2 p-3.5 rounded-2xl bg-[#FFF9EE]">
            <p className="text-xs font-extrabold text-[#0D3B2A] mb-0.5">Storage Tip</p>
            <p className="text-[#4A5E54]">{product.storage}</p>
          </div>
        </div>
      ),
    },
    ...(product.faq && product.faq.length > 0
      ? [
          {
            id: 'faq',
            title: `Product FAQs (${product.faq.length})`,
            content: (
              <div className="space-y-3">
                {product.faq.map((f) => (
                  <div key={f.question} className="p-3.5 rounded-2xl bg-[#FFF9EE]">
                    <p className="text-xs sm:text-sm font-extrabold text-[#0D3B2A] mb-1">
                      {f.question}
                    </p>
                    <p className="text-xs sm:text-sm text-[#4A5E54] leading-relaxed">{f.answer}</p>
                  </div>
                ))}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 lg:pb-16">
      {/* Desktop Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="hidden sm:flex flex-wrap items-center gap-1.5 text-xs font-bold text-[#4A5E54] mb-5"
      >
        <Link to="/" className="hover:text-[#0D3B2A]">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-[#0D3B2A]">
          Explore
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0D3B2A] truncate">{product.name}</span>
      </nav>

      {/* Main Immersive Product Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-12 items-start">
        {/* Left: Colourful Product Stage & Carousel */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
          <div
            onMouseEnter={() => setZoomActive(true)}
            onMouseLeave={() => setZoomActive(false)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setZoomOrigin({ x, y });
            }}
            className={`relative aspect-square rounded-[34px] ${theme.stageBg} border-2 border-white shadow-[0_18px_42px_rgba(13,59,42,0.12)] overflow-hidden cursor-zoom-in flex items-center justify-center p-6 sm:p-10`}
          >
            <OrbitCircles
              dotColor={theme.dotColor}
              ringColor={theme.ringColor}
              className="absolute inset-0 w-full h-full max-w-[440px] mx-auto opacity-85 animate-spin-slow"
            />
            <AnimatedSparkle className="w-7 h-7 absolute bottom-12 left-7 z-20" color="#F4B926" />

            {/* Top Floating App Action Bar inside Stage */}
            <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="w-10 h-10 rounded-full bg-white/92 backdrop-blur-xs text-[#0D3B2A] flex items-center justify-center shadow-md hover:bg-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {discountPct > 0 && (
                  <span className="px-3 py-1.5 rounded-full bg-[#F25C54] text-white text-xs font-extrabold shadow-sm tabular-nums">
                    Save {discountPct}%
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="w-10 h-10 rounded-full bg-white/92 backdrop-blur-xs text-[#0D3B2A] flex items-center justify-center shadow-md hover:bg-[#B7E843] transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer ${
                    wishlisted
                      ? 'bg-[#F25C54] text-white'
                      : 'bg-white/92 text-[#0D3B2A] hover:bg-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <div
              className="relative z-10 w-full h-full transition-transform duration-200 ease-out"
              style={
                zoomActive && useCropOnCurrent === 'none'
                  ? {
                      transform: 'scale(1.55)',
                      transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                    }
                  : undefined
              }
            >
              <SafeImage
                src={currentImg}
                alt={product.name}
                imageCrop={useCropOnCurrent}
                priority
                width={1000}
                className="w-full h-full object-contain drop-shadow-[0_22px_28px_rgba(13,59,42,0.2)]"
              />
            </div>

            {/* Bottom Carousel Pill Dots */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-xs shadow-sm">
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    aria-label={`View photo ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      selectedImageIdx === idx ? 'w-6 bg-[#0D3B2A]' : 'w-2 bg-[#0D3B2A]/25'
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="absolute bottom-4 right-4 z-20 bg-white/90 rounded-full px-3 py-1 text-[11px] font-bold text-[#0D3B2A] hidden sm:inline-flex items-center gap-1 pointer-events-none">
              <ZoomIn className="w-3.5 h-3.5" /> Zoom
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`aspect-square rounded-[20px] bg-white border-2 overflow-hidden p-2 cursor-pointer transition-all ${
                    selectedImageIdx === idx
                      ? 'border-[#0D3B2A] ring-4 ring-[#B7E843]/50 scale-[1.02]'
                      : 'border-[#0D3B2A]/10 hover:border-[#23884D]'
                  }`}
                >
                  <SafeImage
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    imageCrop={idx === 0 ? product.imageCrop : 'none'}
                    width={240}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: App Purchase Sheet & Selectors */}
        <div className="lg:col-span-6 space-y-5">
          {/* Title & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold ${theme.badgeBg} ${theme.badgeText}`}
              >
                {product.weight}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-xs font-extrabold">
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Sold Out'}
              </span>
              <span className="text-xs font-mono text-[#4A5E54] ml-auto">SKU: {product.sku}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B2A] leading-tight">
              {product.name}
            </h1>

            {productReviews.length > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1B8] text-xs font-extrabold text-[#0D3B2A]">
                <Star className="w-3.5 h-3.5 fill-[#F4B926] text-[#F4B926]" />
                <span className="tabular-nums">{avgRating.toFixed(1)}</span>
                <span className="text-[#4A5E54] font-semibold">
                  ({productReviews.length} verified)
                </span>
              </div>
            )}

            <p className="text-sm sm:text-base text-[#4A5E54] leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Interactive Flavour Selector (for 90g Flavoured Jars) */}
          {isSingleFlavourJar && (
            <div className="p-4 rounded-[26px] bg-white border border-[#0D3B2A]/10 space-y-2.5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#23884D]">
                Switch Flavour (90g Jar)
              </p>
              <div className="flex flex-wrap gap-2">
                {FLAVOUR_VARIANTS.map((fv) => {
                  const active = fv.slug === product.slug;
                  return (
                    <Link
                      key={fv.slug}
                      to={`/product/${fv.slug}`}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                        active
                          ? 'bg-[#0D3B2A] text-[#B7E843] shadow-md'
                          : 'bg-[#FFF9EE] text-[#0D3B2A] border border-[#0D3B2A]/10 hover:border-[#23884D]'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${fv.swatch}`} />
                      {fv.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Weight Selector (for Jumbo Makhana Pouches) */}
          {isJumboPouch && (
            <div className="p-4 rounded-[26px] bg-white border border-[#0D3B2A]/10 space-y-2.5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#23884D]">
                Select Pack Size
              </p>
              <div className="flex flex-wrap gap-2.5">
                {JUMBO_WEIGHT_VARIANTS.map((wv) => {
                  const active = wv.slug === product.slug;
                  return (
                    <Link
                      key={wv.slug}
                      to={`/product/${wv.slug}`}
                      className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all ${
                        active
                          ? 'bg-[#0D3B2A] text-[#B7E843] shadow-md'
                          : 'bg-[#FFF9EE] text-[#0D3B2A] border border-[#0D3B2A]/12 hover:border-[#23884D]'
                      }`}
                    >
                      {wv.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Colourful Pricing & Purchase Card */}
          <div className="p-5 sm:p-6 rounded-[30px] bg-white border-2 border-[#0D3B2A]/10 shadow-sm space-y-4">
            <div className="flex flex-wrap items-baseline gap-3 tabular-nums">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0D3B2A]">
                ₹{product.salePrice}
              </span>
              {product.price > product.salePrice && (
                <>
                  <span className="text-base text-[#4A5E54] line-through">₹{product.price}</span>
                  <span className="px-3 py-1 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-xs font-extrabold">
                    Save ₹{product.price - product.salePrice}
                  </span>
                </>
              )}
              <span className="text-[11px] font-semibold text-[#4A5E54] ml-auto">
                Incl. all taxes
              </span>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-[#EBF9C8] to-[#FFF1B8] px-4 py-3 text-xs font-bold text-[#0D3B2A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF7F3E] shrink-0" />
              <span>
                Free Shipping ₹{settings.freeShippingThreshold}+ ·{' '}
                {settings.bulkDiscountPercent || 20}% OFF automatically on ₹
                {settings.bulkDiscountThreshold || 599}+
              </span>
            </div>

            {/* Quantity + Primary Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <div className="inline-flex items-center justify-between sm:justify-center bg-[#FFF9EE] border border-[#0D3B2A]/12 rounded-full h-13 p-1.5">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0D3B2A] hover:bg-[#EBF9C8] cursor-pointer shadow-xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-11 text-center text-base font-extrabold tabular-nums text-[#0D3B2A]">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock || 20, q + 1))}
                  aria-label="Increase quantity"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0D3B2A] hover:bg-[#EBF9C8] cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                disabled={product.stock <= 0}
                onClick={() => addToCart(product, qty, true)}
                className="flex-1 h-13 px-6 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold inline-flex items-center justify-center gap-2 hover:bg-[#175C41] transition-colors cursor-pointer disabled:opacity-40 shadow-lg shadow-[#0D3B2A]/20"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Bag — ₹{product.salePrice * qty}
              </motion.button>
            </div>

            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={handleBuyNow}
              className="w-full h-13 rounded-full bg-[#B7E843] text-[#0D3B2A] text-sm font-extrabold hover:bg-[#cbf65e] transition-colors cursor-pointer disabled:opacity-40 shadow-sm"
            >
              Buy Now — Fast WhatsApp Checkout
            </button>
          </div>

          {/* Delivery PIN Code Checker */}
          <div className="p-5 rounded-[28px] bg-[#E2F6E7]/75 border border-[#23884D]/15 space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#0D3B2A]">
              <MapPin className="w-4 h-4 text-[#23884D]" />
              <span>Check Delivery to Your PIN Code</span>
            </div>
            <form onSubmit={handlePinCheck} className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN (e.g. 847422)"
                className="flex-1 h-11 px-4 rounded-full bg-white border border-[#0D3B2A]/12 text-sm font-semibold focus:outline-none focus:border-[#0D3B2A]"
              />
              <button
                type="submit"
                disabled={checkingPin}
                className="px-5 h-11 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold hover:bg-[#175C41] cursor-pointer"
              >
                {checkingPin ? 'Checking...' : 'Check'}
              </button>
            </form>
            {pinResult && (
              <div
                className={`text-xs font-semibold rounded-2xl p-3.5 ${
                  pinResult.serviceable
                    ? 'bg-white text-[#0D3B2A] border border-[#23884D]/25'
                    : 'bg-[#FFE4E1] text-[#C83B24]'
                }`}
              >
                {pinResult.serviceable ? (
                  <p>
                    <strong>Deliverable to {pinInput}</strong> ({pinResult.region}) · Arrives in{' '}
                    <strong>{pinResult.estimatedDays}</strong> · COD Available!
                  </p>
                ) : (
                  <p>{pinResult.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Highlights */}
          <div className="p-5 rounded-[28px] bg-white border border-[#0D3B2A]/10 space-y-3">
            <h2 className="font-display text-lg font-extrabold text-[#0D3B2A]">
              Why You’ll Love It
            </h2>
            <ul className="space-y-2">
              {product.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#12261E]">
                  <span className="w-5 h-5 rounded-full bg-[#EBF9C8] text-[#0D3B2A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#0D3B2A]/8 text-[11px] font-bold text-[#0D3B2A]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#23884D] shrink-0" />
                <span>Hygienic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#FF7F3E] shrink-0" />
                <span>Fresh Batch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#0D3B2A] shrink-0" />
                <span>Pan-India</span>
              </div>
            </div>
          </div>

          {/* Modern Expandable Accordion Sections */}
          <div className="space-y-2.5">
            {accordionSections.map((sec) => {
              const isOpen = openAccordion === sec.id;
              return (
                <div
                  key={sec.id}
                  className="bg-white rounded-[24px] border border-[#0D3B2A]/10 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(isOpen ? null : sec.id)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left font-display text-base font-extrabold text-[#0D3B2A] cursor-pointer hover:bg-[#FFF9EE]/60 transition-colors"
                  >
                    <span>{sec.title}</span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isOpen ? 'bg-[#0D3B2A] text-[#B7E843] rotate-180' : 'bg-[#FFF9EE] text-[#0D3B2A]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1">{sec.content}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verified Customer Reviews & Submission */}
      <section className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
            Customer Reviews ({productReviews.length})
          </h2>
          {productReviews.length === 0 ? (
            <div className="bg-white border border-[#0D3B2A]/10 rounded-[28px] p-6 text-sm text-[#4A5E54]">
              No published reviews for this pack yet. Be the first verified snacker to share your
              tasting notes!
            </div>
          ) : (
            productReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-[#0D3B2A]/10 rounded-[26px] p-5 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? 'fill-[#F4B926] text-[#F4B926]' : 'text-[#0D3B2A]/15'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-[10px] font-extrabold">
                    Verified Review
                  </span>
                </div>
                {rev.title && (
                  <h3 className="font-display font-bold text-sm text-[#0D3B2A]">{rev.title}</h3>
                )}
                <p className="text-sm text-[#4A5E54] leading-relaxed">{rev.comment}</p>
                <p className="text-xs font-extrabold text-[#0D3B2A] pt-1">— {rev.authorName}</p>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-5 bg-[#FFF1B8]/70 border-2 border-white rounded-[30px] p-6 space-y-4 shadow-sm">
          <h3 className="font-display text-xl font-extrabold text-[#0D3B2A]">Write a Review</h3>
          {!user ? (
            <div className="space-y-3">
              <p className="text-xs text-[#4A5E54] leading-relaxed font-medium">
                Sign in with your verified Google account to publish an authentic product review.
              </p>
              <button
                type="button"
                onClick={() => signInWithGoogle().catch(() => showToast('Sign-in cancelled.', 'info'))}
                className="px-5 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold hover:bg-[#175C41] cursor-pointer"
              >
                Sign in with Google to Review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-3.5">
              <div>
                <span className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                  Your Rating
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRevRating(n)}
                      className="p-1 cursor-pointer"
                      aria-label={`Rate ${n} stars`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          n <= revRating ? 'fill-[#F4B926] text-[#F4B926]' : 'text-[#0D3B2A]/20'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="rev-title" className="block text-xs font-extrabold text-[#0D3B2A] mb-1">
                  Headline (optional)
                </label>
                <input
                  id="rev-title"
                  type="text"
                  maxLength={120}
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  placeholder="Super crisp and fresh!"
                  className="w-full h-11 px-4 rounded-2xl bg-white border border-[#0D3B2A]/12 text-sm"
                />
              </div>
              <div>
                <label htmlFor="rev-body" className="block text-xs font-extrabold text-[#0D3B2A] mb-1">
                  Your Review
                </label>
                <textarea
                  id="rev-body"
                  required
                  rows={3}
                  maxLength={1200}
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="Share how you enjoyed the crunch and flavour..."
                  className="w-full p-3.5 rounded-2xl bg-white border border-[#0D3B2A]/12 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submittingRev}
                className="w-full h-12 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold hover:bg-[#175C41] cursor-pointer disabled:opacity-50"
              >
                {submittingRev ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Related Products */}
      <section className="mt-14">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A] mb-6">
          Pair It With These Crunchies
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Recently Viewed Products */}
      {recentlyViewedProducts.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-extrabold text-[#0D3B2A] mb-6">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {recentlyViewedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Native-Style Sticky Mobile Add to Cart / Buy Now Dock (Cleanly Replaces Mobile Nav on PDP) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/96 backdrop-blur-xl border-t border-[#0D3B2A]/10 rounded-t-[26px] px-4 py-3 flex items-center gap-2.5 shadow-[0_-10px_30px_rgba(13,59,42,0.14)]">
        <div className="tabular-nums shrink-0 pr-1">
          <div className="text-lg font-extrabold text-[#0D3B2A] leading-none">
            ₹{product.salePrice * qty}
          </div>
          <div className="text-[10px] font-bold text-[#4A5E54] mt-0.5">{product.weight}</div>
        </div>
        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={() => addToCart(product, qty, true)}
          className="flex-1 h-12 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-xs font-extrabold cursor-pointer disabled:opacity-40"
        >
          Add to Bag
        </button>
        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={handleBuyNow}
          className="flex-1 h-12 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold cursor-pointer shadow-md disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
