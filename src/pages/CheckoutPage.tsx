import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
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

interface PincodeResult {
  serviceable: boolean;
  region?: string;
  estimatedDays?: string;
  codAvailable?: boolean;
  message?: string;
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

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, profile, whatsappSession, setWhatsappSession, signInWithGoogle, saveAddress } =
    useAuth();
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
    description:
      'Complete your MAKH AND MORE order with instant Direct WhatsApp Login, Cash on Delivery, or online payment.',
    canonicalPath: '/checkout',
    noindex: true,
  });

  // Step 1: Checkout Login / Verification (Login ONLY at checkout — Direct WhatsApp Login primary!)
  const [authMode, setAuthMode] = useState<'whatsapp' | 'google' | 'guest'>('whatsapp');
  const [waPhoneInput, setWaPhoneInput] = useState(
    whatsappSession?.phone?.replace(/^\+91/, '') ||
      profile?.whatsappNumber?.replace(/^\+91/, '') ||
      ''
  );
  const [waStep, setWaStep] = useState<'enter-phone' | 'enter-otp'>('enter-phone');
  const [waOtpInput, setWaOtpInput] = useState('');
  const [waInstantCode, setWaInstantCode] = useState<string | null>(null);
  const [waDeepLink, setWaDeepLink] = useState<string | null>(null);
  const [waLoading, setWaLoading] = useState(false);
  const [waError, setWaError] = useState('');
  const [guestConfirmed, setGuestConfirmed] = useState(false);

  // Step 2: Shipping Address
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: profile?.displayName || user?.displayName || '',
    phone:
      whatsappSession?.phone ||
      profile?.whatsappNumber ||
      profile?.phone ||
      '',
    email: profile?.email || user?.email || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [orderNotes, setOrderNotes] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<PincodeResult | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  // Step 3: Payment
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>({
    razorpayConfigured: false,
    razorpayKeyId: null,
    whatsappCloudConfigured: false,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    settings.codEnabled ? 'cod' : 'razorpay'
  );
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

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

  useEffect(() => {
    if (whatsappSession?.verified && whatsappSession.phone) {
      setAddress((prev) => ({
        ...prev,
        phone: prev.phone || whatsappSession.phone,
      }));
    }
  }, [whatsappSession]);

  useEffect(() => {
    if (profile) {
      const def = profile.addresses?.find((a) => a.isDefault) || profile.addresses?.[0];
      setAddress((prev) => ({
        fullName: prev.fullName || def?.fullName || profile.displayName || '',
        phone: prev.phone || whatsappSession?.phone || def?.phone || profile.phone || '',
        email: prev.email || def?.email || profile.email || '',
        line1: prev.line1 || def?.line1 || '',
        line2: prev.line2 || def?.line2 || '',
        city: prev.city || def?.city || '',
        state: prev.state || def?.state || '',
        pincode: prev.pincode || def?.pincode || '',
        landmark: prev.landmark || def?.landmark || '',
      }));
    }
  }, [profile, whatsappSession]);

  const isIdentityReady = Boolean(user || whatsappSession?.verified || guestConfirmed);

  useEffect(() => {
    const pin = address.pincode.trim();
    if (!/^[1-9]\d{5}$/.test(pin)) {
      setPincodeStatus(null);
      return;
    }
    let active = true;
    setCheckingPin(true);
    fetch(`/api/pincode/${pin}`)
      .then((r) => r.json())
      .then((data) => {
        if (active) setPincodeStatus(data);
      })
      .catch(() => {
        if (active) setPincodeStatus(null);
      })
      .finally(() => {
        if (active) setCheckingPin(false);
      });
    return () => {
      active = false;
    };
  }, [address.pincode]);

  const handleSendWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaError('');
    setWaLoading(true);
    try {
      const resp = await fetch('/api/whatsapp-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waPhoneInput }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setWaError(data.error || 'Could not send WhatsApp verification code.');
        return;
      }
      setWaDeepLink(data.whatsappDeepLink || null);
      setWaInstantCode(data.instantCode || null);
      setWaStep('enter-otp');
      showToast('WhatsApp verification code generated!');
    } catch {
      setWaError('Unable to connect to verification service. Please try again.');
    } finally {
      setWaLoading(false);
    }
  };

  const handleVerifyWhatsAppOtp = async (codeOverride?: string) => {
    const codeToVerify = (codeOverride ?? waOtpInput).trim();
    setWaError('');
    setWaLoading(true);
    try {
      const resp = await fetch('/api/whatsapp-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waPhoneInput, code: codeToVerify }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.verified) {
        setWaError(data.error || 'Invalid verification code.');
        return;
      }
      setWhatsappSession({
        phone: data.phone,
        verified: true,
        verificationToken: data.verificationToken,
        verifiedAt: Date.now(),
      });
      setAddress((prev) => ({ ...prev, phone: data.phone }));
      showToast(`WhatsApp ${data.phone} verified for express checkout!`);
    } catch {
      setWaError('Verification failed. Please retry.');
    } finally {
      setWaLoading(false);
    }
  };

  const handleGoogleCheckoutSignIn = async () => {
    setWaError('');
    setWaLoading(true);
    try {
      await signInWithGoogle();
      showToast('Signed in with Google for checkout.');
    } catch (err) {
      setWaError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setWaLoading(false);
    }
  };

  const generateOrderNumber = () => {
    const d = new Date();
    const ymd = `${d.getFullYear().toString().slice(-2)}${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(d.getDate()).padStart(2, '0')}`;
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MM-${ymd}-${rand}`;
  };

  const validateAddress = (): string | null => {
    if (address.fullName.trim().length < 2) return 'Please enter the recipient full name.';
    const phoneDigits = address.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) return 'Please enter a valid 10-digit mobile number.';
    if (address.line1.trim().length < 4) return 'Please enter House / Flat / Street address.';
    if (address.city.trim().length < 2) return 'Please enter your city.';
    if (address.state.trim().length < 2) return 'Please enter your state.';
    if (!/^[1-9]\d{5}$/.test(address.pincode.trim()))
      return 'Please enter a valid 6-digit Indian PIN code.';
    return null;
  };

  const finalizeFirestoreOrder = async (
    orderNumber: string,
    method: PaymentMethod,
    razorpayMeta?: { razorpayOrderId: string; razorpayPaymentId: string }
  ) => {
    const orderId = orderNumber.toLowerCase();
    const normalizedPhone = address.phone.trim();
    const digitsOnly = normalizedPhone.replace(/\D/g, '');
    const phoneLast4 = digitsOnly.slice(-4).padStart(4, '0');

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
      fullName: address.fullName.trim().slice(0, 120),
      phone: normalizedPhone.slice(0, 20),
      email: (address.email || '').trim().slice(0, 180),
      line1: address.line1.trim().slice(0, 200),
      line2: (address.line2 || '').trim().slice(0, 200),
      city: address.city.trim().slice(0, 80),
      state: address.state.trim().slice(0, 80),
      pincode: address.pincode.trim().slice(0, 10),
      landmark: (address.landmark || '').trim().slice(0, 160),
    };

    const noteParts: string[] = [];
    if (orderNotes.trim()) noteParts.push(orderNotes.trim());
    if (razorpayMeta) noteParts.push(`Razorpay verified payment: ${razorpayMeta.razorpayPaymentId}`);

    const orderPayload: Record<string, unknown> = {
      orderNumber,
      userId: user ? user.uid : 'guest',
      customerName: cleanShipping.fullName,
      customerPhone: cleanShipping.phone,
      customerEmail: cleanShipping.email || '',
      whatsappVerified: Boolean(whatsappSession?.verified),
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
    }
    if (noteParts.length > 0) orderPayload.notes = noteParts.join(' | ').slice(0, 500);

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
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`, true);
    }

    try {
      await setDoc(doc(db, 'orderTracking', orderNumber), trackingPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orderTracking/${orderNumber}`, false);
    }

    if (user && saveToProfile) {
      try {
        await saveAddress({
          ...cleanShipping,
          id: `addr-${Date.now()}`,
          label: 'Home / Checkout',
          isDefault: (profile?.addresses?.length || 0) === 0,
        });
      } catch {
        // non-blocking
      }
    }

    const receiptOrder: Order = {
      id: orderId,
      orderNumber,
      userId: user ? user.uid : 'guest',
      customerName: cleanShipping.fullName,
      customerPhone: cleanShipping.phone,
      customerEmail: cleanShipping.email,
      whatsappVerified: Boolean(whatsappSession?.verified),
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
      notes: noteParts.join(' | ') || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (cart.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }
    if (!isIdentityReady) {
      setCheckoutError(
        'Please verify via Direct WhatsApp Login, sign in, or continue as guest in Step 1.'
      );
      return;
    }

    const addrErr = validateAddress();
    if (addrErr) {
      setCheckoutError(addrErr);
      return;
    }

    setSubmitting(true);
    const orderNumber = generateOrderNumber();

    try {
      if (paymentMethod === 'cod') {
        await finalizeFirestoreOrder(orderNumber, 'cod');
        return;
      }

      if (!gatewayStatus.razorpayConfigured) {
        setCheckoutError(
          'Online payment gateway (Razorpay) is not configured yet with live merchant keys. Please select Cash on Delivery (COD) to place your order immediately.'
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
        setCheckoutError(rzpOrderData.error || 'Unable to initialize online payment.');
        setSubmitting(false);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setCheckoutError(
          'Could not load Razorpay checkout script. Please retry or use Cash on Delivery.'
        );
        setSubmitting(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: rzpOrderData.keyId,
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency || 'INR',
        name: 'MAKH AND MORE',
        description: `Order ${orderNumber} — Premium Mithila Makhana`,
        order_id: rzpOrderData.orderId,
        prefill: {
          name: address.fullName,
          email: address.email || '',
          contact: address.phone,
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
              setCheckoutError('Payment signature verification failed. Please contact support.');
              setSubmitting(false);
              return;
            }
            await finalizeFirestoreOrder(orderNumber, paymentMethod, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            });
          } catch (err) {
            setCheckoutError(
              err instanceof Error ? err.message : 'Order could not be recorded after payment.'
            );
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : 'Could not complete your order. Please try again.'
      );
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] py-14 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-[32px] border border-[#0D3B2A]/10 p-10 text-center shadow-sm">
          <h1 className="font-display text-2xl font-extrabold text-[#0D3B2A] mb-2">
            Your snack bag is empty
          </h1>
          <p className="text-sm text-[#4A5E54] mb-6">
            Add your favourite roasted or jumbo Mithila makhana packs before proceeding to checkout.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold hover:bg-[#175C41]"
          >
            Browse Snacks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-5 sm:py-9 pb-28 lg:pb-16">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-5">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#0D3B2A]/10 text-xs sm:text-sm font-extrabold text-[#0D3B2A] hover:bg-[#EBF9C8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bag
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E2F6E7] text-xs font-extrabold text-[#0D3B2A]">
            <Lock className="w-3.5 h-3.5 text-[#23884D]" />
            Encrypted Checkout
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B2A] tracking-tight mb-6">
          Express App Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left 7 Cols: 3-Step Flow */}
          <div className="lg:col-span-7 space-y-5">
            {/* STEP 1: Direct WhatsApp Login */}
            <section className="bg-white rounded-[30px] border-2 border-[#0D3B2A]/10 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-[#B7E843] text-[#0D3B2A] text-sm font-extrabold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-extrabold text-[#0D3B2A]">
                      Direct WhatsApp Login
                    </h2>
                    <p className="text-xs text-[#4A5E54]">
                      Instant checkout verification — zero forced signup
                    </p>
                  </div>
                </div>
                {isIdentityReady && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EBF9C8] text-xs font-extrabold text-[#0D3B2A]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#23884D]" />
                    Verified
                  </span>
                )}
              </div>

              {whatsappSession?.verified ? (
                <div className="rounded-2xl bg-[#E2F6E7] border border-[#23884D]/25 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#0D3B2A]">
                        WhatsApp Verified: {whatsappSession.phone}
                      </p>
                      <p className="text-xs text-[#4A5E54]">
                        Order confirmation & live tracking sent straight to WhatsApp.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappSession(null);
                      setWaStep('enter-phone');
                      setWaOtpInput('');
                    }}
                    className="text-xs font-extrabold text-[#0D3B2A] underline hover:text-[#F25C54] cursor-pointer"
                  >
                    Change Number
                  </button>
                </div>
              ) : user ? (
                <div className="rounded-2xl bg-[#EBF9C8]/60 border border-[#0D3B2A]/12 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-[#23884D]" />
                    <div>
                      <p className="text-sm font-extrabold text-[#0D3B2A]">
                        Signed in as {profile?.displayName || user.displayName || user.email}
                      </p>
                      <p className="text-xs text-[#4A5E54]">{user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthMode('whatsapp')}
                    className="text-xs font-extrabold text-[#23884D] hover:underline cursor-pointer"
                  >
                    Also verify WhatsApp?
                  </button>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-full bg-[#FFF9EE] border border-[#0D3B2A]/10 mb-5">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('whatsapp');
                        setWaError('');
                      }}
                      className={`py-2.5 px-2 rounded-full text-xs font-extrabold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                        authMode === 'whatsapp'
                          ? 'bg-[#0D3B2A] text-[#B7E843] shadow-xs'
                          : 'text-[#4A5E54] hover:text-[#0D3B2A]'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('google');
                        setWaError('');
                      }}
                      className={`py-2.5 px-2 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
                        authMode === 'google'
                          ? 'bg-[#0D3B2A] text-[#B7E843] shadow-xs'
                          : 'text-[#4A5E54] hover:text-[#0D3B2A]'
                      }`}
                    >
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('guest');
                        setGuestConfirmed(true);
                        setWaError('');
                      }}
                      className={`py-2.5 px-2 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
                        authMode === 'guest'
                          ? 'bg-[#0D3B2A] text-[#B7E843] shadow-xs'
                          : 'text-[#4A5E54] hover:text-[#0D3B2A]'
                      }`}
                    >
                      Guest
                    </button>
                  </div>

                  {authMode === 'whatsapp' && (
                    <div className="space-y-4">
                      {waStep === 'enter-phone' ? (
                        <form onSubmit={handleSendWhatsAppOtp} className="space-y-3">
                          <label className="block text-xs font-extrabold text-[#0D3B2A]">
                            Enter your 10-digit WhatsApp Mobile Number
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2.5">
                            <div className="relative flex-1 flex items-center">
                              <span className="h-12 px-4 rounded-l-full border-2 border-r-0 border-[#0D3B2A]/12 bg-[#FFF9EE] text-sm font-extrabold text-[#0D3B2A] flex items-center">
                                +91
                              </span>
                              <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                value={waPhoneInput}
                                onChange={(e) =>
                                  setWaPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))
                                }
                                placeholder="98765 43210"
                                required
                                className="w-full h-12 px-4 rounded-r-full border-2 border-[#0D3B2A]/12 text-sm font-bold focus:outline-none focus:border-[#0D3B2A] tabular-nums"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={waLoading || waPhoneInput.length !== 10}
                              className="h-12 px-6 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs sm:text-sm font-extrabold transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer shadow-md"
                            >
                              {waLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MessageCircle className="w-4 h-4" />
                              )}
                              Continue with WhatsApp
                            </button>
                          </div>
                          <p className="text-xs text-[#4A5E54]">
                            One-tap 6-digit verification for WhatsApp order & tracking alerts.
                          </p>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-2xl bg-[#FFF9EE] border border-[#0D3B2A]/10 p-4 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-[#0D3B2A]">
                                Verifying +91 {waPhoneInput}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setWaStep('enter-phone');
                                  setWaOtpInput('');
                                }}
                                className="text-[#23884D] font-extrabold hover:underline cursor-pointer"
                              >
                                Edit number
                              </button>
                            </div>

                            {waInstantCode && (
                              <div className="rounded-2xl bg-white border border-[#F4B926]/50 p-3 flex flex-wrap items-center justify-between gap-2">
                                <div className="text-xs text-[#12261E]">
                                  Instant Code:{' '}
                                  <strong className="font-mono text-base text-[#0D3B2A] tracking-widest">
                                    {waInstantCode}
                                  </strong>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setWaOtpInput(waInstantCode);
                                      handleVerifyWhatsAppOtp(waInstantCode);
                                    }}
                                    className="px-3.5 py-1.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold hover:bg-[#175C41] cursor-pointer"
                                  >
                                    Auto-Verify
                                  </button>
                                  {waDeepLink && (
                                    <a
                                      href={waDeepLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 rounded-full bg-[#25D366]/15 text-[#128C7E] text-xs font-extrabold inline-flex items-center gap-1"
                                    >
                                      WhatsApp <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2.5">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={waOtpInput}
                              onChange={(e) =>
                                setWaOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))
                              }
                              placeholder="Enter 6-digit OTP"
                              className="flex-1 h-12 px-5 rounded-full border-2 border-[#0D3B2A]/12 text-sm font-mono tracking-widest focus:outline-none focus:border-[#0D3B2A]"
                            />
                            <button
                              type="button"
                              disabled={waLoading || waOtpInput.length !== 6}
                              onClick={() => handleVerifyWhatsAppOtp()}
                              className="h-12 px-7 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold hover:bg-[#175C41] disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
                            >
                              {waLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                              Verify OTP
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {authMode === 'google' && (
                    <div className="space-y-3">
                      <p className="text-xs text-[#4A5E54]">
                        Sign in to sync saved shipping addresses and order history.
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={handleGoogleCheckoutSignIn}
                          disabled={waLoading}
                          className="h-11 px-5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
                        >
                          {waLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          Continue with Google
                        </button>
                        <Link
                          to="/login?redirect=/checkout"
                          className="h-11 px-5 rounded-full border-2 border-[#0D3B2A]/15 text-[#0D3B2A] text-xs sm:text-sm font-extrabold inline-flex items-center"
                        >
                          Email Login
                        </Link>
                      </div>
                    </div>
                  )}

                  {authMode === 'guest' && (
                    <div className="rounded-2xl bg-[#EBF9C8]/60 p-4 text-xs font-semibold text-[#0D3B2A] flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#23884D] shrink-0" />
                      <span>
                        Guest Checkout enabled! You’ll get an Order ID to track your shipment
                        anytime.
                      </span>
                    </div>
                  )}

                  {waError && (
                    <p className="mt-3 text-xs font-bold text-[#F25C54] flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {waError}
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* STEP 2 & 3 FORM */}
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5">
              {/* STEP 2: Shipping Address */}
              <section className="bg-white rounded-[30px] border-2 border-[#0D3B2A]/10 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-9 h-9 rounded-full bg-[#F4B926] text-[#0D3B2A] text-sm font-extrabold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-extrabold text-[#0D3B2A]">
                      Delivery Address
                    </h2>
                    <p className="text-xs text-[#4A5E54]">
                      Freshly packed & shipped from Darbhanga, Bihar
                    </p>
                  </div>
                </div>

                {profile?.addresses && profile.addresses.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[11px] font-extrabold text-[#23884D] uppercase tracking-wider mb-2">
                      Saved Addresses
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {profile.addresses.map((saved) => (
                        <button
                          key={saved.id}
                          type="button"
                          onClick={() =>
                            setAddress({
                              fullName: saved.fullName,
                              phone: saved.phone,
                              email: saved.email || profile.email || '',
                              line1: saved.line1,
                              line2: saved.line2 || '',
                              city: saved.city,
                              state: saved.state,
                              pincode: saved.pincode,
                              landmark: saved.landmark || '',
                            })
                          }
                          className="text-left p-3.5 rounded-2xl border-2 border-[#0D3B2A]/10 hover:border-[#23884D] bg-[#FFF9EE] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#0D3B2A]">
                              {saved.label}
                            </span>
                            <MapPin className="w-3.5 h-3.5 text-[#23884D]" />
                          </div>
                          <p className="text-xs text-[#4A5E54] mt-1 line-clamp-2">
                            {saved.fullName}, {saved.line1}, {saved.city} - {saved.pincode}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="Recipient full name"
                      className="w-full h-11 px-4 rounded-2xl border-2 border-[#0D3B2A]/10 bg-[#FFF9EE]/50 text-sm font-medium focus:outline-none focus:border-[#0D3B2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                      Mobile / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full h-11 px-4 rounded-2xl border-2 border-[#0D3B2A]/10 bg-[#FFF9EE]/50 text-sm font-medium focus:outline-none focus:border-[#0D3B2A] tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={address.email || ''}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full h-11 px-4 rounded-2xl border-2 border-[#0D3B2A]/10 bg-[#FFF9EE]/50 text-sm font-medium focus:outline-none focus:border-[#0D3B2A]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                      House No, Building, Street *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.line1}
                      onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      placeholder="Flat / House No., Street / Colony"
                      className="w-full h-11 px-4 rounded-2xl border-2 border-[#0D3B2A]/10 bg-[#FFF9EE]/50 text-sm font-medium focus:outline-none focus:border-[#0D3B2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      value={address.line2 || ''}
                      onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                      placeholder="Locality / Sector"
                      className="w-full h-11 px-4 rounded-2xl border-2 border-[#0D3B2A]/10 bg-[#FFF9EE]/50 text-sm font-medium focus:outline-none focus:border-[#0D3B2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={address.landmark || ''}
                      onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      placeholder="Near temple, park, school..."
                      className="w-full h-11 px-4 rounded-2xl border-2 border-[#0D3B2A]/10 bg-[#FFF9EE]/50 text-sm font-medium focus:outline-none focus:border-[#0D3B2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                      PIN Code (6 digits) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={address.pincode}
                      onChange={(e) =>
                        setAddress({
                          ...address,
                          pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                        })
                      }
                      placeholder="e.g. 847422"
                      className="w-full h-11 px-4 rounded-2xl border-2 border-[#0D3B2A]/10 bg-[#FFF9EE]/50 text-sm font-bold focus:outline-none focus:border-[#0D3B2A] tabular-nums"
                    />
                    {checkingPin && (
                      <p className="text-[11px] text-[#4A5E54] mt-1">Checking PIN code…</p>
                    )}
                    {pincodeStatus?.serviceable && (
                      <p className="text-[11px] text-[#23884D] font-bold mt-1">
                        ✓ Deliverable ({pincodeStatus.region}) • Est. {pincodeStatus.estimatedDays}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="City"
                      className="w-full h-11 px-4 rounded-2xl border-2 border-[#0D3B2A]/10 bg-[#FFF9EE]/50 text-sm font-medium focus:outline-none focus:border-[#0D3B2A]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="e.g. Bihar, Maharashtra, Delhi, Karnataka"
                      className="w-full h-11 px-4 rounded-2xl border-2 border-[#0D3B2A]/10 bg-[#FFF9EE]/50 text-sm font-medium focus:outline-none focus:border-[#0D3B2A]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5">
                      Delivery Note (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any delivery instruction or gift note..."
                      className="w-full p-3.5 rounded-2xl border-2 border-[#0D3B2A]/10 bg-[#FFF9EE]/50 text-sm font-medium focus:outline-none focus:border-[#0D3B2A]"
                    />
                  </div>
                </div>

                {user && (
                  <label className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#4A5E54] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                      className="rounded accent-[#0D3B2A]"
                    />
                    Save this address to my account for faster checkout next time
                  </label>
                )}
              </section>

              {/* STEP 3: Payment Method */}
              <section className="bg-white rounded-[30px] border-2 border-[#0D3B2A]/10 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-9 h-9 rounded-full bg-[#FF7F3E] text-white text-sm font-extrabold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-extrabold text-[#0D3B2A]">
                      Payment Method
                    </h2>
                    <p className="text-xs text-[#4A5E54]">
                      Cash on Delivery or encrypted online payment
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {settings.codEnabled && (
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#0D3B2A] bg-[#EBF9C8]/55'
                          : 'border-[#0D3B2A]/10 hover:border-[#23884D]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 accent-[#0D3B2A]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-extrabold text-[#0D3B2A] inline-flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-[#23884D]" />
                            Cash on Delivery (COD)
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white text-[#23884D] text-[10px] font-extrabold">
                            Zero COD Fee
                          </span>
                        </div>
                        <p className="text-xs text-[#4A5E54] mt-1">
                          Pay with cash or UPI right at your doorstep.
                        </p>
                      </div>
                    </label>
                  )}

                  {settings.razorpayEnabled && (
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'razorpay' || paymentMethod === 'upi'
                          ? 'border-[#0D3B2A] bg-[#EBF9C8]/55'
                          : 'border-[#0D3B2A]/10 hover:border-[#23884D]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay' || paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-1 accent-[#0D3B2A]"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-extrabold text-[#0D3B2A] inline-flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#23884D]" />
                            UPI / Cards / NetBanking (Razorpay)
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A5E54]">
                            <Smartphone className="w-3.5 h-3.5" />
                            GPay • PhonePe • Cards
                          </span>
                        </div>
                        <p className="text-xs text-[#4A5E54] mt-1">
                          {gatewayStatus.razorpayConfigured
                            ? 'Instant encrypted payment verified via Razorpay HMAC signature.'
                            : 'Live Razorpay merchant credentials are not configured in server secrets yet. Select Cash on Delivery above to place your order now.'}
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {checkoutError && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-[#FFE4E1] border border-[#F25C54]/30 text-xs font-bold text-[#C83B24] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full h-14 px-6 rounded-full bg-[#0D3B2A] text-[#B7E843] font-extrabold text-sm hover:bg-[#175C41] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#0D3B2A]/20 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Placing Your Order…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      {paymentMethod === 'cod'
                        ? `Place COD Order • ₹${cartTotal.toLocaleString('en-IN')}`
                        : `Pay ₹${cartTotal.toLocaleString('en-IN')} Securely`}
                    </>
                  )}
                </button>
              </section>
            </form>
          </div>

          {/* Right 5 Cols: Order Summary */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-[30px] border-2 border-[#0D3B2A]/10 p-6 shadow-xs">
              <h2 className="font-display text-xl font-extrabold text-[#0D3B2A] mb-4">
                Order Summary ({cartCount})
              </h2>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const theme = getProductTheme({
                    slug: item.slug,
                    flavour: item.name,
                    category: item.slug,
                  });
                  return (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl ${theme.stageBg} p-1.5 shrink-0 flex items-center justify-center`}
                      >
                        <SafeImage
                          src={item.image}
                          alt={item.name}
                          imageCrop={item.imageCrop}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-[#0D3B2A] truncate">
                          {item.name}
                        </p>
                        <p className="text-xs font-semibold text-[#4A5E54]">
                          {item.weight} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-extrabold text-[#0D3B2A] tabular-nums">
                        ₹{(item.salePrice * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-[#0D3B2A]/8 space-y-2.5 text-sm">
                <div className="flex justify-between text-[#4A5E54]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#12261E] tabular-nums">
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-[#23884D] font-extrabold">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Discount {appliedCoupon ? `(${appliedCoupon.code})` : '(Auto Bulk)'}
                    </span>
                    <span className="tabular-nums">-₹{totalDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#4A5E54]">
                  <span>Shipping</span>
                  <span className="tabular-nums">
                    {shippingFee === 0 ? (
                      <span className="text-[#23884D] font-extrabold">FREE</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-[#0D3B2A]/10 pt-3 flex justify-between items-baseline">
                  <span className="font-extrabold text-[#0D3B2A]">Total Payable</span>
                  <span className="text-2xl font-extrabold text-[#0D3B2A] tabular-nums">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-5 p-4 rounded-2xl bg-[#FFF1B8]/70 text-xs text-[#12261E] space-y-1">
                <p className="font-extrabold text-[#0D3B2A]">Direct Mithila Dispatch Guarantee</p>
                <p>
                  Packed hygienically by <strong>ASR ENTERPRISES</strong> (Darbhanga, Bihar) with
                  tamper-evident freshness sealing.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky Mobile Place Order Dock */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/96 backdrop-blur-xl border-t border-[#0D3B2A]/10 rounded-t-[26px] px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-10px_28px_rgba(13,59,42,0.14)]">
        <div className="tabular-nums">
          <div className="text-[10px] font-bold uppercase text-[#4A5E54]">Total Payable</div>
          <div className="text-lg font-extrabold text-[#0D3B2A] leading-tight">
            ₹{cartTotal.toLocaleString('en-IN')}
          </div>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={submitting}
          className="h-12 px-6 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-extrabold inline-flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {paymentMethod === 'cod' ? 'Place COD Order' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
}
