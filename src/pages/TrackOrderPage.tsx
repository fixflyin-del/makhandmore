import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import {
  AlertCircle,
  Box,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  PackageCheck,
  Search,
  Truck,
  XCircle,
} from 'lucide-react';
import { AnimatedSparkle, OrganicBlob } from '../components/BrandVisuals';
import { useStore } from '../context/StoreContext';
import { db } from '../lib/firebase';
import { useSEO } from '../lib/seo';
import { OrderStatus, OrderTracking } from '../types';

const STATUS_STEPS: {
  key: OrderStatus;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'pending', label: 'Order Placed', desc: 'Received by ASR Enterprises', icon: Clock },
  {
    key: 'confirmed',
    label: 'Confirmed',
    desc: 'Verified & assigned to Mithila facility',
    icon: CheckCircle2,
  },
  {
    key: 'packed',
    label: 'Freshly Packed',
    desc: 'Quality-checked & tamper-sealed',
    icon: Box,
  },
  {
    key: 'shipped',
    label: 'Shipped',
    desc: 'Handed over to courier partner',
    icon: Truck,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    desc: 'Enjoy your Mithila crunch!',
    icon: PackageCheck,
  },
];

export function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const { settings } = useStore();
  const [orderInput, setOrderInput] = useState(searchParams.get('order') || '');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState<OrderTracking | null>(null);

  useSEO({
    title: 'Track Your Order | MAKH AND MORE',
    description:
      'Check live dispatch, courier, and delivery status for your MAKH AND MORE Mithila Makhana order using your Order Number.',
    canonicalPath: '/track-order',
  });

  const lookupOrder = async (rawOrderNum: string, last4Check?: string) => {
    const cleanNum = rawOrderNum.trim().toUpperCase();
    if (!cleanNum) {
      setError('Please enter your Order Number (e.g. MM-250101-AB12).');
      return;
    }
    setLoading(true);
    setError('');
    setTracking(null);

    try {
      const snap = await getDoc(doc(db, 'orderTracking', cleanNum));
      if (snap.exists()) {
        const data = snap.data() as OrderTracking;
        if (last4Check && last4Check.trim().length === 4 && data.phoneLast4 !== last4Check.trim()) {
          setError('The last 4 digits of your phone number do not match this order.');
          return;
        }
        setTracking(data);
        return;
      }

      const cached = sessionStorage.getItem(`makh_last_tracking_${cleanNum}`);
      if (cached) {
        const data = JSON.parse(cached) as OrderTracking;
        setTracking(data);
        return;
      }

      setError(`No order found with number "${cleanNum}". Please double-check your Order ID.`);
    } catch {
      setError(
        'Unable to fetch tracking details right now. Please try again or contact WhatsApp support.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = searchParams.get('order');
    if (initial) {
      lookupOrder(initial);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupOrder(orderInput, phoneLast4);
  };

  const currentStepIndex = tracking
    ? STATUS_STEPS.findIndex((s) => s.key === tracking.orderStatus)
    : -1;

  const whatsappDigits = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <div className="py-3.5 sm:py-6">
      <div className="max-w-3xl mx-auto px-3 sm:px-6">
        <div className="relative rounded-[24px] bg-gradient-to-br from-[#0D3B2A] via-[#175C41] to-[#23884D] text-white p-5 sm:p-7 text-center mb-4 overflow-hidden shadow-lg bg-dots-light">
          <OrganicBlob
            fill="#B7E843"
            opacity={0.22}
            className="w-48 h-48 absolute -top-20 -right-12 pointer-events-none"
          />
          <AnimatedSparkle className="w-5 h-5 absolute top-4 left-5" color="#F4B926" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#B7E843]/20 text-[#B7E843] text-[11px] font-extrabold">
              <Truck className="w-3.5 h-3.5" /> Live Dispatch Tracker
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-1.5">
              Track Your Crunch
            </h1>
            <p className="text-xs sm:text-sm text-[#FFF9EE]/85 mt-1 max-w-md mx-auto">
              Enter your MAKH AND MORE Order Number to check packing, courier, and delivery status.
            </p>
          </div>
        </div>

        {/* Search Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[24px] border-2 border-[#0D3B2A]/10 p-4 sm:p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="track-order-id"
                className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5"
              >
                Order Number *
              </label>
              <input
                id="track-order-id"
                type="text"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value.toUpperCase())}
                placeholder="e.g. MM-250115-X9K2"
                required
                className="w-full h-12 px-4 rounded-2xl border-2 border-[#0D3B2A]/12 bg-[#FFF9EE]/60 text-sm font-mono font-bold uppercase focus:outline-none focus:border-[#0D3B2A]"
              />
            </div>

            <div>
              <label
                htmlFor="track-phone-last4"
                className="block text-xs font-extrabold text-[#0D3B2A] mb-1.5"
              >
                Phone Last 4 (Optional)
              </label>
              <input
                id="track-phone-last4"
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={phoneLast4}
                onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="6786"
                className="w-full h-12 px-4 rounded-2xl border-2 border-[#0D3B2A]/12 bg-[#FFF9EE]/60 text-sm font-mono font-bold focus:outline-none focus:border-[#0D3B2A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full h-13 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold hover:bg-[#175C41] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Track Shipment
          </button>

          {error && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#FFE4E1] border border-[#F25C54]/25 text-xs font-bold text-[#C83B24] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Tracking Result */}
        {tracking && (
          <div className="mt-6 bg-white rounded-[30px] border-2 border-[#0D3B2A]/10 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#0D3B2A]/10">
              <div>
                <p className="text-[11px] text-[#23884D] uppercase tracking-wider font-extrabold">
                  Order Reference
                </p>
                <h2 className="font-mono text-2xl font-extrabold text-[#0D3B2A] mt-0.5">
                  {tracking.orderNumber}
                </h2>
              </div>
              <div className="text-left sm:text-right text-xs space-y-1">
                <p className="text-[#4A5E54] font-semibold">
                  Items: <strong className="text-[#0D3B2A] tabular-nums">{tracking.itemCount}</strong>{' '}
                  • Total:{' '}
                  <strong className="text-[#0D3B2A] tabular-nums">
                    ₹{tracking.total.toLocaleString('en-IN')}
                  </strong>
                </p>
                <p className="text-[#4A5E54] font-semibold">
                  Payment:{' '}
                  <span className="px-2 py-0.5 rounded-full bg-[#EBF9C8] font-extrabold uppercase text-[#0D3B2A]">
                    {tracking.paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            {tracking.orderStatus === 'cancelled' ? (
              <div className="my-6 p-5 rounded-2xl bg-[#FFE4E1] border border-[#F25C54]/25 flex items-center gap-3 text-[#C83B24]">
                <XCircle className="w-6 h-6 shrink-0" />
                <div>
                  <p className="font-extrabold text-sm">This order was cancelled</p>
                  <p className="text-xs mt-0.5 text-[#12261E]/80">
                    Need help or want to place a fresh order? Reach out to our Darbhanga support team.
                  </p>
                </div>
              </div>
            ) : (
              <div className="my-7 space-y-4">
                {STATUS_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const completed = index <= currentStepIndex;
                  const active = index === currentStepIndex;
                  return (
                    <div
                      key={step.key}
                      className={`flex items-start gap-4 p-3 rounded-2xl transition-colors ${
                        active ? 'bg-[#EBF9C8]/65' : ''
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          completed
                            ? 'bg-[#0D3B2A] text-[#B7E843]'
                            : 'bg-[#FFF9EE] text-[#4A5E54]/45 border border-[#0D3B2A]/12'
                        } ${active ? 'ring-4 ring-[#F4B926]/45' : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="pt-0.5">
                        <p
                          className={`font-display text-sm font-extrabold ${
                            completed ? 'text-[#0D3B2A]' : 'text-[#4A5E54]/55'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-[#4A5E54]">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {(tracking.courierName || tracking.trackingNumber) && (
              <div className="p-4 rounded-2xl bg-[#FFF1B8]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#4A5E54] font-semibold">Courier Partner: </span>
                  <strong className="text-[#0D3B2A]">{tracking.courierName || 'Assigned'}</strong>
                </div>
                {tracking.trackingNumber && (
                  <div>
                    <span className="text-[#4A5E54] font-semibold">AWB / Tracking No: </span>
                    <strong className="font-mono text-[#0D3B2A]">{tracking.trackingNumber}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-[#0D3B2A]/10 flex flex-wrap items-center justify-between gap-3">
              <a
                href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                  `Hi MAKH AND MORE! I would like an update on my order ${tracking.orderNumber}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E2F6E7] text-xs font-extrabold text-[#0D3B2A] hover:bg-[#B7E843] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#23884D]" />
                WhatsApp Support ({settings.supportPhone})
              </a>
              <Link to="/shop" className="text-xs font-extrabold text-[#0D3B2A] hover:text-[#23884D]">
                Shop More Flavours →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
