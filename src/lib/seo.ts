import { useEffect } from 'react';

export interface SEOConfig {
  title: string;
  description: string;
  image?: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'product';
  ogType?: 'website' | 'article' | 'product';
  canonicalPath?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function useSEO({
  title,
  description,
  image,
  ogImage,
  type,
  ogType,
  canonicalPath,
  noindex = false,
  jsonLd,
}: SEOConfig) {
  const resolvedImage =
    ogImage || image || '/assets/aistudio/makhana-makh-and-more-snacks_be51bb7d.webp';
  const resolvedType = ogType || type || 'website';

  useEffect(() => {
    const fullTitle = title.includes('MAKH AND MORE') ? title : `${title} | MAKH AND MORE`;
    document.title = fullTitle;

    const origin = window.location.origin;
    const pathname = canonicalPath || window.location.pathname;
    const canonicalUrl = `${origin}${pathname}`;
    const absoluteImage = resolvedImage.startsWith('http')
      ? resolvedImage
      : `${origin}${resolvedImage}`;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', resolvedType);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', absoluteImage);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', absoluteImage);

    let canonicalLink = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    const existingScripts = document.head.querySelectorAll('script[data-makh-seo-jsonld="true"]');
    existingScripts.forEach((node) => node.remove());

    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blocks.forEach((block) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-makh-seo-jsonld', 'true');
        script.textContent = JSON.stringify(block);
        document.head.appendChild(script);
      });
    }
  }, [title, description, resolvedImage, resolvedType, canonicalPath, noindex, jsonLd]);
}
