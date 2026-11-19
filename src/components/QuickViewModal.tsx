import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AnimatedSparkle, getProductTheme, OrbitCircles, SafeImage } from './BrandVisuals';

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useStore();
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  const product = quickViewProduct;

  const handleClose = () => {
    setQty(1);
    setQuickViewProduct(null);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, qty, false);
    handleClose();
    navigate('/checkout');
  };

  const theme = product ? getProductTheme(product) : null;
  const discountPct =
    product && product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  return (
    <AnimatePresence>
      {product && theme && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#0D3B2A]/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, y: 64 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 64 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-t-[32px] sm:rounded-[32px] border border-[#0D3B2A]/10 shadow-2xl grid grid-cols-1 md:grid-cols-2"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
          >
            {/* Mobile Drag Handle */}
            <div className="md:hidden absolute top-2.5 left-1/2 -translate-x-1/2 z-30 w-11 h-1.5 rounded-full bg-[#0D3B2A]/25" />

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close quick view"
              className="absolute top-3.5 right-3.5 z-30 w-10 h-10 rounded-full bg-white/95 border border-[#0D3B2A]/10 flex items-center justify-center text-[#0D3B2A] hover:bg-[#FFE4E1] hover:text-[#F25C54] transition-colors cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Colourful Product Stage */}
            <div
              className={`${theme.stageBg} relative flex items-center justify-center p-5 pt-8 md:p-6 overflow-hidden`}
            >
              <OrbitCircles
                dotColor={theme.dotColor}
                ringColor={theme.ringColor}
                className="absolute inset-0 w-full h-full max-w-[240px] mx-auto animate-spin-slow"
              />
              <AnimatedSparkle
                className="w-5 h-5 absolute top-6 left-6"
                color="#F4B926"
              />
              {discountPct > 0 && (
                <span className="absolute bottom-3 left-3 z-20 px-2.5 py-0.5 rounded-full bg-[#F25C54] text-white text-[11px] font-extrabold tabular-nums shadow-sm">
                  Save {discountPct}%
                </span>
              )}
              <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 aspect-square animate-float">
                <SafeImage
                  src={product.primaryImage}
                  alt={product.name}
                  imageCrop={product.imageCrop}
                  width={640}
                  className="w-full h-full object-contain drop-shadow-[0_14px_20px_rgba(13,59,42,0.18)]"
                />
              </div>
            </div>

            {/* Product Details & Touch Actions */}
            <div className="p-4 sm:p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${theme.badgeBg} ${theme.badgeText}`}
                >
                  {product.weight}
                </span>
                <span className="text-xs font-bold text-[#23884D] inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {product.stock > 0 ? 'Fresh Batch In Stock' : 'Out of Stock'}
                </span>
              </div>

              <h2 className="font-display text-2xl font-extrabold text-[#0D3B2A] leading-tight mb-2">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-2.5 mb-3.5 tabular-nums">
                <span className="text-2xl font-extrabold text-[#0D3B2A]">₹{product.salePrice}</span>
                {product.price > product.salePrice && (
                  <>
                    <span className="text-sm text-[#4A5E54] line-through">₹{product.price}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#EBF9C8] text-[11px] font-extrabold text-[#0D3B2A]">
                      Save ₹{product.price - product.salePrice}
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-[#4A5E54] leading-relaxed mb-4">
                {product.shortDescription}
              </p>

              <ul className="space-y-1.5 mb-5">
                {product.highlights.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs font-medium text-[#12261E]">
                    <span className="w-4 h-4 rounded-full bg-[#EBF9C8] text-[#0D3B2A] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="inline-flex items-center bg-[#FFF9EE] border border-[#0D3B2A]/12 rounded-full p-1">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-[#EBF9C8] text-[#0D3B2A] cursor-pointer shadow-xs"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-9 text-center text-sm font-extrabold tabular-nums text-[#0D3B2A]">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(product.stock || 10, q + 1))}
                      className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-[#EBF9C8] text-[#0D3B2A] cursor-pointer shadow-xs"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={product.stock <= 0}
                    onClick={() => {
                      addToCart(product, qty, true);
                      handleClose();
                    }}
                    className="flex-1 h-11 px-4 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold inline-flex items-center justify-center gap-2 hover:bg-[#175C41] transition-colors cursor-pointer disabled:opacity-40 shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                </div>

                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={handleBuyNow}
                  className="w-full h-11 rounded-full bg-[#B7E843] text-[#0D3B2A] text-sm font-extrabold hover:bg-[#c8f35c] transition-colors cursor-pointer disabled:opacity-40"
                >
                  Buy Now — Instant Checkout
                </button>

                <Link
                  to={`/product/${product.slug}`}
                  onClick={handleClose}
                  className="inline-flex items-center justify-center w-full gap-1.5 text-xs font-bold text-[#23884D] hover:text-[#0D3B2A] pt-1"
                >
                  View Full Nutrition & Reviews <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
