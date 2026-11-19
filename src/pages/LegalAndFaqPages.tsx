import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, HelpCircle, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import {
  AnimatedDotCluster,
  AnimatedSparkle,
  WavySectionDivider,
} from '../components/BrandVisuals';
import { useStore } from '../context/StoreContext';
import { GENERAL_FAQS } from '../data/seedData';
import { useSEO } from '../lib/seo';
import { PolicyContent } from '../types';

const FAQ_ACCENT_DOTS = ['#23884D', '#FF7F3E', '#F4B926', '#F25C54'];

export function FaqPage() {
  const { settings } = useStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: GENERAL_FAQS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }),
    []
  );

  useSEO({
    title: 'Frequently Asked Questions | MAKH AND MORE',
    description:
      'Answers about MAKH AND MORE Mithila Makhana sourcing, roasting process, free shipping above ₹299, 20% bulk offer, COD, and WhatsApp checkout.',
    canonicalPath: '/faq',
    jsonLd: faqSchema,
  });

  const whatsappDigits = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <div className="bg-[#FFF9EE] pb-8 sm:pb-12 overflow-hidden">
      {/* Dotted Forest FAQ Banner */}
      <section className="relative bg-gradient-to-br from-[#0D3B2A] via-[#134E38] to-[#23884D] text-[#FFF9EE] overflow-hidden">
        <div className="absolute inset-0 bg-dots-forest opacity-40 pointer-events-none" />
        <AnimatedDotCluster
          color="#B7E843"
          accentColor="#F4B926"
          className="w-20 h-20 absolute top-4 right-8 opacity-45 pointer-events-none hidden sm:block"
        />

        <div className="relative max-w-4xl mx-auto px-3.5 sm:px-6 pt-4 pb-6 sm:pt-7 sm:pb-9 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#B7E843]/15 border border-[#B7E843]/35 text-[#B7E843] text-[11px] font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            Help Center
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold mt-2 leading-tight">
            Frequently Asked <span className="text-[#B7E843]">Questions</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#FFF9EE]/80 mt-1.5 max-w-xl mx-auto">
            Everything you need to know about our Mithila Makhana harvest, delivery, and policies.
          </p>
        </div>
        <WavySectionDivider fill="#FFF9EE" />
      </section>

      <div className="max-w-3xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6">
        <div className="space-y-2.5">
          {GENERAL_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const dotColor = FAQ_ACCENT_DOTS[idx % FAQ_ACCENT_DOTS.length];
            return (
              <div
                key={idx}
                className={`rounded-[1.75rem] border transition-colors overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#23884D]/35 shadow-md'
                    : 'bg-white/90 border-[#0D3B2A]/10 shadow-xs hover:border-[#0D3B2A]/25'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full min-h-[56px] px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="font-display text-base sm:text-lg font-extrabold text-[#0D3B2A]">
                      {faq.question}
                    </span>
                  </span>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen
                        ? 'bg-[#0D3B2A] text-[#B7E843] rotate-180'
                        : 'bg-[#EBF9C8] text-[#0D3B2A]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-2 text-sm text-[#4A5E54] leading-relaxed border-t border-[#0D3B2A]/8">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Vibrant Support Box */}
        <div className="relative overflow-hidden mt-10 bg-gradient-to-br from-[#0D3B2A] to-[#1A5E42] text-[#FFF9EE] rounded-[2.25rem] p-7 sm:p-9 text-center shadow-xl">
          <div className="absolute inset-0 bg-dots-forest opacity-35 pointer-events-none" />
          <AnimatedSparkle
            color="#F4B926"
            className="w-7 h-7 absolute top-5 right-6 pointer-events-none"
          />
          <span className="relative inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#B7E843]">
            <Sparkles className="w-3.5 h-3.5" />
            Direct Darbhanga Support
          </span>
          <h2 className="relative font-display text-2xl sm:text-3xl font-extrabold mt-1">
            Still have a question?
          </h2>
          <p className="relative text-xs sm:text-sm text-[#FFF9EE]/80 mt-1.5 mb-6 max-w-md mx-auto">
            Our Darbhanga customer support team is happy to help via WhatsApp or email.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-bold inline-flex items-center gap-2 hover:bg-[#1ebe5d] shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
            <Link
              to="/contact"
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-white/10 border border-white/25 text-[#FFF9EE] text-xs font-bold hover:bg-white/20 inline-flex items-center"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PolicyPageProps {
  policyKey: keyof PolicyContent;
  title: string;
  canonicalPath: string;
  description: string;
}

export function PolicyPage({ policyKey, title, canonicalPath, description }: PolicyPageProps) {
  const { settings } = useStore();

  useSEO({
    title: `${title} | MAKH AND MORE`,
    description,
    canonicalPath,
  });

  const content = settings.policies?.[policyKey] || '';

  return (
    <div className="bg-[#FFF9EE] pb-8 sm:pb-12 overflow-hidden">
      <section className="relative bg-gradient-to-br from-[#0D3B2A] to-[#1A5E42] text-[#FFF9EE] overflow-hidden">
        <div className="absolute inset-0 bg-dots-forest opacity-35 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-3.5 sm:px-6 pt-4 pb-6 sm:pt-7 sm:pb-9">
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-[#FFF9EE]/70 mb-2 flex items-center gap-2 font-medium"
          >
            <Link to="/" className="hover:text-[#B7E843]">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#B7E843] font-bold">{title}</span>
          </nav>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#B7E843]/15 border border-[#B7E843]/35 text-[#B7E843] text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            ASR ENTERPRISES · Official Store Policy
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-2">{title}</h1>
        </div>
        <WavySectionDivider fill="#FFF9EE" />
      </section>

      <div className="max-w-3xl mx-auto px-3.5 sm:px-6 pt-4">
        <div className="bg-white rounded-[24px] border border-[#0D3B2A]/10 p-4 sm:p-7 shadow-sm">
          <div className="space-y-4 text-sm sm:text-base text-[#12261E]/85 leading-relaxed whitespace-pre-line">
            {content}
          </div>

          <div className="mt-10 p-5 rounded-[1.5rem] bg-[#EBF9C8]/65 border border-[#23884D]/15 text-xs text-[#0D3B2A]">
            <p className="font-bold">
              ASR ENTERPRISES — <span className="font-normal">{settings.address}</span>
            </p>
            <p className="mt-1 tabular-nums">
              Support: {settings.supportPhone} • {settings.supportEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
