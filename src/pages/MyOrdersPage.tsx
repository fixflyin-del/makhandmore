import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
} from 'lucide-react';
import { SafeImage } from '../components/BrandVisuals';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db } from '../lib/firebase';
import { useSEO } from '../lib/seo';
import { Order, OrderStatus } from '../types';

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function statusIndex(status: OrderStatus): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case 'delivered':
      return 'bg-[#E2F6E7] text-[#156C3D]';
    case 'shipped':
      return 'bg-[#FFF1B8] text-[#9A5306]';
    case 'packed':
    case 'confirmed':
      return 'bg-[#EBF9C8] text-[#0D3B2A]';
    case 'cancelled':
      return 'bg-[#FFE4E1] text-[#C83B24]';
    default:
      return 'bg-[#FFE7D4] text-[#C83B24]';
  }
}

export function MyOrdersPage() {
  const {
    user,
    profile,
    whatsappSession,
    whatsappProfile,
    whatsappOrders,
    isCustomerLoggedIn,
    setWhatsappSession,
  } = useAuth();
  const { submitCustomerReview, showToast } = useStore();

  useSEO({
    title: 'My Orders | MAKH AND MORE',
    description: 'View your MAKH AND MORE orders, live delivery status, and leave product reviews.',
    canonicalPath: '/my-orders',
    noindex: true,
  });

  // WhatsApp Login state (shown for new/logged-out users)
  const [phoneInput, setPhoneInput] = useState('');
  const [waStep, setWaStep] = useState<'phone' | 'otp'>('phone');
  const [otpInput, setOtpInput] = useState('');
  const [instantCode, setInstantCode] = useState<string | null>(null);
  const [waDeepLink, setWaDeepLink] = useState<string | null>(null);
  const [waLoading, setWaLoading] = useState(false);
  const [waError, setWaError] = useState('');

  // Orders & Live Status sync
  const [firestoreOrders, setFirestoreOrders] = useState<Order[]>([]);
  const [liveStatusMap, setLiveStatusMap] = useState<
    Record<string, { orderStatus: OrderStatus; courierName?: string; trackingNumber?: string }>
  >({});
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Selected Order Detail Modal + Inline Review Form
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewedOrderIds, setReviewedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setFirestoreOrders([]);
      return;
    }
    let active = true;
    setLoadingOrders(true);
    getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid)))
      .then((snap) => {
        if (!active) return;
        const list = snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id }));
        setFirestoreOrders(list);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingOrders(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const allOrders = useMemo(() => {
    const map = new Map<string, Order>();
    [...whatsappOrders, ...firestoreOrders].forEach((ord) => {
      if (!map.has(ord.orderNumber)) {
        map.set(ord.orderNumber, ord);
      }
    });
    return Array.from(map.values())
      .map((ord) => {
        const live = liveStatusMap[ord.orderNumber];
        return live
          ? {
              ...ord,
              orderStatus: live.orderStatus,
              courierName: live.courierName || ord.courierName,
              trackingNumber: live.trackingNumber || ord.trackingNumber,
            }
          : ord;
      })
      .sort((a, b) => String(b.orderNumber).localeCompare(String(a.orderNumber)));
  }, [whatsappOrders, firestoreOrders, liveStatusMap]);

  // Refresh real-time status for every order from public orderTracking docs
  useEffect(() => {
    if (!isCustomerLoggedIn || allOrders.length === 0) return;
    let active = true;
    Promise.allSettled(
      allOrders.slice(0, 15).map(async (ord) => {
        const snap = await getDoc(doc(db, 'orderTracking', ord.orderNumber));
        if (snap.exists()) {
          const data = snap.data() as {
            orderStatus?: OrderStatus;
            courierName?: string;
            trackingNumber?: string;
          };
          return { orderNumber: ord.orderNumber, data };
        }
        return null;
      })
    ).then((results) => {
      if (!active) return;
      const next: Record<
        string,
        { orderStatus: OrderStatus; courierName?: string; trackingNumber?: string }
      > = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value?.data?.orderStatus) {
          next[r.value.orderNumber] = {
            orderStatus: r.value.data.orderStatus,
            courierName: r.value.data.courierName,
            trackingNumber: r.value.data.trackingNumber,
          };
        }
      });
      if (Object.keys(next).length > 0) {
        setLiveStatusMap((prev) => ({ ...prev, ...next }));
      }
    });
    return () => {
      active = false;
    };
  }, [isCustomerLoggedIn, allOrders.length]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaError('');
    if (!/^[6-9]\d{9}$/.test(phoneInput)) {
      setWaError('Enter a valid 10-digit WhatsApp mobile number.');
      return;
    }
    setWaLoading(true);
    try {
      const resp = await fetch('/api/whatsapp-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setWaError(data.error || 'Could not send OTP.');
        return;
      }
      setInstantCode(data.instantCode || null);
      setWaDeepLink(data.whatsappDeepLink || null);
      setWaStep('otp');
      showToast('WhatsApp OTP sent!');
    } catch {
      setWaError('Unable to send OTP right now.');
    } finally {
      setWaLoading(false);
    }
  };

  const handleVerifyOtp = async (codeOverride?: string) => {
    const code = (codeOverride ?? otpInput).trim();
    if (code.length !== 6) {
      setWaError('Enter the 6-digit OTP.');
      return;
    }
    setWaLoading(true);
    setWaError('');
    try {
      const resp = await fetch('/api/whatsapp-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, code }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.verified) {
        setWaError(data.error || 'Incorrect OTP.');
        return;
      }
      setWhatsappSession({
        phone: data.phone,
        verified: true,
        verificationToken: data.verificationToken,
        verifiedAt: Date.now(),
      });
      showToast('Logged in with WhatsApp!');
    } catch {
      setWaError('Verification failed. Please retry.');
    } finally {
      setWaLoading(false);
    }
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setReviewOpen(false);
    setReviewProductId(order.items[0]?.productId || '');
    setReviewRating(5);
    setReviewComment('');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (reviewComment.trim().length < 5) {
      showToast('Please write a short review (at least 5 characters).', 'error');
      return;
    }

    const chosenItem =
      selectedOrder.items.find((i) => i.productId === reviewProductId) || selectedOrder.items[0];
    setReviewBusy(true);
    try {
      await submitCustomerReview({
        productId: chosenItem?.productId || 'premium-jumbo-makhana-100g',
        productName: chosenItem?.name || 'MAKH AND MORE Makhana',
        userId: user?.uid || `wa_${(whatsappSession?.phone || '').replace(/\D/g, '') || 'user'}`,
        authorName:
          whatsappProfile?.fullName ||
          profile?.displayName ||
          selectedOrder.customerName ||
          'Verified Customer',
        rating: reviewRating,
        title: `${reviewRating}★ Verified Order Review`,
        comment: reviewComment.trim(),
        verifiedPurchase: true,
      });
      setReviewedOrderIds((prev) => [...prev, selectedOrder.id]);
      setReviewOpen(false);
      setReviewComment('');
      showToast('Thank you! Your review has been published.');
    } finally {
      setReviewBusy(false);
    }
  };

  // New / Logged-Out User → Ask for WhatsApp Login First
  if (!isCustomerLoggedIn) {
    return (
      <div className="min-h-[68vh] py-6 sm:py-10 px-3.5 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[28px] border-2 border-[#0D3B2A]/10 p-5 sm:p-7 shadow-lg space-y-4">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center mx-auto shadow-md">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-[#0D3B2A]">
              Login with WhatsApp
            </h1>
            <p className="text-xs sm:text-sm text-[#4A5E54]">
              Enter your WhatsApp number to view your orders, live delivery status & leave reviews.
            </p>
          </div>

          {waStep === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div className="flex items-center">
                <span className="h-12 px-3.5 rounded-l-2xl border-2 border-r-0 border-[#0D3B2A]/12 bg-[#FFF9EE] text-sm font-extrabold text-[#0D3B2A] flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit WhatsApp number"
                  className="w-full h-12 px-4 rounded-r-2xl border-2 border-[#0D3B2A]/12 text-sm font-bold focus:outline-none focus:border-[#0D3B2A] tabular-nums"
                />
              </div>

              {waError && (
                <p className="text-xs font-bold text-[#C83B24] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {waError}
                </p>
              )}

              <button
                type="submit"
                disabled={waLoading || phoneInput.length !== 10}
                className="w-full h-12 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer transition-colors"
              >
                {waLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                Send WhatsApp OTP
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs bg-[#FFF9EE] px-3.5 py-2.5 rounded-2xl">
                <span className="font-extrabold text-[#0D3B2A]">OTP sent to +91 {phoneInput}</span>
                <button
                  type="button"
                  onClick={() => {
                    setWaStep('phone');
                    setOtpInput('');
                    setWaError('');
                  }}
                  className="font-extrabold text-[#23884D] hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {instantCode && (
                <div className="rounded-2xl bg-[#EBF9C8]/75 border border-[#23884D]/25 p-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-[#0D3B2A]">
                    OTP: <strong className="font-mono text-base tracking-widest">{instantCode}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={waLoading}
                      onClick={() => {
                        setOtpInput(instantCode);
                        handleVerifyOtp(instantCode);
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold cursor-pointer"
                    >
                      Auto-Verify
                    </button>
                    {waDeepLink && (
                      <a
                        href={waDeepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-[#25D366] text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="w-full h-12 px-4 rounded-2xl border-2 border-[#0D3B2A]/15 text-center font-mono text-lg font-extrabold tracking-[0.35em] text-[#0D3B2A] focus:outline-none focus:border-[#0D3B2A]"
              />

              {waError && (
                <p className="text-xs font-bold text-[#C83B24] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {waError}
                </p>
              )}

              <button
                type="button"
                disabled={waLoading || otpInput.length !== 6}
                onClick={() => handleVerifyOtp()}
                className="w-full h-12 rounded-2xl bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {waLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Verify & View My Orders
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const activeOrder = selectedOrder
    ? allOrders.find((o) => o.id === selectedOrder.id) || selectedOrder
    : null;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-7">
      {/* Compact Forest Header */}
      <div className="relative rounded-[24px] bg-[#0D3B2A] bg-gradient-to-br from-[#0D3B2A] via-[#15573D] to-[#23884D] text-white p-4 sm:p-6 mb-4 overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-dots-light pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#B7E843]">
              <Sparkles className="w-3 h-3" /> {whatsappSession?.phone || user?.email}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              My Orders
            </h1>
            <p className="text-xs text-[#FFF9EE]/85 mt-0.5">
              Tap any order to check live status & write a review
            </p>
          </div>
          <Link
            to="/shop"
            className="h-9 px-4 rounded-full bg-[#B7E843] text-[#0D3B2A] text-xs font-extrabold inline-flex items-center gap-1 shrink-0"
          >
            Shop <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {loadingOrders ? (
        <div className="py-14 text-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#0D3B2A] mx-auto" />
        </div>
      ) : allOrders.length === 0 ? (
        <div className="bg-white rounded-[26px] border-2 border-[#0D3B2A]/10 p-7 sm:p-10 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF9C8] text-[#0D3B2A] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="font-display text-xl font-extrabold text-[#0D3B2A]">
            No orders placed yet
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5E54] max-w-sm mx-auto">
            Once you place an order, it appears right here with live status updates and quick review options.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs sm:text-sm font-extrabold"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {allOrders.map((order) => {
            const firstItem = order.items[0];
            return (
              <motion.button
                key={order.id}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => openOrderModal(order)}
                className="w-full text-left bg-white rounded-[22px] border-2 border-[#0D3B2A]/10 hover:border-[#23884D] p-3.5 sm:p-4 shadow-xs transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-16 h-16 aspect-square rounded-2xl bg-[#FFF9EE] border border-[#0D3B2A]/8 p-1.5 shrink-0 overflow-hidden">
                  {firstItem?.image ? (
                    <SafeImage
                      src={firstItem.image}
                      alt={firstItem.name}
                      width={160}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Package className="w-full h-full p-3 text-[#23884D]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-extrabold text-[#0D3B2A]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#12261E] truncate mt-0.5">
                    {firstItem?.name}
                    {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                  </p>
                  <div className="flex items-center gap-2.5 mt-1 text-[11px] text-[#4A5E54] font-semibold">
                    <span className="font-extrabold text-[#0D3B2A] tabular-nums">
                      ₹{order.total}
                    </span>
                    <span>•</span>
                    <span className="uppercase">{order.paymentMethod}</span>
                    <span>•</span>
                    <span className="text-[#23884D] font-extrabold">Status & Review</span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-[#4A5E54] shrink-0" />
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Order Status + Write Review Bottom Sheet / Modal */}
      <AnimatePresence>
        {activeOrder && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-[#0D3B2A]/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-full sm:max-w-lg bg-[#FFF9EE] rounded-t-[28px] sm:rounded-[28px] max-h-[88vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="w-10 h-1 rounded-full bg-[#0D3B2A]/20 mx-auto sm:hidden" />

              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-extrabold text-[#23884D]">
                    {activeOrder.orderNumber}
                  </p>
                  <h2 className="font-display text-lg font-extrabold text-[#0D3B2A]">
                    Order Status & Details
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-9 h-9 rounded-full bg-white text-[#0D3B2A] flex items-center justify-center cursor-pointer"
                  aria-label="Close order details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Order Status Stepper */}
              <div className="bg-white rounded-2xl p-4 border border-[#0D3B2A]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0D3B2A]">
                    <Truck className="w-4 h-4 text-[#23884D]" />
                    Current Status
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${getStatusBadge(
                      activeOrder.orderStatus
                    )}`}
                  >
                    {activeOrder.orderStatus}
                  </span>
                </div>

                {activeOrder.orderStatus !== 'cancelled' && (
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= statusIndex(activeOrder.orderStatus);
                      return (
                        <div key={step.key} className="flex flex-col items-center text-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold mb-1 ${
                              done
                                ? 'bg-[#23884D] text-white'
                                : 'bg-[#0D3B2A]/10 text-[#4A5E54]'
                            }`}
                          >
                            {done ? '✓' : i + 1}
                          </div>
                          <span
                            className={`text-[10px] font-bold leading-tight ${
                              done ? 'text-[#0D3B2A]' : 'text-[#4A5E54]/70'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeOrder.trackingNumber && (
                  <p className="text-xs font-bold text-[#0D3B2A] bg-[#EBF9C8]/70 px-3 py-1.5 rounded-xl">
                    Tracking: {activeOrder.courierName ? `${activeOrder.courierName} · ` : ''}
                    {activeOrder.trackingNumber}
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#0D3B2A]/10 space-y-2.5">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-12 h-12 aspect-square rounded-xl bg-[#FFF9EE] p-1 shrink-0 overflow-hidden">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        width={120}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-[#0D3B2A] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#4A5E54]">
                        {item.weight} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-[#0D3B2A] tabular-nums">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}

                <div className="border-t border-[#0D3B2A]/8 pt-2.5 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-[#4A5E54] truncate max-w-[65%]">
                    <MapPin className="w-3.5 h-3.5 text-[#FF7F3E] shrink-0" />
                    <span className="truncate">
                      {activeOrder.shippingAddress.line1}, {activeOrder.shippingAddress.city} -{' '}
                      {activeOrder.shippingAddress.pincode}
                    </span>
                  </span>
                  <span className="font-display text-base font-extrabold text-[#0D3B2A] tabular-nums">
                    ₹{activeOrder.total}
                  </span>
                </div>
              </div>

              {/* Write a Review Section */}
              {!reviewOpen ? (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReviewOpen(true)}
                    className="flex-1 h-11 px-4 rounded-2xl bg-[#F4B926] text-[#0D3B2A] text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#f9c748] cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    {reviewedOrderIds.includes(activeOrder.id)
                      ? 'Write Another Review'
                      : 'Give Review'}
                  </button>
                  <Link
                    to={`/order-confirmation/${activeOrder.id}`}
                    className="h-11 px-4 rounded-2xl bg-white border border-[#0D3B2A]/15 text-[#0D3B2A] text-xs font-extrabold inline-flex items-center justify-center"
                  >
                    Invoice
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-white rounded-2xl p-4 border-2 border-[#F4B926]/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-extrabold text-[#0D3B2A]">
                      Rate Your Makhana
                    </h3>
                    <button
                      type="button"
                      onClick={() => setReviewOpen(false)}
                      className="text-xs font-bold text-[#4A5E54] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {activeOrder.items.length > 1 && (
                    <select
                      value={reviewProductId}
                      onChange={(e) => setReviewProductId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#FFF9EE] border border-[#0D3B2A]/12 text-xs font-bold text-[#0D3B2A]"
                    >
                      {activeOrder.items.map((it) => (
                        <option key={it.productId} value={it.productId}>
                          {it.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= reviewRating
                              ? 'fill-[#F4B926] text-[#F4B926]'
                              : 'text-[#0D3B2A]/20'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-[#0D3B2A] ml-1">
                      {reviewRating}.0 / 5
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share how you liked the crunch, freshness & taste..."
                    className="w-full p-3 rounded-xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-xs sm:text-sm focus:outline-none focus:border-[#0D3B2A]"
                  />

                  <button
                    type="submit"
                    disabled={reviewBusy}
                    className="w-full h-11 rounded-2xl bg-[#0D3B2A] text-[#B7E843] text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {reviewBusy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Submit Review
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
