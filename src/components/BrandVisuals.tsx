import React, { useState } from 'react';
import { motion } from 'motion/react';
import { OFFICIAL_ASSETS } from '../data/seedData';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import { Product } from '../types';

export interface ProductVisualTheme {
  stageBg: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  ringColor: string;
}

/**
 * Returns a signature colourful backdrop & accent theme tailored to each
 * MAKH AND MORE product / flavour so every card feels alive and distinct.
 */
export function getProductTheme(product: Pick<Product, 'slug' | 'flavour' | 'category'>): ProductVisualTheme {
  const key = `${product.slug} ${product.flavour || ''} ${product.category}`.toLowerCase();

  if (key.includes('combo')) {
    return {
      stageBg: 'bg-gradient-to-br from-[#FFF1B8] via-[#E9F9C8] to-[#FFE1CC]',
      accentText: 'text-[#0D3B2A]',
      badgeBg: 'bg-[#0D3B2A]',
      badgeText: 'text-[#B7E843]',
      dotColor: '#F4B926',
      ringColor: '#23884D',
    };
  }
  if (key.includes('pudina')) {
    return {
      stageBg: 'bg-gradient-to-br from-[#DFF8E6] via-[#C6F2D4] to-[#EBF9C8]',
      accentText: 'text-[#156C3D]',
      badgeBg: 'bg-[#175C41]',
      badgeText: 'text-[#B7E843]',
      dotColor: '#23884D',
      ringColor: '#B7E843',
    };
  }
  if (key.includes('peri')) {
    return {
      stageBg: 'bg-gradient-to-br from-[#FFE3D8] via-[#FFD0BE] to-[#FFF0C2]',
      accentText: 'text-[#C83B24]',
      badgeBg: 'bg-[#F25C54]',
      badgeText: 'text-white',
      dotColor: '#FF7F3E',
      ringColor: '#F25C54',
    };
  }
  if (key.includes('cheese')) {
    return {
      stageBg: 'bg-gradient-to-br from-[#FFF2BF] via-[#FFE08A] to-[#FFE7D4]',
      accentText: 'text-[#B36208]',
      badgeBg: 'bg-[#FF7F3E]',
      badgeText: 'text-white',
      dotColor: '#F4B926',
      ringColor: '#FF7F3E',
    };
  }
  if (key.includes('himalayan')) {
    return {
      stageBg: 'bg-gradient-to-br from-[#E2F1FF] via-[#D0E8FF] to-[#FFF3E6]',
      accentText: 'text-[#18528C]',
      badgeBg: 'bg-[#0D3B2A]',
      badgeText: 'text-[#FFD45A]',
      dotColor: '#4A90D9',
      ringColor: '#F4B926',
    };
  }
  // Premium Jumbo Makhana / Raw / Dry Fruits
  return {
    stageBg: 'bg-gradient-to-br from-[#EBF9C8] via-[#DFF5D8] to-[#FFF2C7]',
    accentText: 'text-[#0D3B2A]',
    badgeBg: 'bg-[#23884D]',
    badgeText: 'text-white',
    dotColor: '#23884D',
    ringColor: '#F4B926',
  };
}

export function BrandLogo({
  variant = 'light-bg',
  className = 'h-10',
}: {
  variant?: 'light-bg' | 'dark-bg';
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`font-display font-extrabold tracking-tight whitespace-nowrap ${
          variant === 'dark-bg' ? 'text-[#B7E843]' : 'text-[#0D3B2A]'
        } text-xl`}
      >
        MAKH AND MORE
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 shrink-0 ${
        variant === 'dark-bg' ? 'bg-[#FFF9EE] px-3 py-1.5 rounded-2xl shadow-sm' : ''
      }`}
    >
      <img
        src={OFFICIAL_ASSETS.logo}
        alt="MAKH AND MORE Official Logo"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${className} w-auto object-contain select-none`}
      />
    </div>
  );
}

/**
 * Resilient product/editorial image with Cloudinary optimization,
 * zero-broken-image fallback, and precise focal framing for the
 * authentic 4-jar lineup photo so each flavour shows its real jar.
 */
export function SafeImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  imageCrop = 'none',
  width,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imageCrop?: Product['imageCrop'];
  width?: number;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);
  const optimizedSrc = getOptimizedImageUrl(src, width);

  if (error || !optimizedSrc) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-[#EBF9C8] to-[#FFF1C2] flex flex-col items-center justify-center p-6 text-center"
        role="img"
        aria-label={alt}
      >
        <MakhanaPuffIcon className="w-10 h-10 text-[#0D3B2A]/45 mb-2" />
        <span className="text-xs font-semibold text-[#0D3B2A]/70 line-clamp-2">{alt}</span>
      </div>
    );
  }

  // Frame the exact jar cleanly from the official 4-jar photo without generating fake packaging.
  if (imageCrop && imageCrop !== 'none' && src.includes('71Z2JzHPOTL')) {
    const cropMap: Record<string, string> = {
      cheese: 'object-[11%_50%] scale-[2.6]',
      pudina: 'object-[37%_50%] scale-[2.6]',
      himalayan: 'object-[63%_50%] scale-[2.6]',
      'peri-peri': 'object-[89%_50%] scale-[2.6]',
    };
    return (
      <div className="w-full h-full overflow-hidden rounded-2xl bg-white flex items-center justify-center shadow-xs">
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-transform duration-500 ${cropMap[imageCrop] || ''}`}
        />
      </div>
    );
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={className}
    />
  );
}

/** Playful hand-drawn style curved directional arrow with SVG draw animation */
export function CurvedGuideArrow({
  className = 'w-24 h-12',
  color = '#F4B926',
  direction = 'right',
}: {
  className?: string;
  color?: string;
  direction?: 'right' | 'down-right' | 'loop' | 'up-right';
}) {
  const paths: Record<typeof direction, { line: string; head: string; viewBox: string }> = {
    right: {
      viewBox: '0 0 130 56',
      line: 'M8 38 C38 8, 84 8, 116 28',
      head: 'M106 18 L119 29 L103 34',
    },
    'down-right': {
      viewBox: '0 0 110 80',
      line: 'M12 10 C18 46, 54 64, 96 60',
      head: 'M84 50 L99 60 L86 71',
    },
    loop: {
      viewBox: '0 0 140 72',
      line: 'M10 52 C40 62, 62 12, 46 20 C32 28, 72 56, 124 24',
      head: 'M111 19 L126 23 L118 36',
    },
    'up-right': {
      viewBox: '0 0 120 64',
      line: 'M10 54 C46 52, 76 34, 106 14',
      head: 'M92 12 L108 13 L103 28',
    },
  };

  const spec = paths[direction];

  return (
    <svg viewBox={spec.viewBox} fill="none" className={className} aria-hidden="true">
      <motion.path
        d={spec.line}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="6 6"
        initial={{ pathLength: 0, opacity: 0.35 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.95, ease: 'easeOut' }}
      />
      <motion.path
        d={spec.head}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.65, duration: 0.25 }}
      />
    </svg>
  );
}

/** Floating decorative dots cluster */
export function AnimatedDotCluster({
  className = 'w-20 h-20',
  color = '#B7E843',
  accentColor = '#F4B926',
}: {
  className?: string;
  color?: string;
  accentColor?: string;
}) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={`${className} animate-drift-dots`} aria-hidden="true">
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3].map((col) => {
          const isAccent = (row + col) % 5 === 0;
          return (
            <circle
              key={`${row}-${col}`}
              cx={12 + col * 24}
              cy={12 + row * 24}
              r={isAccent ? 4.2 : 2.8}
              fill={isAccent ? accentColor : color}
              fillOpacity={isAccent ? 0.9 : 0.6}
            />
          );
        })
      )}
    </svg>
  );
}

/** Crisp 4-point animated vector sparkle */
export function AnimatedSparkle({
  className = 'w-6 h-6',
  color = '#F4B926',
  delay = 0,
}: {
  className?: string;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.svg
      viewBox="0 0 36 36"
      fill="none"
      className={className}
      aria-hidden="true"
      animate={{ scale: [0.88, 1.12, 0.88], rotate: [0, 14, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <path
        d="M18 2 C19.8 11.4 24.6 16.2 34 18 C24.6 19.8 19.8 24.6 18 34 C16.2 24.6 11.4 19.8 2 18 C11.4 16.2 16.2 11.4 18 2Z"
        fill={color}
      />
    </motion.svg>
  );
}

/** Orbiting decorative circles around product photography */
export function OrbitCircles({
  className = 'w-full h-full',
  dotColor = '#F4B926',
  ringColor = '#23884D',
}: {
  className?: string;
  dotColor?: string;
  ringColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <circle
        cx="120"
        cy="120"
        r="96"
        stroke={ringColor}
        strokeOpacity="0.22"
        strokeWidth="2"
        strokeDasharray="6 8"
      />
      <circle cx="38" cy="64" r="6" fill={dotColor} fillOpacity="0.85" />
      <circle cx="206" cy="84" r="4.5" fill={ringColor} fillOpacity="0.65" />
      <circle cx="192" cy="186" r="7" fill={dotColor} fillOpacity="0.7" />
      <circle cx="52" cy="182" r="4" fill="#F25C54" fillOpacity="0.65" />
    </svg>
  );
}

/** Smooth organic wavy divider between colourful sections */
export function WavySectionDivider({
  fill = '#FFF9EE',
  bgClass = 'bg-transparent',
  flip = false,
}: {
  fill?: string;
  bgClass?: string;
  flip?: boolean;
}) {
  return (
    <div
      className={`w-full overflow-hidden leading-none pointer-events-none select-none ${bgClass} ${
        flip ? 'rotate-180' : ''
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 72"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-7 sm:h-11 block"
      >
        <path
          d="M0 32 C220 76, 460 -8, 720 34 C980 76, 1220 4, 1440 36 L1440 72 L0 72 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

/** Organic floating gradient blob */
export function OrganicBlob({
  className = 'w-64 h-64',
  fill = '#B7E843',
  opacity = 0.28,
}: {
  className?: string;
  fill?: string;
  opacity?: number;
}) {
  return (
    <svg viewBox="0 0 220 220" fill="none" className={className} aria-hidden="true">
      <path
        d="M174.5 41.2C196.2 64.9 205.4 102.7 193.5 135.7C181.6 168.7 148.6 196.9 111.8 201.4C75 205.9 34.4 186.7 18.8 154.9C3.2 123.1 12.6 78.7 37.8 49.4C63 20.1 104 5.9 138.6 14.3C152.7 17.7 164.6 30.3 174.5 41.2Z"
        fill={fill}
        fillOpacity={opacity}
      />
    </svg>
  );
}

export function MakhanaPuffIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="26" fill="currentColor" fillOpacity="0.14" />
      <path
        d="M32 10C20.5 10 11 19 11 31.5C11 43.5 20.5 54 32 54C43.5 54 53 43.5 53 31.5C53 19 43.5 10 32 10Z"
        stroke="currentColor"
        strokeWidth="2.6"
      />
      <path
        d="M23 24C25.5 27 28.5 28.5 32 28.5C35.5 28.5 38.5 27 41 24"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="37" r="2.4" fill="currentColor" />
      <circle cx="38" cy="39" r="2" fill="currentColor" />
      <circle cx="32" cy="44" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function FloatingLotusLeaf({
  className = 'w-20 h-20',
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.svg
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden="true"
      animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <path
        d="M14 64C14 34 36 14 66 14C66 44 46 66 14 64Z"
        fill="#B7E843"
        fillOpacity="0.35"
        stroke="#23884D"
        strokeWidth="2"
      />
      <path
        d="M16 62L58 20"
        stroke="#0D3B2A"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M30 48L32 32M42 36L54 34"
        stroke="#0D3B2A"
        strokeOpacity="0.35"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

export function FarmToHomeArrow({ className = 'w-32 h-14' }: { className?: string }) {
  return <CurvedGuideArrow className={className} color="#F4B926" direction="loop" />;
}
