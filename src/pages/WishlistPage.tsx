import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Plus, Trash2 } from 'lucide-react';
import {
  AnimatedSparkle,
  getProductTheme,
  OrbitCircles,
  SafeImage,
} from '../components/BrandVisuals';
import { useStore } from '../context/StoreContext';
import { useSEO } from '../lib/seo';

export function WishlistPage() {
  const { products, wishlistIds, toggleWishlist, addToCart } = useStore();

  useSEO({
    title: 'Your Wishlist | MAKH AND MORE',
    description: 'View your saved Mithila Makhana flavours and move them straight to your cart.',
    canonicalPath: '/wishlist',
    noindex: true,
  });

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="py-3.5 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFE4E1] text-[#F25C54] text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
              <Heart className="w-3 h-3 fill-current" /> Saved Favourites
            </span>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
                Your Crunch Wishlist
              </h1>
              <AnimatedSparkle className="w-4 h-4" color="#F25C54" />
            </div>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-extrabold text-[#23884D] hover:text-[#0D3B2A] inline-flex items-center gap-1.5"
          >
            Explore All Snacks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {savedProducts.length === 0 ? (
          <div className="rounded-[26px] bg-gradient-to-br from-[#FFE4E1] via-[#FFF9EE] to-[#FFF1B8] border-2 border-white p-6 sm:p-10 text-center max-w-xl mx-auto shadow-sm bg-dots-coral">
            <div className="w-16 h-16 rounded-full bg-[#F25C54] text-white flex items-center justify-center mx-auto mb-3.5 shadow-md">
              <Heart className="w-7 h-7" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0D3B2A] mb-1.5">
              No saved snacks yet!
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5E54] mb-5">
              Tap the heart icon on any MAKH AND MORE jar or jumbo pouch to bookmark it for later —
              no login required.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs sm:text-sm font-extrabold hover:bg-[#175C41] shadow-md"
            >
              Discover Mithila Makhana
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {savedProducts.map((product) => {
              const theme = getProductTheme(product);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-[22px] p-2 sm:p-2.5 border border-[#0D3B2A]/10 flex flex-col shadow-xs hover:shadow-md transition-shadow"
                >
                  <Link
                    to={`/product/${product.slug}`}
                    className={`relative aspect-square rounded-[22px] ${theme.stageBg} p-4 flex items-center justify-center overflow-hidden`}
                  >
                    <OrbitCircles
                      dotColor={theme.dotColor}
                      ringColor={theme.ringColor}
                      className="absolute inset-0 w-full h-full opacity-75"
                    />
                    <div className="relative z-10 w-full h-full">
                      <SafeImage
                        src={product.primaryImage}
                        alt={product.name}
                        imageCrop={product.imageCrop}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product.id);
                      }}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="absolute top-2.5 right-2.5 z-20 w-9 h-9 rounded-full bg-white text-[#F25C54] hover:bg-[#F25C54] hover:text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Link>
                  <div className="px-1.5 pt-3 pb-1 flex-1 flex flex-col">
                    <Link
                      to={`/product/${product.slug}`}
                      className="font-display text-sm sm:text-base font-extrabold text-[#0D3B2A] hover:text-[#23884D] line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[11px] font-bold text-[#4A5E54] mt-0.5">{product.weight}</p>
                    <div className="mt-2 flex items-baseline gap-2 tabular-nums">
                      <span className="text-lg font-extrabold text-[#0D3B2A]">
                        ₹{product.salePrice}
                      </span>
                      {product.price > product.salePrice && (
                        <span className="text-xs text-[#4A5E54] line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(product, 1, true)}
                      disabled={product.stock <= 0}
                      className="mt-auto pt-3 w-full"
                    >
                      <span className="w-full h-10 px-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold hover:bg-[#175C41] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer">
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        Move to Bag
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
