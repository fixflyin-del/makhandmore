import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  INITIAL_BANNERS,
  INITIAL_BLOGS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
} from '../data/seedData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  BlogArticle,
  CartItem,
  Category,
  Coupon,
  HeroBanner,
  Product,
  Review,
  StoreSettings,
} from '../types';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextValue {
  products: Product[];
  categories: Category[];
  blogs: BlogArticle[];
  banners: HeroBanner[];
  coupons: Coupon[];
  reviews: Review[];
  settings: StoreSettings;
  loadingStore: boolean;
  firestoreSeeded: boolean;
  refreshStore: () => Promise<void>;
  seedFirestoreDatabase: () => Promise<void>;

  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  autoBulkDiscount: number;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  totalDiscount: number;
  shippingFee: number;
  cartTotal: number;
  freeShippingRemaining: number;
  bulkDiscountRemaining: number;
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist & Recently Viewed
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  recentlyViewedIds: string[];
  recordRecentlyViewed: (productId: string) => void;

  // Drawers, Modals & Toasts
  miniCartOpen: boolean;
  setMiniCartOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  toasts: ToastMessage[];
  showToast: (text: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = 'makh_cart_v1';
const WISHLIST_KEY = 'makh_wishlist_v1';
const RECENT_KEY = 'makh_recent_v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [blogs, setBlogs] = useState<BlogArticle[]>(INITIAL_BLOGS);
  const [banners, setBanners] = useState<HeroBanner[]>(INITIAL_BANNERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [loadingStore, setLoadingStore] = useState(true);
  const [firestoreSeeded, setFirestoreSeeded] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyViewedIds));
    } catch {
      // ignore
    }
  }, [recentlyViewedIds]);

  const refreshStore = useCallback(async () => {
    setLoadingStore(true);
    try {
      const [prodSnap, catSnap, blogSnap, bannerSnap, couponSnap, reviewSnap, settingsSnap] =
        await Promise.allSettled([
          getDocs(query(collection(db, 'products'), where('published', '==', true))),
          getDocs(query(collection(db, 'categories'), where('active', '==', true))),
          getDocs(query(collection(db, 'blogs'), where('published', '==', true))),
          getDocs(query(collection(db, 'banners'), where('active', '==', true))),
          getDocs(query(collection(db, 'coupons'), where('active', '==', true))),
          getDocs(query(collection(db, 'reviews'), where('approved', '==', true))),
          getDoc(doc(db, 'settings', 'store')),
        ]);

      let hasFirestoreProducts = false;

      if (prodSnap.status === 'fulfilled' && !prodSnap.value.empty) {
        const loaded = prodSnap.value.docs.map((d) => {
          const data = d.data() as Product;
          const fallback = INITIAL_PRODUCTS.find((p) => p.id === d.id || p.slug === data.slug);
          return {
            ...fallback,
            ...data,
            id: d.id,
          } as Product;
        });
        setProducts(loaded);
        hasFirestoreProducts = true;
      }

      if (catSnap.status === 'fulfilled' && !catSnap.value.empty) {
        const loaded = catSnap.value.docs
          .map((d) => ({ ...(d.data() as Category), id: d.id }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(loaded);
      }

      if (blogSnap.status === 'fulfilled' && !blogSnap.value.empty) {
        const loaded = blogSnap.value.docs.map((d) => ({ ...(d.data() as BlogArticle), id: d.id }));
        setBlogs(loaded);
      }

      if (bannerSnap.status === 'fulfilled' && !bannerSnap.value.empty) {
        const loaded = bannerSnap.value.docs
          .map((d) => ({ ...(d.data() as HeroBanner), id: d.id }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setBanners(loaded);
      }

      if (couponSnap.status === 'fulfilled' && !couponSnap.value.empty) {
        setCoupons(couponSnap.value.docs.map((d) => ({ ...(d.data() as Coupon), id: d.id })));
      }

      if (reviewSnap.status === 'fulfilled') {
        setReviews(reviewSnap.value.docs.map((d) => ({ ...(d.data() as Review), id: d.id })));
      }

      if (settingsSnap.status === 'fulfilled' && settingsSnap.value.exists()) {
        const loadedSettings = settingsSnap.value.data() as Partial<StoreSettings>;
        setSettings({
          ...INITIAL_SETTINGS,
          ...loadedSettings,
          policies: {
            ...INITIAL_SETTINGS.policies,
            ...(loadedSettings.policies || {}),
          },
        });
      }

      setFirestoreSeeded(hasFirestoreProducts);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products', false);
    } finally {
      setLoadingStore(false);
    }
  }, []);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  const seedFirestoreDatabase = useCallback(async () => {
    // Admin-only batch seeding matching exact Firestore schema validation rules
    for (const p of INITIAL_PRODUCTS) {
      const { imageCrop: _omit, ...rest } = p;
      await setDoc(doc(db, 'products', p.id), {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const c of INITIAL_CATEGORIES) {
      await setDoc(doc(db, 'categories', c.id), {
        ...c,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const b of INITIAL_BLOGS) {
      await setDoc(doc(db, 'blogs', b.id), {
        ...b,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const bn of INITIAL_BANNERS) {
      await setDoc(doc(db, 'banners', bn.id), {
        ...bn,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const cp of INITIAL_COUPONS) {
      await setDoc(doc(db, 'coupons', cp.id), {
        ...cp,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await setDoc(doc(db, 'settings', 'store'), {
      ...INITIAL_SETTINGS,
      updatedAt: serverTimestamp(),
    });
    await refreshStore();
    showToast('Firestore seeded with all MAKH AND MORE catalog, blogs, banners & settings.');
  }, [refreshStore, showToast]);

  // Cart Actions
  const addToCart = useCallback(
    (product: Product, quantity = 1, openDrawer = true) => {
      if (product.stock <= 0) {
        showToast('This product is currently out of stock.', 'error');
        return;
      }
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          const nextQty = Math.min(product.stock, existing.quantity + quantity);
          return prev.map((item) =>
            item.productId === product.id ? { ...item, quantity: nextQty } : item
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            weight: product.weight,
            price: product.price,
            salePrice: product.salePrice,
            image: product.primaryImage,
            imageCrop: product.imageCrop,
            quantity: Math.min(product.stock, quantity),
            stock: product.stock,
          },
        ];
      });
      showToast(`Added ${product.name} to cart`);
      if (openDrawer) {
        setMiniCartOpen(true);
      }
    },
    [showToast]
  );

  const updateCartQty = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(item.stock || 99, quantity) }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      showToast('Item removed from cart', 'info');
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.salePrice * item.quantity, 0),
    [cart]
  );

  // Automatic 20% off when subtotal >= bulkDiscountThreshold (₹599) unless overridden by a higher coupon
  const autoBulkDiscount = useMemo(() => {
    const threshold = settings.bulkDiscountThreshold || 599;
    const pct = settings.bulkDiscountPercent || 20;
    if (cartSubtotal >= threshold && pct > 0) {
      return Math.round((cartSubtotal * pct) / 100);
    }
    return 0;
  }, [cartSubtotal, settings.bulkDiscountThreshold, settings.bulkDiscountPercent]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || !appliedCoupon.active) return 0;
    if (cartSubtotal < appliedCoupon.minOrderAmount) return 0;
    let discount =
      appliedCoupon.type === 'percent'
        ? Math.round((cartSubtotal * appliedCoupon.value) / 100)
        : appliedCoupon.value;
    if (appliedCoupon.maxDiscount && appliedCoupon.maxDiscount > 0) {
      discount = Math.min(discount, appliedCoupon.maxDiscount);
    }
    return Math.min(discount, cartSubtotal);
  }, [appliedCoupon, cartSubtotal]);

  const totalDiscount = useMemo(
    () => Math.max(autoBulkDiscount, couponDiscount),
    [autoBulkDiscount, couponDiscount]
  );

  const discountedSubtotal = Math.max(0, cartSubtotal - totalDiscount);

  const shippingFee = useMemo(() => {
    if (cart.length === 0) return 0;
    return cartSubtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
  }, [cart.length, cartSubtotal, settings.freeShippingThreshold, settings.standardShippingFee]);

  const cartTotal = discountedSubtotal + shippingFee;
  const freeShippingRemaining = Math.max(0, settings.freeShippingThreshold - cartSubtotal);
  const bulkDiscountRemaining = Math.max(0, (settings.bulkDiscountThreshold || 599) - cartSubtotal);

  const applyCouponCode = useCallback(
    (rawCode: string): { ok: boolean; message: string } => {
      const code = rawCode.trim().toUpperCase();
      if (!code) return { ok: false, message: 'Enter a coupon code.' };
      const match = coupons.find((c) => c.code.toUpperCase() === code && c.active);
      if (!match) {
        return { ok: false, message: `Coupon "${code}" is invalid or expired.` };
      }
      if (cartSubtotal < match.minOrderAmount) {
        return {
          ok: false,
          message: `Add ₹${match.minOrderAmount - cartSubtotal} more to use ${match.code}.`,
        };
      }
      setAppliedCoupon(match);
      showToast(`Coupon ${match.code} applied!`);
      return { ok: true, message: `Coupon ${match.code} applied successfully.` };
    },
    [coupons, cartSubtotal, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  }, [showToast]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlistIds((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          showToast('Removed from wishlist', 'info');
          return prev.filter((id) => id !== productId);
        }
        showToast('Saved to wishlist');
        return [productId, ...prev].slice(0, 50);
      });
    },
    [showToast]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const recordRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewedIds((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 12));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        blogs,
        banners,
        coupons,
        reviews,
        settings,
        loadingStore,
        firestoreSeeded,
        refreshStore,
        seedFirestoreDatabase,
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
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCoupon,
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        recentlyViewedIds,
        recordRecentlyViewed,
        miniCartOpen,
        setMiniCartOpen,
        quickViewProduct,
        setQuickViewProduct,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
