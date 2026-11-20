import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  MessageCircle,
  Pencil,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { getProductTheme, SafeImage } from '../components/BrandVisuals';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useSEO } from '../lib/seo';
import { Order, OrderTracking, PaymentMethod, ShippingAddress } from '../types';

interface GatewayStatus {
  razorpayConfigured: boolean;
  razorpayKeyId: string | null;
  whatsappCloudConfigured: boolean;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function cleanTenDigits(phone?: string | null): string {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    whatsappSession,
    whatsappProfile,
    setWhatsappSession,
    saveWhatsappProfile,
    recordWhatsappOrder,
    saveAddress,
  } = useAuth();
  const {
    cart,
    cartCount,
    cartSubtotal,
    totalDiscount,
    appliedCoupon,
    shippingFee,
    cartTotal,
    settings,
    clearCart,
    showToast,
  } = useStore();

  useSEO({
    title: 'Checkout | MAKH AND MORE',
    description: 'Fast 1-step checkout for authentic Mithila Makhana snacks.',
    canonicalPath: '/checkout',
    noindex: true,
  });

  // Simple 3-field customer inputs
  const savedAddr = profile?.addresses?.find((a) => a.isDefault) || profile?.addresses?.[0];

  const [phoneDigits, setPhoneDigits] = useState(
    cleanTenDigits(whatsappSession?.phone || whatsappProfile?.phone || profile?.whatsappNumber || profile?.phone || '')
  );
  const [fullName, setFullName] = useState(
    whatsappProfile?.fullName || savedAddr?.fullName || profile?.displayName || user?.displayName || ''
  );
  const [addressLine, setAddressLine] = useState(
    whatsappProfile?.addressLine || savedAddr?.line1 || ''
  );

  // Auto-captured Location (PIN, City, State)
  const [pincode, setPincode] = useState(whatsappProfile?.pincode || savedAddr?.pincode || '');
  const [city, setCity] = useState(whatsappProfile?.city || savedAddr?.city || '');
  const [stateName, setStateName] = useState(whatsappProfile?.state || savedAddr?.state || '');
  const [locating, setLocating] = useState(false);
  const [locationSource, setLocationSource] = useState<'gps' | 'pin' | 'saved' | 'ip' | null>(
    whatsappProfile?.pincode || savedAddr?.pincode ? 'saved' : null
  );
  const [editingLocation, setEditingLocation] = useState(false);
  const [pinLookupBusy, setPinLookupBusy] = useState(false);
  const [estimatedDays, setEstimatedDays] = useState<string>('2–4 business days');
  const autoDetectedRef = useRef(false);

  // Payment
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>({
    razorpayConfigured: false,
    razorpayKeyId: null,
    whatsappCloudConfigured: false,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    settings.codEnabled ? 'cod' : 'razorpay'
  );

  // OTP Modal for seamless verification & order placement
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpInstantCode, setOtpInstantCode] = useState<string | null>(null);
  const [otpDeepLink, setOtpDeepLink] = useState<string | null>(null);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Load gateway config
  useEffect(() => {
    fetch('/api/config/status')
      .then((r) => r.json())
      .then((data) => {
        setGatewayStatus({
          razorpayConfigured: Boolean(data.razorpayConfigured),
          razorpayKeyId: data.razorpayKeyId || null,
          whatsappCloudConfigured: Boolean(data.whatsappCloudConfigured),
        });
      })
      .catch(() => {});
  }, []);

  // Sync saved profile if hydrated slightly after mount
  useEffect(() => {
    if (whatsappProfile) {
      setFullName((prev) => prev || whatsappProfile.fullName || '');
      setAddressLine((prev) => prev || whatsappProfile.addressLine || '');
      setPincode((prev) => prev || whatsappProfile.pincode || '');
      setCity((prev) => prev || whatsappProfile.city || '');
      setStateName((prev) => prev || whatsappProfile.state || '');
      if (whatsappProfile.pincode) setLocationSource((prev) => prev || 'saved');
    }
  }, [whatsappProfile]);

  const applyPinLookup = useCallback(async (pin: string) => {
    if (!/^[1-9]\d{5}$/.test(pin)) return;
    setPinLookupBusy(true);
    try {
      const resp = await fetch(`/api/pincode/${pin}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.city) setCity(data.city);
        if (data.state) setStateName(data.state);
        if (data.estimatedDays) setEstimatedDays(data.estimatedDays);
        if (data.locality) {
          setAddressLine((prev) => (prev.trim() ? prev : data.locality));
        }
        setLocationSource('pin');
      }
    } catch {
      // keep existing values
    } finally {
      setPinLookupBusy(false);
    }
  }, []);

  const detectLocationAutomatically = useCallback(
    async (forceGps = false) => {
      setLocating(true);

      const fallbackToIp = async () => {
        try {
          const resp = await fetch('/api/location/ip');
          if (!resp.ok) return;
          const data = await resp.json();
          if (data.success && (data.pincode || data.city)) {
            if (data.pincode) {
              setPincode((prev) => (forceGps || !prev ? data.pincode : prev));
              await applyPinLookup(data.pincode);
            }
            if (data.city) setCity((prev) => (forceGps || !prev ? data.city : prev));
            if (data.state) setStateName((prev) => (forceGps || !prev ? data.state : prev));
            setLocationSource('ip');
          }
        } catch {
          // silent fallback
        }
      };

      if (!('geolocation' in navigator)) {
        await fallbackToIp();
        setLocating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const resp = await fetch(
              `/api/location/reverse?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`
            );
            if (resp.ok) {
              const data = await resp.json();
              if (data.pincode) setPincode(data.pincode);
              if (data.city) setCity(data.city);
              if (data.state) setStateName(data.state);
              if (data.addressLine) {
                setAddressLine((prev) => (forceGps || !prev.trim() ? data.addressLine : prev));
              }
              setLocationSource('gps');
              setEditingLocation(false);
              if (data.pincode) {
                fetch(`/api/pincode/${data.pincode}`)
                  .then((r) => r.json())
                  .then((pinData) => {
                    if (pinData.estimatedDays) setEstimatedDays(pinData.estimatedDays);
                  })
                  .catch(() => {});
              }
              if (forceGps) showToast('Location detected automatically!');
            } else {
              await fallbackToIp();
            }
          } catch {
            await fallbackToIp();
          } finally {
            setLocating(false);
          }
        },
        async () => {
          await fallbackToIp();
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 }
      );
    },
    [applyPinLookup, showToast]
  );

  // Auto-detect location immediately when a new user enters checkout
  useEffect(() => {
    if (autoDetectedRef.current) return;
    autoDetectedRef.current = true;
    if (!pincode || !stateName || !addressLine) {
      detectLocationAutomatically(false);
    } else if (/^[1-9]\d{5}$/.test(pincode)) {
      applyPinLookup(pincode);
    }
  }, [addressLine, applyPinLookup, detectLocationAutomatically, pincode, stateName]);

  const isPhoneAlreadyVerified =
    Boolean(whatsappSession?.verified) &&
    cleanTenDigits(whatsappSession?.phone) === cleanTenDigits(phoneDigits) &&
    cleanTenDigits(phoneDigits).length === 10;

  const generateOrderNumber = () => {
    const d = new Date();
    const ymd = `${d.getFullYear().toString().slice(-2)}${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(d.getDate()).padStart(2, '0')}`;
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MM-${ymd}-${rand}`;
  };

  const validateSimpleForm = (): string | null => {
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      return 'Please enter a valid 10-digit WhatsApp mobile number.';
    }
    if (fullName.trim().length < 2) {
      return 'Please enter your name.';
    }
    if (addressLine.trim().length < 4) {
      return 'Please enter your house / street address.';
    }
    if (!/^[1-9]\d{5}$/.test(pincode.trim())) {
      setEditingLocation(true);
      return 'Please verify or enter your 6-digit PIN code.';
    }
    return null;
  };

  const finalizeOrder = async (
    orderNumber: string,
    method: PaymentMethod,
    verifiedPhone: string,
    razorpayMeta?: { razorpayOrderId: string; razorpayPaymentId: string }
  ) => {
    const orderId = orderNumber.toLowerCase();
    const normalizedPhone = verifiedPhone.startsWith('+91')
      ? verifiedPhone
      : `+91${cleanTenDigits(verifiedPhone)}`;
    const phoneLast4 = cleanTenDigits(normalizedPhone).slice(-4).padStart(4, '0');

    const finalCity = city.trim() || 'India';
    const finalState = stateName.trim() || 'India';
    const finalPin = pincode.trim();

    // Save customer details permanently in WhatsApp Profile
    saveWhatsappProfile({
      phone: normalizedPhone,
      fullName: fullName.trim(),
      addressLine: addressLine.trim(),
      city: finalCity,
      state: finalState,
      pincode: finalPin,
    });

    const orderItems = cart.map((item) => ({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      weight: item.weight,
      price: item.salePrice,
      quantity: item.quantity,
      image: item.image,
    }));

    const cleanShipping: ShippingAddress = {
      fullName: fullName.trim().slice(0, 120),
      phone: normalizedPhone.slice(0, 20),
      email: profile?.email || user?.email || '',
      line1: addressLine.trim().slice(0, 200),
      line2: '',
      city: finalCity.slice(0, 80),
      state: finalState.slice(0, 80),
      pincode: finalPin.slice(0, 10),
      landmark: '',
    };

    const orderPayload: Record<string, unknown> = {
      orderNumber,
      userId: user ? user.uid : 'guest',
      customerName: cleanShipping.fullName,
      customerPhone: cleanShipping.phone,
      customerEmail: cleanShipping.email || '',
      whatsappVerified: true,
      shippingAddress: cleanShipping,
      items: orderItems,
      subtotal: cartSubtotal,
      discount: totalDiscount,
      shippingFee,
      total: cartTotal,
      paymentMethod: method,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (appliedCoupon?.code) orderPayload.couponCode = appliedCoupon.code;
    if (razorpayMeta) {
      orderPayload.razorpayOrderId = razorpayMeta.razorpayOrderId;
      orderPayload.razorpayPaymentId = razorpayMeta.razorpayPaymentId;
      orderPayload.notes = `Razorpay verified payment: ${razorpayMeta.razorpayPaymentId}`;
    }

    const trackingPayload: Record<string, unknown> = {
      orderNumber,
      phoneLast4,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      itemCount: cartCount,
      total: cartTotal,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'orders', orderId), orderPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`, false);
    }

    try {
      await setDoc(doc(db, 'orderTracking', orderNumber), trackingPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orderTracking/${orderNumber}`, false);
    }

    if (user) {
      try {
        await saveAddress({
          ...cleanShipping,
          id: `addr-${Date.now()}`,
          label: 'Home',
          isDefault: true,
        });
      } catch {
        // non-blocking
      }
    }

    const receiptOrder: Order = {
      id: orderId,
      orderNumber,
      userId: user ? user.uid : `wa_${cleanTenDigits(normalizedPhone)}`,
      customerName: cleanShipping.fullName,
      customerPhone: cleanShipping.phone,
      customerEmail: cleanShipping.email,
      whatsappVerified: true,
      shippingAddress: cleanShipping,
      items: orderItems,
      subtotal: cartSubtotal,
      discount: totalDiscount,
      couponCode: appliedCoupon?.code,
      shippingFee,
      total: cartTotal,
      paymentMethod: method,
      paymentStatus: razorpayMeta ? 'paid' : 'pending',
      razorpayOrderId: razorpayMeta?.razorpayOrderId,
      razorpayPaymentId: razorpayMeta?.razorpayPaymentId,
      orderStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Persist in WhatsApp order history permanently
    recordWhatsappOrder(receiptOrder);

    try {
      sessionStorage.setItem(`makh_last_order_${orderId}`, JSON.stringify(receiptOrder));
      sessionStorage.setItem(
        `makh_last_tracking_${orderNumber}`,
        JSON.stringify({
          ...trackingPayload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as OrderTracking)
      );
    } catch {
      // ignore storage quota
    }

    clearCart();
    showToast(`Order ${orderNumber} placed successfully!`);
    navigate(`/order-confirmation/${orderId}`);
  };

  const executePaymentAndPlaceOrder = async (verifiedPhone: string) => {
    setSubmitting(true);
    setCheckoutError('');
    const orderNumber = generateOrderNumber();

    try {
      if (paymentMethod === 'cod') {
        await finalizeOrder(orderNumber, 'cod', verifiedPhone);
        return;
      }

      if (!gatewayStatus.razorpayConfigured) {
        setCheckoutError(
          'Online payment is awaiting live merchant activation. Switch to COD to place your order instantly.'
        );
        setSubmitting(false);
        return;
      }

      const rzpOrderResp = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cartTotal, receipt: orderNumber }),
      });
      const rzpOrderData = await rzpOrderResp.json();
      if (!rzpOrderResp.ok) {
        setCheckoutError(rzpOrderData.error || 'Unable to start online payment.');
        setSubmitting(false);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setCheckoutError('Could not load online payment. Please try COD.');
        setSubmitting(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: rzpOrderData.keyId,
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency || 'INR',
        name: 'MAKH AND MORE',
        description: `Order ${orderNumber} — Mithila Makhana`,
        order_id: rzpOrderData.orderId,
        prefill: {
          name: fullName.trim(),
          contact: verifiedPhone,
        },
        theme: { color: '#0D3B2A' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyResp = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyResp.json();
            if (!verifyResp.ok || !verifyData.verified) {
              setCheckoutError('Payment verification failed. Please contact support.');
              setSubmitting(false);
              return;
            }
            await finalizeOrder(orderNumber, paymentMethod, verifiedPhone, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            });
          } catch (err) {
            setCheckoutError(err instanceof Error ? err.message : 'Order recording failed.');
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      rzp.open();
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Could not complete your order.');
      setSubmitting(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (cart.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    const formErr = validateSimpleForm();
    if (formErr) {
      setCheckoutError(formErr);
      return;
    }

    // Returning verified user → place order immediately in 1 tap!
    if (isPhoneAlreadyVerified && whatsappSession?.phone) {
      await executePaymentAndPlaceOrder(whatsappSession.phone);
      return;
    }

    // New user or changed number → send WhatsApp OTP & open OTP confirmation modal
    setOtpBusy(true);
    setOtpError('');
    try {
      const resp = await fetch('/api/whatsapp-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneDigits }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setCheckoutError(data.error || 'Could not send OTP to this WhatsApp number.');
        return;
      }
      setOtpInstantCode(data.instantCode || null);
      setOtpDeepLink(data.whatsappDeepLink || null);
      setOtpCodeInput('');
      setOtpModalOpen(true);
      showToast('6-digit OTP sent to your WhatsApp!');
    } catch {
      setCheckoutError('Unable to send OTP right now. Please try again.');
    } finally {
      setOtpBusy(false);
    }
  };

  const handleVerifyOtpAndOrder = async (codeOverride?: string) => {
    const code = (codeOverride ?? otpCodeInput).trim();
    if (code.length !== 6) {
      setOtpError('Enter the 6-digit OTP.');
      return;
    }
    setOtpBusy(true);
    setOtpError('');
    try {
      const resp = await fetch('/api/whatsapp-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneDigits, code }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.verified) {
        setOtpError(data.error || 'Invalid OTP. Please check and retry.');
        return;
      }

      // Save permanent WhatsApp session & profile
      setWhatsappSession({
        phone: data.phone,
        verified: true,
        verificationToken: data.verificationToken,
        verifiedAt: Date.now(),
      });
      saveWhatsappProfile({
        phone: data.phone,
        fullName: fullName.trim(),
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
      });

      setOtpModalOpen(false);
      await executePaymentAndPlaceOrder(data.phone);
    } catch {
      setOtpError('Verification failed. Please retry.');
    } finally {
      setOtpBusy(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[65vh] py-10 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[26px] border border-[#0D3B2A]/10 p-7 text-center shadow-sm">
          <h1 className="font-display text-2xl font-extrabold text-[#0D3B2A] mb-2">
            Your bag is empty
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5E54] mb-5">
            Add your favourite roasted or jumbo Mithila makhana packs before checkout.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold hover:bg-[#175C41]"
          >
            Shop Snacks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-3.5 sm:py-6 pb-28 lg:pb-12">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Compact Top Bar */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#0D3B2A]/10 text-xs font-extrabold text-[#0D3B2A] hover:bg-[#EBF9C8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Bag
          </Link>
          <h1 className="font-display text-lg sm:text-2xl font-extrabold text-[#0D3B2A]">
            Quick Checkout
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E2F6E7] text-[11px] font-extrabold text-[#0D3B2A]">
            <Lock className="w-3 h-3 text-[#23884D]" />
            Safe
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Main Super-Simple Single Card Form */}
          <form
            id="quick-checkout-form"
            onSubmit={handleCheckoutSubmit}
            className="lg:col-span-7 bg-white rounded-[26px] border-2 border-[#0D3B2A]/10 p-4 sm:p-6 shadow-sm space-y-4"
          >
            {/* Auto-Detected Location Banner (PIN, City, State captured automatically) */}
            <div className="rounded-2xl bg-gradient-to-r from-[#EBF9C8]/75 to-[#FFF1B8]/70 border border-[#23884D]/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#0D3B2A] text-[#B7E843] flex items-center justify-center shrink-0">
                    {locating || pinLookupBusy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#23884D]">
                      {locating
                        ? 'Detecting your PIN & State...'
                        : locationSource === 'gps'
                          ? 'Location Auto-Detected'
                          : locationSource === 'saved'
                            ? 'Saved Delivery Location'
                            : 'Delivery Location'}
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-[#0D3B2A] truncate">
                      {pincode
                        ? `${city ? `${city}, ` : ''}${stateName || 'India'} · ${pincode}`
                        : 'Tap GPS or enter 6-digit PIN'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => detectLocationAutomatically(true)}
                    disabled={locating}
                    title="Auto-detect GPS location"
                    className="h-8 px-2.5 rounded-full bg-white text-[#0D3B2A] border border-[#0D3B2A]/12 text-[11px] font-extrabold inline-flex items-center gap-1 hover:bg-[#0D3B2A] hover:text-[#B7E843] transition-colors cursor-pointer"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">GPS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLocation((v) => !v)}
                    className="h-8 px-2.5 rounded-full bg-white text-[#0D3B2A] border border-[#0D3B2A]/12 text-[11px] font-extrabold inline-flex items-center gap-1 hover:bg-[#FFF9EE] cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    PIN
                  </button>
                </div>
              </div>

              {(editingLocation || !pincode) && (
                <div className="mt-2.5 pt-2.5 border-t border-[#0D3B2A]/10 grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPincode(val);
                      if (val.length === 6) applyPinLookup(val);
                    }}
                    placeholder="PIN Code"
                    className="h-9 px-3 rounded-xl bg-white border border-[#0D3B2A]/15 text-xs font-extrabold text-[#0D3B2A] focus:outline-none focus:border-[#0D3B2A] tabular-nums"
                  />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="h-9 px-3 rounded-xl bg-white border border-[#0D3B2A]/15 text-xs font-bold text-[#0D3B2A] focus:outline-none focus:border-[#0D3B2A]"
                  />
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="State"
                    className="h-9 px-3 rounded-xl bg-white border border-[#0D3B2A]/15 text-xs font-bold text-[#0D3B2A] focus:outline-none focus:border-[#0D3B2A]"
                  />
                </div>
              )}

              {pincode && /^[1-9]\d{5}$/.test(pincode) && (
                <p className="mt-1.5 text-[11px] font-bold text-[#156C3D] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  Delivery available · Est. {estimatedDays}
                </p>
              )}
            </div>

            {/* Only 3 Clean Inputs: WhatsApp Number, Full Name, Single-Line Address */}
            <div className="space-y-3">
              {/* 1. WhatsApp Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-extrabold text-[#0D3B2A] flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    WhatsApp Number *
                  </label>
                  {isPhoneAlreadyVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#156C3D] bg-[#E2F6E7] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <span className="h-11 px-3.5 rounded-l-2xl border-2 border-r-0 border-[#0D3B2A]/12 bg-[#FFF9EE] text-xs font-extrabold text-[#0D3B2A] flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit WhatsApp number"
                    className="w-full h-11 px-3.5 rounded-r-2xl border-2 border-[#0D3B2A]/12 bg-[#FFF9EE]/40 text-sm font-bold text-[#12261E] focus:outline-none focus:border-[#0D3B2A] focus:bg-white tabular-nums"
                  />
                </div>
              </div>

              {/* 2. Full Name */}
              <div>
                <label className="text-xs font-extrabold text-[#0D3B2A] flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-[#23884D]" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full h-11 px-3.5 rounded-2xl border-2 border-[#0D3B2A]/12 bg-[#FFF9EE]/40 text-sm font-semibold text-[#12261E] focus:outline-none focus:border-[#0D3B2A] focus:bg-white"
                />
              </div>

              {/* 3. Single-Line Address */}
              <div>
                <label className="text-xs font-extrabold text-[#0D3B2A] flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7F3E]" />
                  Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="House / Flat No., Street, Area"
                  className="w-full h-11 px-3.5 rounded-2xl border-2 border-[#0D3B2A]/12 bg-[#FFF9EE]/40 text-sm font-semibold text-[#12261E] focus:outline-none focus:border-[#0D3B2A] focus:bg-white"
                />
              </div>
            </div>

            {/* Compact Horizontal Payment Method Pill Tabs (COD vs Online) */}
            <div className="pt-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#4A5E54] mb-1.5">
                Payment Mode
              </p>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#FFF9EE] border border-[#0D3B2A]/12">
                {settings.codEnabled && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cod');
                      setCheckoutError('');
                    }}
                    className={`h-10 px-3 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'bg-[#0D3B2A] text-[#B7E843] shadow-sm'
                        : 'text-[#4A5E54] hover:text-[#0D3B2A]'
                    }`}
                  >
                    <Banknote className="w-4 h-4 shrink-0" />
                    <span>Cash on Delivery</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('razorpay');
                    setCheckoutError('');
                  }}
                  className={`h-10 px-3 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'razorpay'
                      ? 'bg-[#0D3B2A] text-[#B7E843] shadow-sm'
                      : 'text-[#4A5E54] hover:text-[#0D3B2A]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Online / UPI</span>
                </button>
              </div>
            </div>

            {checkoutError && (
              <div className="rounded-2xl bg-[#FFE4E1] border border-[#F25C54]/30 px-3.5 py-2.5 text-xs font-bold text-[#C83B24] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Stylish Primary Checkout CTA Button */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={submitting || otpBusy}
              className="w-full h-13 px-5 rounded-2xl bg-gradient-to-r from-[#0D3B2A] via-[#15573D] to-[#23884D] text-white font-display font-extrabold text-sm sm:text-base shadow-[0_12px_28px_rgba(13,59,42,0.28)] hover:brightness-110 transition-all flex items-center justify-between gap-3 cursor-pointer disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                {submitting || otpBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#B7E843]" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#B7E843]" />
                )}
                <span>
                  {submitting
                    ? 'Placing Order...'
                    : otpBusy
                      ? 'Sending OTP...'
                      : isPhoneAlreadyVerified
                        ? paymentMethod === 'cod'
                          ? 'Place COD Order'
                          : 'Pay Online & Order'
                        : 'Get OTP & Place Order'}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#B7E843] text-[#0D3B2A] text-xs sm:text-sm font-extrabold tabular-nums">
                ₹{cartTotal}
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.8]" />
              </span>
            </motion.button>

            <p className="text-[11px] text-center text-[#4A5E54] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#23884D]" />
              Details auto-save to your profile for 1-tap future orders
            </p>
          </form>

          {/* Right 5 Cols: Compact Order Summary */}
          <aside className="lg:col-span-5 bg-white rounded-[26px] border-2 border-[#0D3B2A]/10 p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-extrabold text-[#0D3B2A]">
                Order Summary ({cartCount})
              </h2>
              <Link to="/cart" className="text-xs font-extrabold text-[#23884D] hover:underline">
                Edit Bag
              </Link>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
              {cart.map((item) => {
                const theme = getProductTheme({
                  slug: item.slug,
                  category: '',
                });
                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-2.5 p-2 rounded-2xl bg-[#FFF9EE]/70 border border-[#0D3B2A]/6"
                  >
                    <div
                      className={`w-12 h-12 aspect-square rounded-xl ${theme.stageBg} p-1 shrink-0 overflow-hidden`}
                    >
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        imageCrop={item.imageCrop}
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
                    <span className="text-xs font-extrabold text-[#0D3B2A] tabular-nums shrink-0">
                      ₹{item.salePrice * item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#0D3B2A]/10 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#4A5E54]">
                <span>Subtotal</span>
                <span className="font-bold text-[#0D3B2A] tabular-nums">₹{cartSubtotal}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-[#156C3D] font-bold">
                  <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : '(20% OFF)'}</span>
                  <span className="tabular-nums">−₹{totalDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-[#4A5E54]">
                <span>Shipping</span>
                <span className="font-bold text-[#156C3D]">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>
              <div className="border-t border-[#0D3B2A]/10 pt-2 flex justify-between items-baseline">
                <span className="font-display text-sm font-extrabold text-[#0D3B2A]">Total Payable</span>
                <span className="font-display text-xl font-extrabold text-[#0D3B2A] tabular-nums">
                  ₹{cartTotal}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Fixed Mobile Bottom Quick Pay Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#0D3B2A]/10 px-3.5 py-2.5 shadow-[0_-8px_24px_rgba(13,59,42,0.12)]">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <p className="text-[10px] font-bold uppercase text-[#4A5E54]">
              {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Pay'}
            </p>
            <p className="font-display text-lg font-extrabold text-[#0D3B2A] tabular-nums">
              ₹{cartTotal}
            </p>
          </div>
          <button
            type="submit"
            form="quick-checkout-form"
            disabled={submitting || otpBusy}
            className="flex-1 h-11 px-4 rounded-2xl bg-gradient-to-r from-[#0D3B2A] to-[#23884D] text-[#B7E843] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
          >
            {submitting || otpBusy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>
              {submitting
                ? 'Placing...'
                : isPhoneAlreadyVerified
                  ? 'Confirm Order'
                  : 'Verify OTP & Order'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Clean WhatsApp OTP Verification Modal */}
      <AnimatePresence>
        {otpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !otpBusy && setOtpModalOpen(false)}
              className="fixed inset-0 bg-[#0D3B2A]/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              className="relative z-10 w-full max-w-sm bg-white rounded-[28px] p-5 shadow-2xl border-2 border-[#0D3B2A]/10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-2xl bg-[#25D366] text-white flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-[#0D3B2A]">
                      Verify WhatsApp OTP
                    </h3>
                    <p className="text-[11px] text-[#4A5E54] font-semibold">
                      Sent to +91 {phoneDigits}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FFF9EE] text-[#0D3B2A] flex items-center justify-center cursor-pointer"
                  aria-label="Close OTP dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {otpInstantCode && (
                <div className="rounded-2xl bg-[#EBF9C8]/70 border border-[#23884D]/25 p-3 flex items-center justify-between gap-2">
                  <div className="text-xs text-[#0D3B2A]">
                    Your OTP:{' '}
                    <strong className="font-mono text-base tracking-widest">
                      {otpInstantCode}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={otpBusy}
                      onClick={() => {
                        setOtpCodeInput(otpInstantCode);
                        handleVerifyOtpAndOrder(otpInstantCode);
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-[11px] font-extrabold cursor-pointer"
                    >
                      Auto-Verify
                    </button>
                    {otpDeepLink && (
                      <a
                        href={otpDeepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-[#25D366] text-white"
                        title="Open WhatsApp"
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
                autoFocus
                value={otpCodeInput}
                onChange={(e) => setOtpCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="w-full h-12 px-4 rounded-2xl border-2 border-[#0D3B2A]/15 text-center font-mono text-lg font-extrabold tracking-[0.35em] text-[#0D3B2A] focus:outline-none focus:border-[#0D3B2A]"
              />

              {otpError && (
                <p className="text-xs font-bold text-[#C83B24] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {otpError}
                </p>
              )}

              <button
                type="button"
                disabled={otpBusy || otpCodeInput.length !== 6}
                onClick={() => handleVerifyOtpAndOrder()}
                className="w-full h-12 rounded-2xl bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold inline-flex items-center justify-center gap-2 hover:bg-[#175C41] disabled:opacity-50 cursor-pointer shadow-md"
              >
                {otpBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                Verify & Place Order (₹{cartTotal})
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
