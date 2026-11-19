import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Gift,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import {
  AnimatedSparkle,
  CurvedGuideArrow,
  getProductTheme,
  SafeImage,
} from '../components/BrandVisuals';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { useSEO } from '../lib/seo';

export function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartSubtotal,
    autoBulkDiscount,
    appliedCoupon,
    couponDiscount,
    totalDiscount,
    shippingFee,
    cartTotal,
    freeShippingRemaining,
    bulkDiscountRemaining,
    settings,
    products,
    updateCartQty,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  useSEO({
    title: 'Shopping Cart | MAKH AND MORE',
    description:
      'Review your authentic Mithila Makhana selection. Free shipping across India on orders above ₹299 and automatic 20% off on orders above ₹599.',
    canonicalPath: '/cart',
    noindex: true,
  });

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCouponCode(couponInput);
    setCouponFeedback(res);
    if (res.ok) {
      setCouponInput('');
    }
  };

  const suggestedProducts = products
    .filter((p) => p.published && !cart.some((c) => c.productId === p.id))
    .slice(0, 4);

  const freeShippingProgress = Math.min(
    100,
    Math.round((cartSubtotal / Math.max(1, settings.freeShippingThreshold)) * 100)
  );
  const bulkProgress = Math.min(
    100,
    Math.round((cartSubtotal / Math.max(1, settings.bulkDiscountThreshold || 599)) * 100)
  );

  return (
    <div className="py-3.5 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Colourful App Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
              <ShoppingBag className="w-3 h-3" /> Snack Bag
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A] tracking-tight">
              Your Mithila Crunch Bag
            </h1>
            <p className="text-xs text-[#4A5E54] mt-0.5 font-medium">
              {cartCount === 0
                ? 'Your bag is empty — pick some crunchy flavours!'
                : `${cartCount} ${cartCount === 1 ? 'pack' : 'packs'} freshly queued from Darbhanga.`}
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-extrabold text-[#23884D] hover:text-[#0D3B2A] inline-flex items-center gap-1.5"
          >
            Add More Flavours <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="relative overflow-hidden rounded-[26px] bg-[#EBF9C8] bg-gradient-to-br from-[#EBF9C8] via-[#FFF9EE] to-[#FFF1B8] border-2 border-white p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-md">
            <div className="absolute inset-0 bg-dots-forest pointer-events-none" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-[#0D3B2A] text-[#B7E843] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShoppingBag className="w-9 h-9" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A] mb-2">
              Nothing in your snack bag yet!
            </h2>
            <p className="text-sm text-[#4A5E54] max-w-md mx-auto mb-7">
              Discover our farm-fresh Mithila Jumbo Makhana pouches and slow-roasted flavoured jars
              in Pudina, Peri Peri, Cheese, and Himalayan Salt.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/shop"
                className="px-7 py-3.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold hover:bg-[#175C41] transition-colors inline-flex items-center gap-2 shadow-md"
              >
                Explore All Snacks <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/category/makhana-combo"
                className="px-7 py-3.5 rounded-full bg-white text-[#0D3B2A] border-2 border-[#0D3B2A]/12 text-sm font-extrabold hover:bg-[#FFF1B8] transition-colors"
              >
                Shop 4-Flavour Combo
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Left Column: Meters + Flavour-Tinted Item Cards */}
            <div className="lg:col-span-8 space-y-3.5">
              {/* Gamified Shipping & Bulk Meters */}
              <div className="rounded-[22px] bg-gradient-to-r from-[#EBF9C8] via-[#E2F6E7] to-[#FFF1B8] border-2 border-white p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-xs">
                <div>
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#23884D]" />
                      {freeShippingRemaining === 0
                        ? 'FREE Pan-India Shipping Unlocked!'
                        : `Add ₹${freeShippingRemaining} for FREE Shipping`}
                    </span>
                    <span className="tabular-nums">{freeShippingProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/85 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      className="h-full bg-gradient-to-r from-[#23884D] to-[#B7E843] rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-[#FF7F3E]" />
                      {bulkDiscountRemaining === 0
                        ? `${settings.bulkDiscountPercent || 20}% Bulk Discount Active!`
                        : `Add ₹${bulkDiscountRemaining} for ${settings.bulkDiscountPercent || 20}% OFF`}
                    </span>
                    <span className="tabular-nums">{bulkProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/85 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bulkProgress}%` }}
                      className="h-full bg-gradient-to-r from-[#F4B926] to-[#FF7F3E] rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const lineTotal = item.salePrice * item.quantity;
                  const lineMrp = item.price * item.quantity;
                  const theme = getProductTheme({
                    slug: item.slug,
                    flavour: item.name,
                    category: item.slug,
                  });
                  return (
                    <div
                      key={item.productId}
                      className="bg-white rounded-[22px] border border-[#0D3B2A]/10 p-3.5 sm:p-4 flex gap-3.5 items-center shadow-xs"
                    >
                      <Link
                        to={`/product/${item.slug}`}
                        className={`w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-[18px] ${theme.stageBg} overflow-hidden shrink-0 flex items-center justify-center p-2`}
                      >
                        <SafeImage
                          src={item.image}
                          alt={item.name}
                          imageCrop={item.imageCrop}
                          className="w-full h-full object-contain"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              to={`/product/${item.slug}`}
                              className="font-display text-lg font-extrabold text-[#0D3B2A] hover:text-[#23884D] transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            <p className="text-xs font-bold text-[#4A5E54] mt-0.5">{item.weight}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            aria-label={`Remove ${item.name}`}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[#4A5E54] hover:text-[#F25C54] hover:bg-[#FFE4E1] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                          <div className="inline-flex items-center rounded-full bg-[#FFF9EE] border border-[#0D3B2A]/12 p-1">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0D3B2A] hover:bg-[#EBF9C8] transition-colors cursor-pointer shadow-xs"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-extrabold tabular-nums text-[#0D3B2A]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                              aria-label="Increase quantity"
                              disabled={item.quantity >= item.stock}
                              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0D3B2A] hover:bg-[#EBF9C8] transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right tabular-nums">
                            <div className="text-xl font-extrabold text-[#0D3B2A]">
                              ₹{lineTotal.toLocaleString('en-IN')}
                            </div>
                            {lineMrp > lineTotal && (
                              <div className="text-xs">
                                <span className="line-through text-[#4A5E54] mr-1.5">
                                  ₹{lineMrp.toLocaleString('en-IN')}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-[#EBF9C8] text-[#0D3B2A] font-extrabold text-[10px]">
                                  Save ₹{(lineMrp - lineTotal).toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Vibrant Summary & Coupon */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
              <div className="bg-white rounded-[30px] border-2 border-[#0D3B2A]/10 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-extrabold text-[#0D3B2A]">
                    Order Summary
                  </h2>
                  <AnimatedSparkle className="w-5 h-5" color="#F4B926" />
                </div>

                {/* Coupon Code Form */}
                <form onSubmit={handleCouponSubmit} className="mb-5">
                  <label
                    htmlFor="cart-coupon"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#23884D] mb-2"
                  >
                    Promo / Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-[#23884D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="cart-coupon"
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="MAKH20 or MITHILA10"
                        className="w-full h-11 pl-10 pr-3 text-xs font-bold rounded-full border border-[#0D3B2A]/15 bg-[#FFF9EE] focus:outline-none focus:border-[#0D3B2A]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 h-11 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold hover:bg-[#175C41] transition-colors shrink-0 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponFeedback && (
                    <p
                      className={`text-xs mt-2 font-bold ${
                        couponFeedback.ok ? 'text-[#23884D]' : 'text-[#F25C54]'
                      }`}
                    >
                      {couponFeedback.message}
                    </p>
                  )}
                  {appliedCoupon && (
                    <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-xs font-extrabold">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#23884D]" />
                        {appliedCoupon.code} applied
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[#0D3B2A]/60 hover:text-[#F25C54] cursor-pointer"
                        aria-label="Remove coupon"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </form>

                {/* Breakdown */}
                <div className="space-y-3 text-sm border-t border-[#0D3B2A]/8 pt-4">
                  <div className="flex justify-between text-[#4A5E54]">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="font-bold text-[#12261E] tabular-nums">
                      ₹{cartSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-[#23884D] font-extrabold">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {couponDiscount >= autoBulkDiscount && appliedCoupon
                          ? `Coupon (${appliedCoupon.code})`
                          : `Bulk Savings (${settings.bulkDiscountPercent || 20}% OFF)`}
                      </span>
                      <span className="tabular-nums">-₹{totalDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#4A5E54]">
                    <span>Shipping</span>
                    <span className="font-bold tabular-nums">
                      {shippingFee === 0 ? (
                        <span className="text-[#23884D] font-extrabold">FREE</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>

                  <div className="border-t border-[#0D3B2A]/10 pt-3 flex justify-between items-baseline">
                    <span className="font-extrabold text-[#0D3B2A] text-base">Total Payable</span>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-[#0D3B2A] tabular-nums">
                        ₹{cartTotal.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] font-semibold text-[#4A5E54]">Incl. all taxes</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="mt-6 w-full h-13 px-6 rounded-full bg-[#0D3B2A] text-[#B7E843] font-extrabold text-sm hover:bg-[#175C41] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#0D3B2A]/20 cursor-pointer"
                >
                  Proceed to Fast Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] font-semibold text-center text-[#4A5E54] mt-3">
                  Instant Direct WhatsApp Login available at checkout — zero passwords!
                </p>

                <div className="mt-5 pt-4 border-t border-[#0D3B2A]/8 grid grid-cols-2 gap-3 text-[11px] font-bold text-[#0D3B2A]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#23884D] shrink-0" />
                    <span>100% Mithila Origin</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#FF7F3E] shrink-0" />
                    <span>ASR Enterprises Fresh</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Recommended Additions */}
        {suggestedProducts.length > 0 && (
          <section className="mt-7 pt-6 border-t border-[#0D3B2A]/10">
            <div className="flex items-end justify-between mb-3.5">
              <div className="flex items-center gap-3">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FFF1B8] text-[#0D3B2A] text-[10px] font-extrabold uppercase tracking-wider">
                    Complete Your Shelf
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0D3B2A] mt-1">
                    Add Another Flavour?
                  </h2>
                </div>
                <CurvedGuideArrow
                  direction="right"
                  color="#FF7F3E"
                  className="w-16 h-8 hidden sm:block"
                />
              </div>
              <Link
                to="/shop"
                className="text-xs sm:text-sm font-extrabold text-[#23884D] hover:text-[#0D3B2A] hidden sm:inline-flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {suggestedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
