import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Gift,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getProductTheme, SafeImage } from './BrandVisuals';

export function MiniCartDrawer() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    totalDiscount,
    shippingFee,
    cartTotal,
    freeShippingRemaining,
    bulkDiscountRemaining,
    settings,
    miniCartOpen,
    setMiniCartOpen,
    updateCartQty,
    removeFromCart,
  } = useStore();
  const navigate = useNavigate();

  const freeShippingProgress = Math.min(
    100,
    Math.round((cartSubtotal / Math.max(1, settings.freeShippingThreshold)) * 100)
  );
  const bulkProgress = Math.min(
    100,
    Math.round((cartSubtotal / Math.max(1, settings.bulkDiscountThreshold || 599)) * 100)
  );

  return (
    <AnimatePresence>
      {miniCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMiniCartOpen(false)}
            className="fixed inset-0 bg-[#0D3B2A]/55 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative z-10 w-full max-w-md bg-[#FFF9EE] h-full flex flex-col shadow-2xl sm:rounded-l-[32px] overflow-hidden"
            aria-label="Shopping cart drawer"
          >
            {/* Colourful Forest Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#0D3B2A] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#B7E843] text-[#0D3B2A] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-extrabold leading-tight">
                    Snack Bag ({cartCount})
                  </h2>
                  <p className="text-[11px] text-[#B7E843] font-semibold">
                    Fresh from Mithila Farms
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMiniCartOpen(false)}
                aria-label="Close cart"
                className="w-10 h-10 rounded-full bg-white/12 flex items-center justify-center text-white hover:bg-[#F25C54] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gamified Free Shipping & 20% Bulk Off Meters */}
            {cart.length > 0 && (
              <div className="px-5 py-3.5 bg-gradient-to-r from-[#EBF9C8] via-[#E2F6E7] to-[#FFF1B8] border-b border-[#0D3B2A]/10 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#0D3B2A] mb-1">
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#23884D] shrink-0" />
                      {freeShippingRemaining > 0 ? (
                        <span>
                          Add <strong className="tabular-nums">₹{freeShippingRemaining}</strong> for{' '}
                          <span className="text-[#23884D]">FREE Delivery</span>
                        </span>
                      ) : (
                        <span className="text-[#156C3D]">FREE Shipping Unlocked!</span>
                      )}
                    </span>
                    <span className="tabular-nums text-[11px]">{freeShippingProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/80 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      className="h-full bg-gradient-to-r from-[#23884D] to-[#B7E843] rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-[#0D3B2A] mb-1">
                    <span className="inline-flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#FF7F3E] shrink-0" />
                      {bulkDiscountRemaining > 0 ? (
                        <span>
                          Add <strong className="tabular-nums">₹{bulkDiscountRemaining}</strong> for{' '}
                          <strong>{settings.bulkDiscountPercent || 20}% OFF</strong>
                        </span>
                      ) : (
                        <span className="text-[#C83B24]">
                          {settings.bulkDiscountPercent || 20}% OFF Applied Automatically!
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums">{bulkProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/80 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bulkProgress}%` }}
                      className="h-full bg-gradient-to-r from-[#F4B926] to-[#FF7F3E] rounded-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#EBF9C8] to-[#FFF1B8] flex items-center justify-center mb-4 shadow-sm">
                    <ShoppingBag className="w-9 h-9 text-[#0D3B2A]" />
                  </div>
                  <h3 className="font-display text-xl font-extrabold text-[#0D3B2A] mb-1.5">
                    Your snack bag is empty
                  </h3>
                  <p className="text-sm text-[#4A5E54] max-w-xs mb-6">
                    Fill it with crunchy Pudina, spicy Peri Peri, cheesy swirls, or jumbo Mithila
                    makhana pouches.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMiniCartOpen(false);
                      navigate('/shop');
                    }}
                    className="px-7 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold hover:bg-[#175C41] transition-colors cursor-pointer shadow-md"
                  >
                    Explore Flavours
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const theme = getProductTheme({
                    slug: item.slug,
                    flavour: item.name,
                    category: item.slug,
                  });
                  return (
                    <motion.div
                      layout
                      key={item.productId}
                      className="flex gap-3 bg-white p-3 rounded-[24px] border border-[#0D3B2A]/8 shadow-xs"
                    >
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={() => setMiniCartOpen(false)}
                        className={`w-20 h-20 aspect-square rounded-[16px] ${theme.stageBg} overflow-hidden shrink-0 p-1.5 flex items-center justify-center`}
                      >
                        <SafeImage
                          src={item.image}
                          alt={item.name}
                          imageCrop={item.imageCrop}
                          width={200}
                          className="w-full h-full object-contain"
                        />
                      </Link>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={() => setMiniCartOpen(false)}
                            className="font-display text-sm font-bold text-[#0D3B2A] hover:text-[#23884D] line-clamp-2 leading-snug"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            aria-label={`Remove ${item.name}`}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#4A5E54] hover:bg-[#FFE4E1] hover:text-[#F25C54] transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] font-semibold text-[#4A5E54] mt-0.5">
                          {item.weight}
                        </span>

                        <div className="mt-auto pt-2 flex items-center justify-between">
                          <div className="inline-flex items-center bg-[#FFF9EE] border border-[#0D3B2A]/10 rounded-full p-0.5">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#0D3B2A] hover:bg-[#EBF9C8] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-extrabold tabular-nums text-[#0D3B2A]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#0D3B2A] hover:bg-[#EBF9C8] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-sm font-extrabold text-[#0D3B2A] tabular-nums">
                            ₹{item.salePrice * item.quantity}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Sticky Totals & Checkout CTA */}
            {cart.length > 0 && (
              <div className="px-5 py-4 bg-white border-t border-[#0D3B2A]/10 rounded-t-[28px] shadow-[0_-8px_24px_rgba(13,59,42,0.06)] space-y-3">
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-[#4A5E54]">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-bold text-[#12261E]">₹{cartSubtotal}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-[#23884D] font-bold">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Savings Applied
                      </span>
                      <span className="tabular-nums">−₹{totalDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#4A5E54]">
                    <span>Shipping</span>
                    <span
                      className={`tabular-nums font-bold ${
                        shippingFee === 0 ? 'text-[#23884D]' : 'text-[#12261E]'
                      }`}
                    >
                      {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#0D3B2A]/8 text-base font-extrabold text-[#0D3B2A]">
                    <span>Grand Total</span>
                    <span className="tabular-nums text-lg">₹{cartTotal}</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-1">
                  <Link
                    to="/cart"
                    onClick={() => setMiniCartOpen(false)}
                    className="col-span-2 h-12 rounded-full border-2 border-[#0D3B2A]/15 text-[#0D3B2A] text-xs font-extrabold flex items-center justify-center hover:bg-[#FFF9EE] transition-colors"
                  >
                    Full Cart
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMiniCartOpen(false);
                      navigate('/checkout');
                    }}
                    className="col-span-3 h-12 px-4 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 hover:bg-[#175C41] transition-colors cursor-pointer shadow-lg shadow-[#0D3B2A]/20"
                  >
                    Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
