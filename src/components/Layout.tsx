import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUp,
  ChevronDown,
  Compass,
  Facebook,
  Heart,
  Home,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  AnimatedDotCluster,
  AnimatedSparkle,
  BrandLogo,
  getProductTheme,
  OrganicBlob,
  SafeImage,
  WavySectionDivider,
} from './BrandVisuals';
import { MiniCartDrawer } from './MiniCartDrawer';
import { QuickViewModal } from './QuickViewModal';

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    products,
    categories,
    settings,
    cartCount,
    wishlistIds,
    setMiniCartOpen,
    toasts,
    dismissToast,
    showToast,
  } = useStore();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submittingNews, setSubmittingNews] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.flavour || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleFooterNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubmittingNews(true);
    try {
      const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await setDoc(doc(db, 'subscribers', id), {
        email,
        subscribedAt: serverTimestamp(),
      });
      setNewsletterEmail('');
      showToast('Welcome to the MAKH AND MORE Crunch Club!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'subscribers', false);
      showToast('Unable to subscribe right now. Please try again.', 'error');
    } finally {
      setSubmittingNews(false);
    }
  };

  const whatsappDigits = (settings.whatsappNumber || '+919135986786').replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
    'Hello MAKH AND MORE! I would like assistance with your Mithila Makhana products.'
  )}`;

  const announcements =
    settings.announcementMessages && settings.announcementMessages.length > 0
      ? settings.announcementMessages
      : [
          'Free Shipping on orders above ₹299',
          'Shop for ₹599 or More & Get 20% OFF automatically',
          '100% Natural & Farm-Fresh Mithila Makhana from Bihar',
        ];

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isProductDetailRoute = location.pathname.startsWith('/product/');
  const isCheckoutRoute = location.pathname === '/checkout';

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#FFF9EE] text-[#12261E]">
        {children}
        <ToastStack toasts={toasts} dismissToast={dismissToast} />
      </div>
    );
  }

  const navTabActive = (key: 'home' | 'explore' | 'wishlist' | 'account') => {
    if (key === 'home') return location.pathname === '/';
    if (key === 'explore')
      return location.pathname.startsWith('/shop') || location.pathname.startsWith('/category');
    if (key === 'wishlist') return location.pathname === '/wishlist';
    if (key === 'account')
      return (
        location.pathname === '/account' ||
        location.pathname === '/track-order' ||
        location.pathname === '/login' ||
        location.pathname === '/register'
      );
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9EE] text-[#12261E] pb-20 lg:pb-0 relative overflow-x-clip">
      {/* Vibrant Announcement Ribbon */}
      <div className="bg-[#0D3B2A] text-[#FFF9EE] overflow-hidden h-7 flex items-center relative">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-[11px] font-semibold tracking-wide">
          {[...announcements, ...announcements, ...announcements].map((msg, idx) => (
            <span key={`${idx}-${msg}`} className="inline-flex items-center gap-8">
              <span className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7E843]" aria-hidden="true" />
                {msg}
              </span>
              <span className="text-[#F4B926]" aria-hidden="true">
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Compact Floating App Header */}
      <header className="sticky top-1.5 z-40 px-2.5 sm:px-6 lg:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto pointer-events-auto">
          <div className="h-12 sm:h-14 lg:h-15 px-2.5 sm:px-4 rounded-full bg-white/94 backdrop-blur-xl border border-[#0D3B2A]/10 shadow-[0_6px_22px_rgba(13,59,42,0.09)] flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Menu + Brand Logo */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#0D3B2A] bg-[#EBF9C8]/75 hover:bg-[#B7E843] transition-colors cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
              <Link to="/" className="flex items-center shrink-0" aria-label="MAKH AND MORE Home">
                <BrandLogo variant="light-bg" className="h-7 sm:h-8 lg:h-9" />
              </Link>
            </div>

            {/* Center: Desktop Pill Nav */}
            <nav
              className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-[#12261E]"
              aria-label="Primary navigation"
            >
              {[
                { label: 'Home', to: '/', match: location.pathname === '/' },
                { label: 'Shop', to: '/shop', match: location.pathname === '/shop' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3.5 py-2 rounded-full whitespace-nowrap shrink-0 transition-all ${
                    item.match
                      ? 'bg-[#0D3B2A] text-[#B7E843] shadow-sm'
                      : 'hover:bg-[#EBF9C8]/70 text-[#12261E]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Categories Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setMegaMenuOpen((o) => !o)}
                  className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-full whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    location.pathname.startsWith('/category')
                      ? 'bg-[#0D3B2A] text-[#B7E843]'
                      : 'hover:bg-[#EBF9C8]/70 text-[#12261E]'
                  }`}
                  aria-expanded={megaMenuOpen}
                >
                  Flavours & Packs <ChevronDown className="w-3.5 h-3.5" />
                </button>

                <AnimatePresence>
                  {megaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[680px]"
                    >
                      <div className="bg-white rounded-[28px] border border-[#0D3B2A]/12 shadow-2xl p-5 grid grid-cols-5 gap-3 bg-dots-light">
                        {categories.slice(0, 5).map((cat, idx) => {
                          const tints = [
                            'from-[#EBF9C8] to-[#D6F5C4]',
                            'from-[#FFE7D4] to-[#FFD5BA]',
                            'from-[#DFF8E6] to-[#C2F0D4]',
                            'from-[#FFF1B8] to-[#FFE08A]',
                            'from-[#E2F1FF] to-[#CCE5FF]',
                          ];
                          return (
                            <Link
                              key={cat.id}
                              to={`/category/${cat.slug}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="group flex flex-col items-center text-center p-2.5 rounded-2xl hover:bg-[#FFF9EE] transition-all"
                            >
                              <div
                                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                                  tints[idx % tints.length]
                                } overflow-hidden mb-2.5 p-1.5 shadow-xs group-hover:scale-105 transition-transform duration-300`}
                              >
                                <SafeImage
                                  src={cat.image}
                                  alt={cat.name}
                                  width={200}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="text-xs font-bold text-[#0D3B2A] leading-tight">
                                {cat.name}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {[
                { label: 'Our Story', to: '/our-story', match: location.pathname === '/our-story' },
                { label: 'Journal', to: '/blog', match: location.pathname.startsWith('/blog') },
                { label: 'Contact', to: '/contact', match: location.pathname === '/contact' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3.5 py-2 rounded-full whitespace-nowrap shrink-0 transition-all ${
                    item.match
                      ? 'bg-[#0D3B2A] text-[#B7E843] shadow-sm'
                      : 'hover:bg-[#EBF9C8]/70 text-[#12261E]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right: Interactive App Icons + Animated Cart Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search products"
                className="w-10 h-10 rounded-full bg-[#FFF9EE] hover:bg-[#FFF1B8] border border-[#0D3B2A]/8 flex items-center justify-center text-[#0D3B2A] transition-colors cursor-pointer"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative w-10 h-10 rounded-full bg-[#FFE4E1]/60 hover:bg-[#FFE4E1] border border-[#F25C54]/15 flex items-center justify-center text-[#F25C54] transition-colors"
              >
                <Heart className={`w-[18px] h-[18px] ${wishlistIds.length > 0 ? 'fill-current' : ''}`} />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F25C54] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums shadow-sm">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              <Link
                to={user ? '/account' : '/track-order'}
                aria-label={user ? 'My Account' : 'Track Order & Account'}
                className="hidden sm:flex w-10 h-10 rounded-full bg-[#E2F6E7] hover:bg-[#B7E843] border border-[#23884D]/15 items-center justify-center text-[#0D3B2A] transition-colors"
                title={user ? 'My Account' : 'Account & Orders'}
              >
                <User className="w-[18px] h-[18px]" />
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden md:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full bg-[#FFF1B8] text-xs font-bold text-[#0D3B2A] hover:bg-[#F4B926] transition-colors whitespace-nowrap shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </Link>
              )}

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setMiniCartOpen(true)}
                aria-label={`Open shopping cart with ${cartCount} items`}
                className="inline-flex items-center gap-2 h-10 pl-3.5 pr-2 rounded-full bg-[#0D3B2A] text-white text-xs font-bold hover:bg-[#175C41] transition-colors whitespace-nowrap shrink-0 shadow-md shadow-[#0D3B2A]/20 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#B7E843]" />
                <span className="hidden sm:inline">Cart</span>
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                  className="min-w-[24px] h-6 px-1.5 rounded-full bg-[#B7E843] text-[#0D3B2A] text-[11px] font-extrabold flex items-center justify-center tabular-nums"
                >
                  {cartCount}
                </motion.span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Wavy Transition + Colourful Forest Footer */}
      <div className="mt-6 sm:mt-10">
        <WavySectionDivider fill="#0D3B2A" />
        <footer className="bg-[#0D3B2A] text-[#FFF9EE] relative overflow-hidden bg-dots-light">
          <OrganicBlob
            fill="#23884D"
            opacity={0.28}
            className="w-72 h-72 absolute -top-24 -right-24 pointer-events-none"
          />
          <OrganicBlob
            fill="#F4B926"
            opacity={0.14}
            className="w-64 h-64 absolute -bottom-24 -left-20 pointer-events-none"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 pb-7 border-b border-white/15">
              {/* Brand Column */}
              <div className="lg:col-span-4 space-y-3">
                <BrandLogo variant="dark-bg" className="h-9" />
                <p className="text-sm text-[#FFF9EE]/85 leading-relaxed max-w-sm">
                  <strong className="text-[#B7E843]">Healthy Snacking Redefined.</strong> Authentic,
                  farm-fresh Mithila Makhana and slow-roasted flavoured fox nuts crafted with care
                  by <strong>ASR ENTERPRISES</strong> in Darbhanga, Bihar.
                </p>
                <div className="flex items-center gap-2.5 pt-1">
                  {settings.socialInstagram && (
                    <a
                      href={settings.socialInstagram}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="MAKH AND MORE Instagram"
                      className="w-10 h-10 rounded-full bg-white/12 hover:bg-[#B7E843] hover:text-[#0D3B2A] flex items-center justify-center transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {settings.socialFacebook && (
                    <a
                      href={settings.socialFacebook}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="MAKH AND MORE Facebook"
                      className="w-10 h-10 rounded-full bg-white/12 hover:bg-[#F4B926] hover:text-[#0D3B2A] flex items-center justify-center transition-colors"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {settings.socialTwitter && (
                    <a
                      href={settings.socialTwitter}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="MAKH AND MORE X"
                      className="w-10 h-10 rounded-full bg-white/12 hover:bg-[#FF7F3E] hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                    >
                      X
                    </a>
                  )}
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="MAKH AND MORE WhatsApp"
                    className="w-10 h-10 rounded-full bg-[#25D366] text-white hover:scale-105 flex items-center justify-center transition-transform shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Shop Links */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-display text-base font-bold text-[#B7E843]">Shop Flavours</h3>
                <ul className="space-y-2.5 text-sm text-[#FFF9EE]/85">
                  <li>
                    <Link to="/shop" className="hover:text-[#B7E843] transition-colors">
                      All Makhana
                    </Link>
                  </li>
                  <li>
                    <Link to="/category/makhana" className="hover:text-[#B7E843] transition-colors">
                      Jumbo Makhana
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/category/roasted-makhana"
                      className="hover:text-[#B7E843] transition-colors"
                    >
                      Roasted Makhana
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/category/flavoured-makhana"
                      className="hover:text-[#B7E843] transition-colors"
                    >
                      Flavoured Makhana
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/category/makhana-combo"
                      className="hover:text-[#B7E843] transition-colors"
                    >
                      4-Flavour Combo
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/category/dry-fruits"
                      className="hover:text-[#B7E843] transition-colors"
                    >
                      Dry Fruits
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Explore & Policies */}
              <div className="lg:col-span-3 grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-display text-base font-bold text-[#F4B926]">Explore</h3>
                  <ul className="space-y-2.5 text-sm text-[#FFF9EE]/85">
                    <li>
                      <Link to="/our-story" className="hover:text-[#F4B926]">
                        Our Story
                      </Link>
                    </li>
                    <li>
                      <Link to="/about-us" className="hover:text-[#F4B926]">
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link to="/blog" className="hover:text-[#F4B926]">
                        Snack Journal
                      </Link>
                    </li>
                    <li>
                      <Link to="/track-order" className="hover:text-[#F4B926]">
                        Track Order
                      </Link>
                    </li>
                    <li>
                      <Link to="/faq" className="hover:text-[#F4B926]">
                        FAQs
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact" className="hover:text-[#F4B926]">
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-display text-base font-bold text-[#F4B926]">Policies</h3>
                  <ul className="space-y-2.5 text-sm text-[#FFF9EE]/85">
                    <li>
                      <Link to="/shipping-policy" className="hover:text-[#F4B926]">
                        Shipping Policy
                      </Link>
                    </li>
                    <li>
                      <Link to="/refund-returns" className="hover:text-[#F4B926]">
                        Refund & Returns
                      </Link>
                    </li>
                    <li>
                      <Link to="/privacy-policy" className="hover:text-[#F4B926]">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link to="/terms-and-conditions" className="hover:text-[#F4B926]">
                        Terms & Conditions
                      </Link>
                    </li>
                    <li>
                      <Link to="/disclaimer" className="hover:text-[#F4B926]">
                        Disclaimer
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin" className="hover:text-[#B7E843]">
                        Admin Console
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Support & Newsletter Card */}
              <div className="lg:col-span-3 space-y-4">
                <h3 className="font-display text-base font-bold text-[#B7E843]">
                  Darbhanga Support
                </h3>
                <ul className="space-y-2.5 text-xs text-[#FFF9EE]/85 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#F4B926] shrink-0 mt-0.5" />
                    <span>{settings.address}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#B7E843] shrink-0" />
                    <a
                      href={`tel:${settings.supportPhone.replace(/\s/g, '')}`}
                      className="hover:text-[#B7E843] font-semibold"
                    >
                      {settings.supportPhone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#FF7F3E] shrink-0" />
                    <a href={`mailto:${settings.supportEmail}`} className="hover:text-[#B7E843]">
                      {settings.supportEmail}
                    </a>
                  </li>
                </ul>

                <form
                  onSubmit={handleFooterNewsletter}
                  className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2.5"
                >
                  <label
                    htmlFor="footer-news"
                    className="flex items-center gap-1.5 text-xs font-bold text-[#F4B926]"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Fresh Harvest Drops
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="footer-news"
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#0D3B2A]/80 border border-white/20 text-xs text-white placeholder:text-white/50 focus:outline-none focus:border-[#B7E843]"
                    />
                    <button
                      type="submit"
                      disabled={submittingNews}
                      className="px-4 py-2 rounded-xl bg-[#B7E843] text-[#0D3B2A] text-xs font-extrabold hover:bg-[#c8f35c] transition-colors cursor-pointer shrink-0"
                    >
                      Join
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#FFF9EE]/70">
              <p>
                © {new Date().getFullYear()} MAKH AND MORE · Owned & Operated by ASR ENTERPRISES,
                Darbhanga, Bihar.
              </p>
              <div className="flex items-center gap-5">
                <Link to="/account" className="hover:text-[#B7E843]">
                  My Account
                </Link>
                <Link to="/wishlist" className="hover:text-[#B7E843]">
                  Wishlist
                </Link>
                <a href="/sitemap.xml" className="hover:text-[#B7E843]">
                  Sitemap
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Native-Style Floating Mobile Bottom Navigation Dock (Hidden on PDP & Checkout where sticky CTA lives) */}
      {!isProductDetailRoute && !isCheckoutRoute && (
        <nav
          className="lg:hidden fixed bottom-3 inset-x-3 z-40 rounded-[26px] bg-[#0D3B2A]/96 backdrop-blur-xl text-white h-[66px] px-2 grid grid-cols-5 items-center shadow-[0_14px_34px_rgba(13,59,42,0.38)] border border-white/12"
          aria-label="Mobile bottom navigation"
        >
          {[
            { key: 'home' as const, to: '/', label: 'Home', icon: Home },
            { key: 'explore' as const, to: '/shop', label: 'Explore', icon: Compass },
            {
              key: 'wishlist' as const,
              to: '/wishlist',
              label: 'Wishlist',
              icon: Heart,
              badge: wishlistIds.length,
              badgeBg: 'bg-[#F25C54] text-white',
            },
            {
              key: 'account' as const,
              to: user ? '/account' : '/track-order',
              label: user ? 'Account' : 'Orders',
              icon: User,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = navTabActive(tab.key);
            return (
              <Link
                key={tab.key}
                to={tab.to}
                className="relative flex flex-col items-center justify-center h-12 rounded-2xl transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="mobileNavActivePill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-x-1 inset-y-0.5 rounded-2xl bg-[#B7E843]"
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors ${
                    active ? 'text-[#0D3B2A]' : 'text-white/75'
                  }`}
                />
                <span
                  className={`text-[10px] font-bold relative z-10 mt-0.5 leading-none ${
                    active ? 'text-[#0D3B2A]' : 'text-white/75'
                  }`}
                >
                  {tab.label}
                </span>
                {tab.badge && tab.badge > 0 ? (
                  <span
                    className={`absolute top-0.5 right-2.5 z-20 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-extrabold flex items-center justify-center tabular-nums ${tab.badgeBg}`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMiniCartOpen(true)}
            className="relative flex flex-col items-center justify-center h-12 rounded-2xl text-white/85 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-[#B7E843]" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F4B926] text-[#0D3B2A] text-[10px] font-extrabold flex items-center justify-center tabular-nums shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-0.5 leading-none text-[#B7E843]">Cart</span>
          </button>
        </nav>
      )}

      {/* Floating WhatsApp Quick Chat & Scroll-to-Top */}
      <div
        className={`fixed right-3.5 z-30 flex flex-col items-end gap-2.5 ${
          isProductDetailRoute || isCheckoutRoute ? 'bottom-24 lg:bottom-6' : 'bottom-22 lg:bottom-6'
        }`}
      >
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top"
              className="w-11 h-11 rounded-full bg-white border-2 border-[#0D3B2A]/12 text-[#0D3B2A] shadow-lg flex items-center justify-center hover:bg-[#B7E843] transition-colors cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp +91 9135 986 786"
          className="inline-flex items-center gap-2 h-11 px-3.5 sm:px-4 rounded-full bg-[#25D366] text-white text-xs font-bold shadow-lg shadow-[#25D366]/30 hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline">WhatsApp Us</span>
        </a>
      </div>

      {/* Vibrant Mobile Slide-In App Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#0D3B2A]/55 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-[84vw] max-w-xs bg-[#FFF9EE] h-full flex flex-col shadow-2xl rounded-r-[32px] overflow-hidden"
            >
              <div className="px-5 py-4 bg-gradient-to-r from-[#0D3B2A] to-[#175C41] flex items-center justify-between relative overflow-hidden">
                <AnimatedDotCluster
                  className="w-16 h-16 absolute -right-4 -top-4 opacity-40"
                  color="#B7E843"
                />
                <BrandLogo variant="dark-bg" className="h-8 relative z-10" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center relative z-10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div className="space-y-1">
                  {[
                    { label: 'Home', to: '/' },
                    { label: 'Shop All Makhana', to: '/shop' },
                    { label: 'Our Mithila Story', to: '/our-story' },
                    { label: 'About Us', to: '/about-us' },
                    { label: 'Snack Journal & Blog', to: '/blog' },
                    { label: 'Track Your Order', to: '/track-order' },
                    { label: 'Contact & Support', to: '/contact' },
                    { label: 'FAQs', to: '/faq' },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-3 px-4 rounded-2xl text-sm font-bold transition-colors ${
                        location.pathname === item.to
                          ? 'bg-[#0D3B2A] text-[#B7E843]'
                          : 'text-[#12261E] hover:bg-[#EBF9C8]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#0D3B2A]/10">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#23884D] px-3 mb-2">
                    Shop by Category
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-2xl bg-white border border-[#0D3B2A]/8 text-xs font-bold text-[#0D3B2A] hover:bg-[#FFF1B8] transition-colors text-center"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#0D3B2A]/10 space-y-2.5">
                  <Link
                    to={user ? '/account' : '/login'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-3 px-4 rounded-2xl bg-[#0D3B2A] text-[#B7E843] text-center text-sm font-extrabold"
                  >
                    {user ? 'My Account' : 'Sign In / My Account'}
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 px-4 rounded-2xl bg-[#FFF1B8] text-[#0D3B2A] text-center text-xs font-extrabold"
                  >
                    Admin Panel (PIN)
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Vibrant App-Style Quick Search Sheet */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 px-3 sm:px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-[#0D3B2A]/55 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96 }}
              className="relative z-10 w-full max-w-2xl bg-white rounded-[28px] border border-[#0D3B2A]/12 shadow-2xl overflow-hidden"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchOpen(false);
                  navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                }}
                className="flex items-center px-4 py-1 bg-[#FFF9EE] border-b border-[#0D3B2A]/10"
              >
                <div className="w-9 h-9 rounded-full bg-[#B7E843] text-[#0D3B2A] flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Craving Pudina, Peri Peri, Cheese, or Jumbo Makhana?"
                  className="flex-1 h-14 px-3.5 text-sm font-medium text-[#12261E] bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="w-9 h-9 rounded-full bg-white text-[#12261E] flex items-center justify-center hover:bg-[#FFE4E1] hover:text-[#F25C54] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>

              <div className="p-5 max-h-[70vh] overflow-y-auto">
                {searchQuery.trim() === '' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AnimatedSparkle className="w-4 h-4" color="#F4B926" />
                      <p className="text-xs font-extrabold uppercase tracking-wider text-[#23884D]">
                        Trending Flavours
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { term: 'Pudina', bg: 'bg-[#DFF8E6] text-[#0D3B2A]' },
                        { term: 'Peri Peri', bg: 'bg-[#FFE3D8] text-[#B8321B]' },
                        { term: 'Cheese', bg: 'bg-[#FFF1B8] text-[#9A5306]' },
                        { term: 'Himalayan Salt', bg: 'bg-[#E2F1FF] text-[#18528C]' },
                        { term: 'Jumbo Makhana', bg: 'bg-[#EBF9C8] text-[#0D3B2A]' },
                        { term: '4 Flavours Combo', bg: 'bg-[#0D3B2A] text-[#B7E843]' },
                      ].map((chip) => (
                        <button
                          key={chip.term}
                          type="button"
                          onClick={() => setSearchQuery(chip.term)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-transform hover:scale-105 cursor-pointer ${chip.bg}`}
                        >
                          {chip.term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-[#4A5E54] py-8 text-center font-medium">
                    No snacks matched "{searchQuery}". Try Pudina, Cheese, or Jumbo!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((p) => {
                      const theme = getProductTheme(p);
                      return (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-[#FFF9EE] transition-colors"
                        >
                          <div
                            className={`w-14 h-14 rounded-2xl ${theme.stageBg} overflow-hidden shrink-0 p-1.5`}
                          >
                            <SafeImage
                              src={p.primaryImage}
                              alt={p.name}
                              imageCrop={p.imageCrop}
                              width={140}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#12261E] truncate">{p.name}</p>
                            <p className="text-xs text-[#4A5E54]">{p.weight}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-[#EBF9C8] text-sm font-extrabold text-[#0D3B2A] tabular-nums">
                            ₹{p.salePrice}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MiniCartDrawer />
      <QuickViewModal />
      <ToastStack toasts={toasts} dismissToast={dismissToast} />
    </div>
  );
}

function ToastStack({
  toasts,
  dismissToast,
}: {
  toasts: { id: string; text: string; type: 'success' | 'info' | 'error' }[];
  dismissToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-20 right-3 sm:right-5 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100vw-1.5rem)] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94 }}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-[#F25C54] text-white border-[#d6433b]'
                : toast.type === 'info'
                ? 'bg-[#FFF1B8] text-[#0D3B2A] border-[#F4B926]'
                : 'bg-[#0D3B2A] text-[#B7E843] border-[#23884D]'
            }`}
          >
            <span>{toast.text}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="opacity-80 hover:opacity-100 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
