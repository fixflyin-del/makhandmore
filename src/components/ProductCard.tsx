import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Eye, Heart, Plus, Sparkles, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { getProductTheme, OrbitCircles, SafeImage } from './BrandVisuals';

export type ProductCardVariant = 'standard' | 'featured' | 'horizontal';

export function ProductCard({
  product,
  variant = 'standard',
}: {
  product: Product;
  variant?: ProductCardVariant;
}) {
  const { addToCart, toggleWishlist, isWishlisted, setQuickViewProduct } = useStore();
  const [justAdded, setJustAdded] = useState(false);

  const theme = getProductTheme(product);
  const wishlisted = isWishlisted(product.id);
  const discountPct =
    product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, true);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  // Compact Horizontal Thumb-Friendly App Card
  if (variant === 'horizontal') {
    return (
      <motion.article
        whileHover={{ y: -2 }}
        className="group bg-white rounded-[26px] p-3 border border-[#0D3B2A]/8 shadow-[0_6px_22px_rgba(13,59,42,0.06)] hover:shadow-[0_12px_30px_rgba(13,59,42,0.12)] transition-all flex items-center gap-3.5"
      >
        <Link
          to={`/product/${product.slug}`}
          className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-[20px] ${theme.stageBg} overflow-hidden shrink-0 flex items-center justify-center p-2`}
        >
          <OrbitCircles
            dotColor={theme.dotColor}
            ringColor={theme.ringColor}
            className="absolute inset-0 w-full h-full opacity-75"
          />
          <div className="relative z-10 w-full h-full transition-transform duration-500 group-hover:scale-108">
            <SafeImage
              src={product.primaryImage}
              alt={product.name}
              imageCrop={product.imageCrop}
              width={260}
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
          {discountPct > 0 && (
            <span className="absolute top-1.5 left-1.5 z-20 px-1.5 py-0.5 rounded-full bg-[#F25C54] text-white text-[9px] font-extrabold tabular-nums">
              -{discountPct}%
            </span>
          )}
        </Link>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${theme.accentText}`}>
              {product.flavour || product.weight}
            </span>
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                wishlisted
                  ? 'bg-[#FFE4E1] text-[#F25C54]'
                  : 'bg-[#FFF9EE] text-[#4A5E54] hover:text-[#F25C54]'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="font-display text-sm sm:text-base font-bold text-[#0D3B2A] leading-snug line-clamp-2 pr-1"
          >
            {product.name}
          </Link>

          <div className="flex items-center justify-between gap-2 mt-2.5">
            <div className="flex items-baseline gap-1.5 tabular-nums">
              <span className="text-base sm:text-lg font-extrabold text-[#0D3B2A]">
                ₹{product.salePrice}
              </span>
              {product.price > product.salePrice && (
                <span className="text-xs text-[#4A5E54] line-through">₹{product.price}</span>
              )}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              disabled={product.stock <= 0}
              onClick={handleQuickAdd}
              className={`h-9 px-3.5 rounded-full text-xs font-extrabold inline-flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40 ${
                justAdded
                  ? 'bg-[#23884D] text-white'
                  : 'bg-[#0D3B2A] text-[#B7E843] hover:bg-[#175C41]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.article>
    );
  }

  // Large Asymmetrical Spotlight Featured Card
  if (variant === 'featured') {
    return (
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={`group relative rounded-[32px] ${theme.stageBg} border border-[#0D3B2A]/10 p-5 sm:p-7 flex flex-col justify-between overflow-hidden shadow-[0_12px_36px_rgba(13,59,42,0.1)] h-full`}
      >
        <div className="flex items-center justify-between gap-2 relative z-20 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold ${theme.badgeBg} ${theme.badgeText}`}
            >
              <Sparkles className="w-3 h-3" /> Fan Favourite
            </span>
            {discountPct > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-[#F25C54] text-white text-[11px] font-extrabold tabular-nums">
                Save {discountPct}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleQuickView}
              aria-label={`Quick view ${product.name}`}
              className="w-10 h-10 rounded-full bg-white/90 text-[#0D3B2A] hover:bg-white flex items-center justify-center shadow-sm cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors cursor-pointer ${
                wishlisted ? 'bg-[#F25C54] text-white' : 'bg-white/90 text-[#0D3B2A] hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="relative flex-1 min-h-[210px] sm:min-h-[250px] flex items-center justify-center my-2"
        >
          <OrbitCircles
            dotColor={theme.dotColor}
            ringColor={theme.ringColor}
            className="absolute inset-0 w-full h-full max-w-[270px] mx-auto animate-spin-slow"
          />
          <div className="relative z-10 w-52 h-52 sm:w-64 sm:h-64 transition-transform duration-500 ease-out group-hover:scale-108">
            <SafeImage
              src={product.primaryImage}
              alt={product.name}
              imageCrop={product.imageCrop}
              width={640}
              className="w-full h-full object-contain drop-shadow-[0_18px_22px_rgba(13,59,42,0.18)]"
            />
          </div>
        </Link>

        <div className="relative z-20 bg-white/94 backdrop-blur-md rounded-[24px] p-4 sm:p-5 border border-white shadow-sm mt-3">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#4A5E54] mb-1">
            <span>{product.weight}</span>
            {product.reviewCount && product.reviewCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[#0D3B2A] tabular-nums">
                <Star className="w-3.5 h-3.5 fill-[#F4B926] text-[#F4B926]" />
                {(product.rating || 0).toFixed(1)} ({product.reviewCount})
              </span>
            ) : (
              <span className="text-[#23884D]">100% Roasted</span>
            )}
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="font-display text-lg sm:text-xl font-extrabold text-[#0D3B2A] leading-snug line-clamp-2 block mb-1.5"
          >
            {product.name}
          </Link>
          <p className="text-xs text-[#4A5E54] line-clamp-2 mb-3.5">{product.shortDescription}</p>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="text-xl sm:text-2xl font-extrabold text-[#0D3B2A]">
                ₹{product.salePrice}
              </span>
              {product.price > product.salePrice && (
                <span className="text-xs text-[#4A5E54] line-through">₹{product.price}</span>
              )}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              disabled={product.stock <= 0}
              onClick={handleQuickAdd}
              className={`h-11 px-5 rounded-full text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-40 ${
                justAdded
                  ? 'bg-[#23884D] text-white'
                  : 'bg-[#0D3B2A] text-[#B7E843] hover:bg-[#175C41]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" /> Added!
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" /> Quick Add
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.article>
    );
  }

  // Standard Colourful Modern App Card
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white rounded-[28px] p-2.5 sm:p-3 border border-[#0D3B2A]/8 shadow-[0_8px_26px_rgba(13,59,42,0.06)] hover:shadow-[0_14px_34px_rgba(13,59,42,0.12)] transition-all flex flex-col h-full"
    >
      {/* Colourful Product Stage */}
      <Link
        to={`/product/${product.slug}`}
        className={`relative aspect-[4/4.3] rounded-[22px] ${theme.stageBg} overflow-hidden flex items-center justify-center p-4`}
      >
        <OrbitCircles
          dotColor={theme.dotColor}
          ringColor={theme.ringColor}
          className="absolute inset-0 w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-500"
        />

        <div className="relative z-10 w-full h-full transition-transform duration-500 ease-out group-hover:scale-108">
          <SafeImage
            src={product.primaryImage}
            alt={product.name}
            imageCrop={product.imageCrop}
            width={520}
            className="w-full h-full object-contain drop-shadow-[0_12px_16px_rgba(13,59,42,0.15)]"
          />
        </div>

        {/* Floating Discount Tag */}
        {discountPct > 0 && (
          <span className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-full bg-[#F25C54] text-white text-[10px] font-extrabold tracking-wide shadow-sm tabular-nums">
            -{discountPct}%
          </span>
        )}

        {/* Wishlist & Quick View Buttons */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${
              wishlisted
                ? 'bg-[#F25C54] text-white scale-105'
                : 'bg-white/90 text-[#0D3B2A] hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleQuickView}
            aria-label={`Quick view ${product.name}`}
            className="w-9 h-9 rounded-full bg-white/90 text-[#0D3B2A] hover:bg-[#B7E843] flex items-center justify-center shadow-sm transition-all cursor-pointer sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Flavour / Weight Pill inside Stage */}
        <span className="absolute bottom-2.5 left-2.5 z-20 px-2.5 py-0.5 rounded-full bg-white/88 backdrop-blur-xs text-[10px] font-bold text-[#0D3B2A]">
          {product.weight}
        </span>

        {product.stock <= 0 && (
          <div className="absolute inset-0 z-30 bg-[#FFF9EE]/75 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-xs font-extrabold text-[#0D3B2A] bg-white border border-[#0D3B2A]/15 px-3.5 py-1.5 rounded-full shadow-sm">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="px-1.5 pt-3 pb-1 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={`text-[11px] font-extrabold truncate ${theme.accentText}`}>
            {product.flavour || 'Mithila Harvest'}
          </span>
          {product.reviewCount && product.reviewCount > 0 ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#0D3B2A] tabular-nums shrink-0">
              <Star className="w-3 h-3 fill-[#F4B926] text-[#F4B926]" />
              {(product.rating || 0).toFixed(1)}
            </span>
          ) : null}
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="font-display text-sm sm:text-base font-bold text-[#0D3B2A] group-hover:text-[#23884D] leading-snug line-clamp-2 mb-3 transition-colors"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-[#0D3B2A]/6">
          <div className="flex flex-col leading-none tabular-nums">
            <span className="text-base sm:text-lg font-extrabold text-[#0D3B2A]">
              ₹{product.salePrice}
            </span>
            {product.price > product.salePrice && (
              <span className="text-[11px] text-[#4A5E54] line-through mt-0.5">
                ₹{product.price}
              </span>
            )}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            disabled={product.stock <= 0}
            onClick={handleQuickAdd}
            className={`h-10 px-3.5 sm:px-4 rounded-full text-xs font-extrabold inline-flex items-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              justAdded
                ? 'bg-[#23884D] text-white'
                : 'bg-[#0D3B2A] text-[#B7E843] hover:bg-[#175C41]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
