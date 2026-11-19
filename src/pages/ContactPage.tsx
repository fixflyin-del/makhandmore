import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  AnimatedDotCluster,
  AnimatedSparkle,
  CurvedGuideArrow,
  WavySectionDivider,
} from '../components/BrandVisuals';
import { useStore } from '../context/StoreContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useSEO } from '../lib/seo';

export function ContactPage() {
  const { settings, showToast } = useStore();

  useSEO({
    title: 'Contact Us | MAKH AND MORE — ASR Enterprises, Darbhanga',
    description:
      'Contact MAKH AND MORE (ASR Enterprises) in Darbhanga, Bihar for order help, bulk gifting, or wholesale enquiries. Call/WhatsApp +91 9135 986 786 or email info@makhandmore.com.',
    canonicalPath: '/contact',
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Support',
    message: '',
    website: '', // honeypot spam guard
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Silent honeypot check
    if (form.website.trim().length > 0) {
      setSubmitted(true);
      return;
    }

    if (form.name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.message.trim().length < 5) {
      setError('Please enter a message (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    const enquiryId = `enq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim().slice(0, 120),
        email: form.email.trim().slice(0, 180),
        subject: form.subject.trim().slice(0, 160),
        message: form.message.trim().slice(0, 2500),
        status: 'new',
        createdAt: serverTimestamp(),
      };
      if (form.phone.trim()) {
        payload.phone = form.phone.trim().slice(0, 24);
      }

      await setDoc(doc(db, 'enquiries', enquiryId), payload);
      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: 'Order Support',
        message: '',
        website: '',
      });
      showToast('Thank you! Your message has been sent to MAKH AND MORE.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `enquiries/${enquiryId}`, false);
      setError('Could not submit your message right now. Please reach us directly on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappDigits = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <div className="bg-[#FFF9EE] pb-8 sm:pb-12 overflow-hidden">
      {/* Dotted Forest App Banner */}
      <section className="relative bg-gradient-to-br from-[#0D3B2A] via-[#134E38] to-[#1F6F49] text-[#FFF9EE] overflow-hidden">
        <div className="absolute inset-0 bg-dots-forest opacity-40 pointer-events-none" />
        <AnimatedDotCluster
          color="#B7E843"
          accentColor="#F4B926"
          className="w-20 h-20 absolute top-4 right-8 opacity-45 pointer-events-none hidden sm:block"
        />

        <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-7 sm:pb-9">
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-[#FFF9EE]/70 mb-2 flex items-center gap-2 font-medium"
          >
            <Link to="/" className="hover:text-[#B7E843] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#B7E843] font-bold">Contact Us</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#B7E843]/15 border border-[#B7E843]/35 text-[#B7E843] text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                We’re Here to Help
              </span>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold mt-2 leading-tight">
                Connect With <span className="text-[#B7E843]">MAKH AND MORE</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#FFF9EE]/80 mt-1.5 leading-relaxed">
                Have a question about your order, bulk corporate gifting, or wholesale Mithila
                Makhana supply? Reach our Darbhanga support team directly.
              </p>
            </div>
            <CurvedGuideArrow
              direction="down-right"
              color="#F4B926"
              className="w-20 h-12 hidden md:block shrink-0"
            />
          </div>
        </div>
        <WavySectionDivider fill="#FFF9EE" />
      </section>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
              <div className="bg-[#E2F6E7] rounded-[1.75rem] border border-[#0D3B2A]/8 p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-[#0D3B2A] text-[#B7E843] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-extrabold text-[#0D3B2A]">
                    Registered Business Address
                  </h2>
                  <p className="text-xs text-[#12261E]/80 mt-1 leading-relaxed">
                    {settings.address}
                  </p>
                </div>
              </div>

              <div className="bg-[#FFF1B8] rounded-[1.75rem] border border-[#0D3B2A]/8 p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-[#FF7F3E] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-extrabold text-[#0D3B2A]">
                    Phone & WhatsApp Support
                  </h2>
                  <a
                    href={`tel:${settings.supportPhone.replace(/\s+/g, '')}`}
                    className="text-sm font-extrabold text-[#0D3B2A] hover:text-[#23884D] hover:underline block mt-1 tabular-nums"
                  >
                    {settings.supportPhone}
                  </a>
                </div>
              </div>

              <div className="bg-[#FFE7D4] rounded-[1.75rem] border border-[#0D3B2A]/8 p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-[#F25C54] text-white flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-extrabold text-[#0D3B2A]">
                    Email Support
                  </h2>
                  <a
                    href={`mailto:${settings.supportEmail}`}
                    className="text-sm font-bold text-[#0D3B2A] hover:text-[#C83B24] hover:underline block mt-1 break-all"
                  >
                    {settings.supportEmail}
                  </a>
                </div>
              </div>

              <div className="bg-[#EBF9C8] rounded-[1.75rem] border border-[#0D3B2A]/8 p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-[#23884D] text-white flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-extrabold text-[#0D3B2A]">
                    Support Hours
                  </h2>
                  <p className="text-xs text-[#12261E]/80 mt-1 leading-relaxed">
                    {settings.supportHours}
                  </p>
                </div>
              </div>
            </div>

            {/* Instant WhatsApp Card */}
            <div className="relative overflow-hidden bg-[#0D3B2A] text-[#FFF9EE] rounded-[2rem] p-6 space-y-3 shadow-lg">
              <div className="absolute inset-0 bg-dots-forest opacity-35 pointer-events-none" />
              <AnimatedSparkle
                color="#B7E843"
                className="w-6 h-6 absolute top-4 right-5 pointer-events-none"
              />
              <h2 className="relative font-display text-xl font-extrabold">
                Fastest Response on WhatsApp
              </h2>
              <p className="relative text-xs text-[#FFF9EE]/80 leading-relaxed">
                Chat directly with our Darbhanga dispatch team for instant order status, bulk
                quotes, or delivery assistance.
              </p>
              <a
                href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                  'Hi MAKH AND MORE team, I have a question regarding your products.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-bold hover:bg-[#1ebe5d] transition-colors shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp ({settings.supportPhone})
              </a>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-[2.25rem] border-2 border-[#0D3B2A]/8 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
                  Send Us an Enquiry
                </h2>
                <p className="text-xs text-[#4A5E54] mt-1">
                  Our customer support specialists typically reply within 1 business day.
                </p>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-[11px] font-bold">
                Direct Team Inbox
              </span>
            </div>

            {submitted ? (
              <div className="rounded-[1.75rem] bg-[#E2F6E7] border border-[#23884D]/25 p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#23884D] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#0D3B2A]">
                  Message Received!
                </h3>
                <p className="text-sm text-[#12261E]/80 mt-2 max-w-md mx-auto">
                  Thank you for contacting MAKH AND MORE. Our team at ASR Enterprises will get back
                  to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-5 min-h-[44px] px-6 py-2.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-display font-bold hover:bg-[#175C41] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0D3B2A] mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full name"
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm text-[#12261E] focus:outline-none focus:border-[#23884D] focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0D3B2A] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm text-[#12261E] focus:outline-none focus:border-[#23884D] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0D3B2A] mb-1.5">
                      Phone / WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm text-[#12261E] focus:outline-none focus:border-[#23884D] focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0D3B2A] mb-1.5">
                      Topic *
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm text-[#12261E] focus:outline-none focus:border-[#23884D] focus:bg-white transition-colors"
                    >
                      <option value="Order Support">Order Support & Delivery</option>
                      <option value="Bulk & Corporate Gifting">Bulk & Corporate Gifting</option>
                      <option value="Wholesale / Retail Distribution">
                        Wholesale / Retail Enquiry
                      </option>
                      <option value="Product Feedback">Product Feedback</option>
                      <option value="General Enquiry">General Enquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D3B2A] mb-1.5">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Share your order number or question…"
                    className="w-full px-4 py-3 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm text-[#12261E] focus:outline-none focus:border-[#23884D] focus:bg-white transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-xs font-semibold text-[#C83B24] bg-[#FFE4E1] px-4 py-2.5 rounded-xl">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[48px] px-8 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-display font-bold hover:bg-[#175C41] transition-colors inline-flex items-center gap-2 shadow-md disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
