import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Package,
  Printer,
  Truck,
} from 'lucide-react';
import {
  AnimatedSparkle,
  BrandLogo,
  getProductTheme,
  OrganicBlob,
  SafeImage,
} from '../components/BrandVisuals';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db } from '../lib/firebase';
import { useSEO } from '../lib/seo';
import { Order } from '../types';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { settings } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Order Confirmed | MAKH AND MORE',
    description: 'Thank you for ordering authentic Mithila Makhana from MAKH AND MORE.',
    canonicalPath: `/order-confirmation/${orderId || ''}`,
    noindex: true,
  });

  useEffect(() => {
    let active = true;
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const cached = sessionStorage.getItem(`makh_last_order_${orderId}`);
        if (cached && active) {
          setOrder(JSON.parse(cached) as Order);
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }

      if (user) {
        try {
          const snap = await getDoc(doc(db, 'orders', orderId));
          if (snap.exists() && active) {
            setOrder({ ...(snap.data() as Order), id: snap.id });
          }
        } catch {
          // ignore
        }
      }
      if (active) setLoading(false);
    };
    loadOrder();
    return () => {
      active = false;
    };
  }, [orderId, user]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-11 h-11 border-4 border-[#B7E843] border-t-[#0D3B2A] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#0D3B2A]">Loading your order receipt…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] py-14 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-[32px] border-2 border-[#0D3B2A]/10 p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#EBF9C8] text-[#0D3B2A] flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[#0D3B2A] mb-2">
            Order Confirmation Recorded
          </h1>
          <p className="text-sm text-[#4A5E54] mb-6">
            Reference ID: <strong className="font-mono text-[#0D3B2A]">{orderId?.toUpperCase()}</strong>.
            Check live dispatch updates anytime using your order number.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to={`/track-order?order=${encodeURIComponent((orderId || '').toUpperCase())}`}
              className="px-6 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold"
            >
              Track Order
            </Link>
            <Link
              to="/shop"
              className="px-6 py-3 rounded-full border-2 border-[#0D3B2A]/15 text-[#0D3B2A] text-sm font-extrabold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const whatsappDigits = settings.whatsappNumber.replace(/\D/g, '');
  const whatsappMessage = `Hi MAKH AND MORE! I just placed order ${order.orderNumber} for ₹${order.total} (${order.paymentMethod.toUpperCase()}). Name: ${order.customerName}, City: ${order.shippingAddress.city}. Please share dispatch updates here.`;
  const whatsappHref = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen py-7 sm:py-12">
      <div className="max-w-3xl mx-auto px-3.5 sm:px-6">
        {/* Celebratory Banner */}
        <div className="relative rounded-[34px] bg-gradient-to-br from-[#0D3B2A] via-[#175C41] to-[#23884D] text-white p-7 sm:p-10 mb-6 text-center overflow-hidden shadow-xl bg-dots-light print:hidden">
          <OrganicBlob
            fill="#B7E843"
            opacity={0.22}
            className="w-64 h-64 absolute -top-20 -right-16 pointer-events-none"
          />
          <AnimatedSparkle className="w-7 h-7 absolute top-6 left-8" color="#F4B926" />
          <AnimatedSparkle className="w-6 h-6 absolute bottom-6 right-10" color="#B7E843" delay={1} />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-[#B7E843] text-[#0D3B2A] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#B7E843]">
              Woohoo! Crunch Is On The Way
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-1.5">
              Order Confirmed!
            </h1>
            <p className="text-sm text-[#FFF9EE]/85 mt-2 max-w-md mx-auto">
              Order <strong className="font-mono text-[#F4B926]">{order.orderNumber}</strong> is
              queued for fresh packing by ASR Enterprises in Darbhanga, Bihar.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-[#25D366] text-white text-xs sm:text-sm font-extrabold hover:bg-[#1ebe5d] inline-flex items-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                Live Updates on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-3 rounded-full bg-white/15 text-white text-xs sm:text-sm font-extrabold hover:bg-white/25 inline-flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Printable Tax Invoice / Order Summary Card */}
        <div className="bg-white rounded-[32px] border-2 border-[#0D3B2A]/10 p-6 sm:p-8 shadow-sm print:shadow-none print:border-0">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#0D3B2A]/10">
            <div>
              <BrandLogo className="h-10 mb-2" />
              <p className="text-xs text-[#4A5E54] max-w-xs leading-relaxed">
                Owned & Packed by <strong className="text-[#0D3B2A]">ASR ENTERPRISES</strong>
                <br />
                {settings.address}
                <br />
                Support: {settings.supportPhone} • {settings.supportEmail}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[11px] uppercase tracking-wider text-[#23884D] font-extrabold">
                Order Receipt
              </p>
              <p className="font-mono text-lg font-extrabold text-[#0D3B2A] mt-0.5">
                {order.orderNumber}
              </p>
              <p className="text-xs text-[#4A5E54] mt-1">
                Payment:{' '}
                <strong className="uppercase text-[#0D3B2A]">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                </strong>
              </p>
              <p className="text-xs text-[#4A5E54]">
                Status: <strong className="capitalize text-[#23884D]">{order.orderStatus}</strong>
              </p>
            </div>
          </div>

          <div className="py-5 border-b border-[#0D3B2A]/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#23884D] mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Shipping Address
              </p>
              <p className="font-extrabold text-[#0D3B2A]">{order.shippingAddress.fullName}</p>
              <p className="text-[#4A5E54] text-xs mt-0.5 leading-relaxed">
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
                {order.shippingAddress.landmark ? ` (${order.shippingAddress.landmark})` : ''}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} –{' '}
                {order.shippingAddress.pincode}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#23884D] mb-1.5">
                Customer Contact
              </p>
              <p className="text-xs font-semibold text-[#12261E]">Phone: {order.customerPhone}</p>
              {order.customerEmail && (
                <p className="text-xs text-[#4A5E54] mt-0.5">Email: {order.customerEmail}</p>
              )}
              {order.whatsappVerified && (
                <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-[10px] font-extrabold">
                  ✓ Direct WhatsApp Verified
                </span>
              )}
            </div>
          </div>

          <div className="py-5 border-b border-[#0D3B2A]/10">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#23884D] mb-3">
              Items Ordered
            </p>
            <div className="space-y-3">
              {order.items.map((item, idx) => {
                const theme = getProductTheme({
                  slug: item.slug,
                  flavour: item.name,
                  category: item.slug,
                });
                return (
                  <div key={`${item.productId}-${idx}`} className="flex items-center gap-3.5">
                    <div
                      className={`w-13 h-13 rounded-2xl ${theme.stageBg} p-1.5 shrink-0 print:hidden`}
                    >
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-[#0D3B2A]">{item.name}</p>
                      <p className="text-xs text-[#4A5E54]">
                        {item.weight} × {item.quantity} @ ₹{item.price}
                      </p>
                    </div>
                    <div className="text-sm font-extrabold text-[#0D3B2A] tabular-nums">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-5 space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-[#4A5E54]">
              <span>Subtotal</span>
              <span className="tabular-nums font-bold text-[#12261E]">
                ₹{order.subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#23884D] font-extrabold">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span className="tabular-nums">-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-[#4A5E54]">
              <span>Shipping</span>
              <span className="tabular-nums font-bold">
                {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
              </span>
            </div>
            <div className="border-t border-[#0D3B2A]/10 pt-2.5 flex justify-between font-extrabold text-[#0D3B2A] text-base">
              <span>Total</span>
              <span className="tabular-nums text-lg">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <Link
            to={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
            className="px-7 py-3.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold hover:bg-[#175C41] inline-flex items-center gap-2 shadow-md"
          >
            <Truck className="w-4 h-4" />
            Track Order Status
          </Link>
          <Link
            to="/shop"
            className="px-7 py-3.5 rounded-full bg-white border-2 border-[#0D3B2A]/15 text-[#0D3B2A] text-sm font-extrabold hover:bg-[#EBF9C8] inline-flex items-center gap-2"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
