import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Droplets,
  HeartHandshake,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  AnimatedDotCluster,
  AnimatedSparkle,
  CurvedGuideArrow,
  FloatingLotusLeaf,
  OrbitCircles,
  OrganicBlob,
  SafeImage,
  WavySectionDivider,
} from '../components/BrandVisuals';
import { useStore } from '../context/StoreContext';
import { OFFICIAL_ASSETS } from '../data/seedData';
import { useSEO } from '../lib/seo';

export function OurStoryPage() {
  useSEO({
    title: 'Our Story — From Mithila Farms to Your Home | MAKH AND MORE',
    description:
      'Discover how MAKH AND MORE by ASR Enterprises partners directly with Mithila makhana farmers in Darbhanga, Bihar to bring pure, jumbo, slow-roasted fox nuts to Indian homes.',
    canonicalPath: '/our-story',
    ogImage: OFFICIAL_ASSETS.farmer,
  });

  const journeySteps = [
    {
      step: '01',
      title: 'Harvested in Mithila’s Freshwater Wetlands',
      text: 'Our journey begins in the historic lotus ponds of Darbhanga, Bihar. Skilled farming families wade through shallow wetlands with hand-woven bamboo baskets to gather mature dark lotus seeds from the pond floor.',
      icon: Droplets,
      cardBg: 'bg-[#E2F6E7]',
      iconBg: 'bg-[#0D3B2A] text-[#B7E843]',
      stepColor: 'text-[#156C3D]',
    },
    {
      step: '02',
      title: 'Sun-Dried, Size-Graded & Traditionally Popped',
      text: 'Every batch is cleaned, sun-dried to precise moisture levels, sieved for jumbo kernel uniformity, and expertly popped over heated iron pans until each seed blooms into a crisp pearl-white puff.',
      icon: Sparkles,
      cardBg: 'bg-[#FFF1B8]',
      iconBg: 'bg-[#FF7F3E] text-white',
      stepColor: 'text-[#B36208]',
    },
    {
      step: '03',
      title: 'Slow-Roasted & Hygienically Packed by ASR Enterprises',
      text: 'At our Darbhanga facility, we sort out broken kernels, slow-roast without deep frying, tumble with clean Indian spice blends, and seal immediately in airtight jars and zip-lock pouches.',
      icon: ShieldCheck,
      cardBg: 'bg-[#FFE7D4]',
      iconBg: 'bg-[#F25C54] text-white',
      stepColor: 'text-[#C83B24]',
    },
    {
      step: '04',
      title: 'Delivered Fresh to Modern Indian Homes',
      text: 'By cutting out middlemen and long warehouse storage, MAKH AND MORE brings genuinely fresh Mithila crunch straight from Bihar’s heartland to your tea table, work desk, and kitchen.',
      icon: HeartHandshake,
      cardBg: 'bg-[#EBF9C8]',
      iconBg: 'bg-[#23884D] text-white',
      stepColor: 'text-[#0D3B2A]',
    },
  ];

  return (
    <div className="bg-[#FFF9EE] overflow-hidden">
      {/* Vibrant Dotted Forest Hero */}
      <section className="relative bg-gradient-to-br from-[#0D3B2A] via-[#124B36] to-[#1D6A46] text-[#FFF9EE] overflow-hidden">
        <div className="absolute inset-0 bg-dots-forest opacity-40 pointer-events-none" />
        <OrganicBlob
          fill="#B7E843"
          opacity={0.14}
          className="w-80 h-80 absolute -top-24 -right-20 pointer-events-none"
        />
        <AnimatedDotCluster
          color="#B7E843"
          accentColor="#F4B926"
          className="w-24 h-24 absolute bottom-10 left-4 opacity-50 pointer-events-none hidden sm:block"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B7E843]/15 border border-[#B7E843]/35 text-[#B7E843] text-xs font-bold tracking-wide">
              <MapPin className="w-3.5 h-3.5" />
              Proudly Crafted in Mithila · Darbhanga, Bihar
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.04] tracking-tight">
              From Mithila’s Sacred{' '}
              <span className="text-[#B7E843]">Wetlands</span> to Your Snack Bowl.
            </h1>

            <p className="text-base text-[#FFF9EE]/85 leading-relaxed max-w-xl">
              MAKH AND MORE was born in Darbhanga with a single belief: India deserves makhana that
              tastes as fresh, bold, and pure as the harvest our Mithila farmers take pride in every
              season.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/shop"
                className="min-h-[46px] px-7 py-3 rounded-full bg-[#B7E843] text-[#0D3B2A] font-display font-bold text-sm hover:bg-[#c8f261] transition-all shadow-lg shadow-black/15 inline-flex items-center gap-2"
              >
                Explore the Harvest
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about-us"
                className="min-h-[46px] px-7 py-3 rounded-full bg-white/10 border border-white/25 text-[#FFF9EE] font-semibold text-sm hover:bg-white/20 transition-colors inline-flex items-center"
              >
                About ASR Enterprises
              </Link>
              <CurvedGuideArrow
                direction="right"
                color="#F4B926"
                className="w-20 h-10 hidden sm:block"
              />
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <AnimatedSparkle
              color="#F4B926"
              className="w-8 h-8 absolute -top-3 -left-2 z-10 pointer-events-none"
            />
            <div className="rounded-[2rem] overflow-hidden border-4 border-[#B7E843]/40 shadow-2xl bg-[#09291D]">
              <SafeImage
                src={OFFICIAL_ASSETS.farmer}
                alt="Mithila farmers harvesting makhana in Darbhanga ponds"
                className="w-full h-[290px] sm:h-[410px] object-cover"
                priority
              />
            </div>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-[#FFF9EE]/90">
              <Leaf className="w-3.5 h-3.5 text-[#B7E843] shrink-0" />
              Traditional lotus seed harvesting in the fertile wetlands of Mithila, Bihar.
            </div>
          </div>
        </div>

        <WavySectionDivider fill="#FFF9EE" />
      </section>

      {/* Colourful 4-Step Farm-to-Home Journey */}
      <section className="relative py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#23884D]">
              <Sparkles className="w-3.5 h-3.5 text-[#F4B926]" />
              Farm-to-Home Craft
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B2A] mt-2 leading-tight">
              Four Careful Steps Behind Every Crisp Kernel
            </h2>
          </div>
          <CurvedGuideArrow
            direction="down-right"
            color="#23884D"
            className="w-24 h-14 hidden md:block shrink-0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {journeySteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.07, duration: 0.45 }}
                className={`relative overflow-hidden ${item.cardBg} rounded-[2rem] border border-[#0D3B2A]/8 p-6 sm:p-8 shadow-xs flex flex-col gap-4`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-2xl font-extrabold tracking-tight ${item.stepColor}`}
                  >
                    {item.step}
                  </span>
                  <div
                    className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-sm`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0D3B2A] leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-[#12261E]/80 leading-relaxed">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Split Feature: Jumbo + Flavours */}
      <section className="pb-16 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white rounded-[2.25rem] border-2 border-[#0D3B2A]/8 p-6 sm:p-10 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center overflow-hidden">
          <FloatingLotusLeaf className="w-20 h-20 absolute -top-4 -right-4 opacity-55 pointer-events-none" />

          <div className="lg:col-span-5">
            <div className="relative rounded-[1.75rem] bg-gradient-to-br from-[#EBF9C8] via-[#FFF1B8] to-[#FFE7D4] p-6 sm:p-8 flex items-center justify-center overflow-hidden">
              <OrbitCircles
                dotColor="#FF7F3E"
                ringColor="#23884D"
                className="w-72 h-72 absolute opacity-65"
              />
              <SafeImage
                src={OFFICIAL_ASSETS.heroSnacks}
                alt="MAKH AND MORE Jumbo Makhana pouch and bowl"
                className="relative z-10 w-full max-h-72 object-contain rounded-2xl drop-shadow-md"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E2F6E7] text-[#156C3D] text-xs font-extrabold uppercase tracking-wider">
              Healthy Snacking Redefined
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B2A] leading-tight">
              Not Just Makhana — It’s a Flavour Experience.
            </h2>
            <p className="text-sm sm:text-base text-[#4A5E54] leading-relaxed">
              Whether you prefer raw Jumbo Mithila Makhana to roast in desi ghee at home or
              ready-to-eat jars in Pudina, Peri Peri, Cheese, and Himalayan Salt, every pack upholds
              the same uncompromising promise: 100% natural, gluten-free, hygienically processed,
              and rooted in Mithila’s authentic soil.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-[#EBF9C8]">
                <p className="font-display text-2xl font-extrabold text-[#0D3B2A] tabular-nums">
                  100%
                </p>
                <p className="text-xs font-semibold text-[#156C3D] mt-0.5">
                  Natural Mithila Origin
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFF1B8]">
                <p className="font-display text-2xl font-extrabold text-[#0D3B2A] tabular-nums">
                  0%
                </p>
                <p className="text-xs font-semibold text-[#B36208] mt-0.5">
                  Deep Frying or Polish
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFE7D4] col-span-2 sm:col-span-1">
                <p className="font-display text-2xl font-extrabold text-[#0D3B2A]">Direct</p>
                <p className="text-xs font-semibold text-[#C83B24] mt-0.5">
                  Darbhanga Farm Sourcing
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/shop"
                className="min-h-[46px] inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-display font-bold hover:bg-[#175C41] transition-colors shadow-md"
              >
                Shop All Makhana Packs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function AboutUsPage() {
  const { settings } = useStore();

  useSEO({
    title: 'About Us — ASR Enterprises | MAKH AND MORE',
    description:
      'Learn about MAKH AND MORE, an authentic Mithila Makhana D2C brand owned and operated by ASR Enterprises in Darbhanga, Bihar.',
    canonicalPath: '/about-us',
    ogImage: OFFICIAL_ASSETS.jumboPouch,
  });

  const pillars = [
    {
      title: 'Authentic Bihar Origin',
      desc: 'Headquartered in Vill. Jatuka, Darbhanga, Bihar — the heart of India’s Mithila Makhana belt — giving us direct proximity to fresh seasonal harvests.',
      icon: MapPin,
      bg: 'bg-[#E2F6E7]',
      iconStyle: 'bg-[#0D3B2A] text-[#B7E843]',
    },
    {
      title: 'Strict Hygiene & Grading',
      desc: 'Every batch is cleaned, hand-checked for uniform jumbo size, slow-roasted in controlled batches, and sealed in food-grade jars and resealable zip pouches.',
      icon: ShieldCheck,
      bg: 'bg-[#FFF1B8]',
      iconStyle: 'bg-[#FF7F3E] text-white',
    },
    {
      title: 'Clean-Label Natural Ingredients',
      desc: 'No artificial colours, no unnecessary fillers, and zero deep frying — just honest ingredients that let real Mithila makhana shine.',
      icon: Leaf,
      bg: 'bg-[#EBF9C8]',
      iconStyle: 'bg-[#23884D] text-white',
    },
    {
      title: 'Customer-First D2C Promise',
      desc: 'Fast Pan-India dispatch, Free Shipping above ₹299, 20% off on orders of ₹599+, and responsive WhatsApp & phone support directly from our team.',
      icon: Award,
      bg: 'bg-[#FFE7D4]',
      iconStyle: 'bg-[#F25C54] text-white',
    },
  ];

  return (
    <div className="bg-[#FFF9EE] pb-16 sm:pb-24 overflow-hidden">
      {/* Compact Dotted Header Strip */}
      <section className="relative bg-gradient-to-br from-[#0D3B2A] to-[#1A5E42] text-[#FFF9EE] overflow-hidden">
        <div className="absolute inset-0 bg-dots-forest opacity-35 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16">
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-[#FFF9EE]/70 mb-4 flex items-center gap-2 font-medium"
          >
            <Link to="/" className="hover:text-[#B7E843] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#B7E843] font-bold">About Us</span>
          </nav>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#B7E843]/15 border border-[#B7E843]/35 text-[#B7E843] text-xs font-bold uppercase tracking-wider">
            Owned & Operated by ASR ENTERPRISES
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold leading-tight mt-3 max-w-3xl">
            Bringing Mithila’s Heritage Super-Snack to Every Indian Pantry.
          </h1>
        </div>
        <WavySectionDivider fill="#FFF9EE" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-14">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-base text-[#12261E]/85 leading-relaxed">
              <strong className="text-[#0D3B2A]">MAKH AND MORE</strong> is the flagship consumer
              food brand of <strong className="text-[#0D3B2A]">ASR ENTERPRISES</strong>, based in
              Darbhanga, Bihar. Founded to bridge the gap between traditional Mithila makhana farmers
              and health-conscious modern families, we focus on consistent jumbo kernel grading,
              clean slow-roasting, and bold yet balanced flavours.
            </p>
            <p className="text-sm sm:text-base text-[#4A5E54] leading-relaxed">
              From raw 100g and 200g Premium Jumbo Makhana pouches for traditional cooking to our
              4-Flavour Roasted Collection (Pudina, Peri Peri, Cheese, and Himalayan Salt), every
              jar reflects our tagline:{' '}
              <em className="font-semibold text-[#0D3B2A]">Healthy Snacking Redefined.</em>
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-[#0D3B2A] font-semibold">
              <li className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 border border-[#0D3B2A]/8 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#23884D] shrink-0" />
                Direct sourcing from Darbhanga wetlands
              </li>
              <li className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 border border-[#0D3B2A]/8 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#23884D] shrink-0" />
                Hygienically roasted & sealed fresh
              </li>
              <li className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 border border-[#0D3B2A]/8 shadow-xs sm:col-span-2">
                <CheckCircle2 className="w-4 h-4 text-[#23884D] shrink-0" />
                Transparent pricing, COD & Pan-India doorstep shipping
              </li>
            </ul>
          </div>

          <div className="lg:col-span-5">
            <div className="relative bg-gradient-to-br from-[#FFF1B8] via-[#FFE7D4] to-[#EBF9C8] rounded-[2rem] border border-[#0D3B2A]/8 p-6 sm:p-8 shadow-sm overflow-hidden">
              <OrbitCircles
                dotColor="#23884D"
                ringColor="#FF7F3E"
                className="w-72 h-72 absolute inset-0 m-auto opacity-55"
              />
              <SafeImage
                src={OFFICIAL_ASSETS.flavourCollection}
                alt="MAKH AND MORE Flavoured Makhana Collection"
                className="relative z-10 w-full h-72 sm:h-80 object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>

        {/* 4 Colourful Brand Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className={`${p.bg} rounded-[1.75rem] border border-[#0D3B2A]/8 p-6 shadow-xs space-y-3`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${p.iconStyle} flex items-center justify-center shadow-xs`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-display text-lg font-extrabold text-[#0D3B2A]">{p.title}</h2>
                <p className="text-xs text-[#12261E]/75 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Official Business Details Box */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0D3B2A] to-[#195C41] text-[#FFF9EE] rounded-[2.25rem] p-7 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="absolute inset-0 bg-dots-forest opacity-35 pointer-events-none" />
          <AnimatedSparkle
            color="#B7E843"
            className="w-7 h-7 absolute top-5 right-6 opacity-80 pointer-events-none"
          />
          <div className="relative space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#B7E843]/15 text-[#B7E843] text-[11px] font-bold uppercase tracking-wider">
              Official Brand Information
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold">
              ASR ENTERPRISES — MAKH AND MORE
            </h2>
            <p className="text-sm text-[#FFF9EE]/85">{settings.address}</p>
            <p className="text-xs text-[#FFF9EE]/75 tabular-nums">
              Customer Care: {settings.supportPhone} • {settings.supportEmail}
            </p>
          </div>
          <div className="relative flex flex-wrap gap-3 shrink-0">
            <Link
              to="/shop"
              className="min-h-[44px] px-6 py-3 rounded-full bg-[#B7E843] text-[#0D3B2A] text-sm font-display font-bold hover:bg-[#c8f261] transition-colors inline-flex items-center gap-2"
            >
              Shop Products
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="min-h-[44px] px-6 py-3 rounded-full bg-white/10 border border-white/25 text-[#FFF9EE] text-sm font-semibold hover:bg-white/20 transition-colors inline-flex items-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
