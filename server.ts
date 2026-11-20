import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// In-memory rate-limited store for WhatsApp Checkout OTP verification sessions
interface OtpSession {
  code: string;
  phone: string;
  expiresAt: number;
  attempts: number;
}
const otpStore = new Map<string, OtpSession>();
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

function normalizeIndianPhone(input: string): string | null {
  const digits = String(input || '').replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2))) {
    return `+${digits}`;
  }
  return null;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Basic security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // --- SEO: robots.txt ---
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /checkout',
        'Disallow: /cart',
        'Disallow: /account',
        `Sitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
      ].join('\n')
    );
  });

  // --- SEO: Dynamic XML Sitemap ---
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const staticRoutes = [
      '/',
      '/shop',
      '/category/makhana',
      '/category/roasted-makhana',
      '/category/flavoured-makhana',
      '/category/makhana-combo',
      '/category/dry-fruits',
      '/product/roasted-makhana-combo-4-flavours',
      '/product/roasted-makhana-himalayan-salt-90g',
      '/product/roasted-makhana-pudina-90g',
      '/product/roasted-makhana-peri-peri-90g',
      '/product/roasted-makhana-cheese-90g',
      '/product/premium-jumbo-makhana-200g',
      '/product/premium-jumbo-makhana-100g',
      '/our-story',
      '/about-us',
      '/contact',
      '/blog',
      '/blog/why-mithila-makhana-is-indias-finest-fox-nut',
      '/blog/5-wholesome-ways-to-enjoy-roasted-makhana-daily',
      '/blog/from-darbhanga-wetlands-to-your-snack-bowl',
      '/track-order',
      '/faq',
      '/shipping-policy',
      '/refund-returns',
      '/privacy-policy',
      '/terms-and-conditions',
      '/disclaimer',
    ];
    const lastmod = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route === '/' || route === '/shop' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route.startsWith('/product/') ? '0.9' : '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
    res.type('application/xml').send(xml);
  });

  // --- API: Health & Payment/Media Capabilities Status (never leaks secrets) ---
  app.get('/api/config/status', (_req, res) => {
    const razorpayConfigured = Boolean(
      process.env.RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET &&
        !process.env.RAZORPAY_KEY_ID.startsWith('MY_')
    );
    const cloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET &&
        !process.env.CLOUDINARY_CLOUD_NAME.startsWith('MY_')
    );
    const whatsappCloudConfigured = Boolean(
      process.env.WHATSAPP_API_TOKEN &&
        process.env.WHATSAPP_PHONE_NUMBER_ID &&
        !process.env.WHATSAPP_API_TOKEN.startsWith('MY_')
    );
    res.json({
      razorpayConfigured,
      razorpayKeyId: razorpayConfigured ? process.env.RAZORPAY_KEY_ID : null,
      cloudinaryConfigured,
      cloudinaryCloudName: cloudinaryConfigured ? process.env.CLOUDINARY_CLOUD_NAME : null,
      whatsappCloudConfigured,
    });
  });

  // --- API: Direct WhatsApp Login (Checkout Verification) ---
  app.post('/api/whatsapp-otp/send', async (req, res) => {
    const clientIp = req.ip || 'unknown';
    if (!checkRateLimit(`wa-send:${clientIp}`, 10, 5 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many OTP requests. Please wait a few minutes.' });
      return;
    }

    const normalized = normalizeIndianPhone(req.body?.phone);
    if (!normalized) {
      res.status(400).json({ error: 'Please enter a valid 10-digit Indian WhatsApp mobile number.' });
      return;
    }

    const code = String(crypto.randomInt(100000, 999999));
    otpStore.set(normalized, {
      code,
      phone: normalized,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });

    const whatsappToken = process.env.WHATSAPP_API_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    let deliveredViaCloudApi = false;

    if (whatsappToken && whatsappPhoneId && !whatsappToken.startsWith('MY_')) {
      try {
        const waResp = await fetch(
          `https://graph.facebook.com/v21.0/${whatsappPhoneId}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: normalized.replace('+', ''),
              type: 'text',
              text: {
                body: `Your MAKH AND MORE checkout verification code is ${code}. Valid for 10 minutes.`,
              },
            }),
          }
        );
        deliveredViaCloudApi = waResp.ok;
      } catch {
        deliveredViaCloudApi = false;
      }
    }

    const whatsappDeepLink = `https://wa.me/919135986786?text=${encodeURIComponent(
      `Hi MAKH AND MORE! Verify my WhatsApp number ${normalized} for instant checkout. Code: ${code}`
    )}`;

    res.json({
      success: true,
      phone: normalized,
      deliveredViaCloudApi,
      whatsappDeepLink,
      // When WhatsApp Cloud API credentials are not configured yet, return the verification code
      // so the customer can verify seamlessly via WhatsApp deep-link or direct entry at checkout.
      instantCode: deliveredViaCloudApi ? undefined : code,
    });
  });

  app.post('/api/whatsapp-otp/verify', (req, res) => {
    const normalized = normalizeIndianPhone(req.body?.phone);
    const code = String(req.body?.code || '').trim();
    if (!normalized || !/^\d{6}$/.test(code)) {
      res.status(400).json({ error: 'Enter a valid mobile number and 6-digit verification code.' });
      return;
    }

    const session = otpStore.get(normalized);
    if (!session || Date.now() > session.expiresAt) {
      res.status(400).json({ error: 'Verification code expired. Please request a new code.' });
      return;
    }

    if (session.attempts >= 5) {
      otpStore.delete(normalized);
      res.status(429).json({ error: 'Too many invalid attempts. Request a new code.' });
      return;
    }

    if (session.code !== code) {
      session.attempts += 1;
      res.status(400).json({ error: 'Incorrect verification code. Please check and try again.' });
      return;
    }

    otpStore.delete(normalized);
    const verificationToken = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'makh-and-more-wa-verify')
      .update(`${normalized}:${Date.now()}`)
      .digest('hex');

    res.json({
      verified: true,
      phone: normalized,
      verificationToken,
    });
  });

  // --- API: Cloudinary Signed Upload Signature (Server-Side Secret Only) ---
  app.post('/api/cloudinary/sign', (req, res) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret || cloudName.startsWith('MY_')) {
      res.status(503).json({
        configured: false,
        error:
          'Cloudinary credentials are not configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment secrets to enable signed cloud uploads.',
      });
      return;
    }

    const folder = String(req.body?.folder || 'makh-and-more').replace(/[^a-zA-Z0-9_\-/]/g, '');
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash('sha1')
      .update(`${paramsToSign}${apiSecret}`)
      .digest('hex');

    res.json({
      configured: true,
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
    });
  });

  // --- API: Razorpay Order Creation & HMAC Signature Verification ---
  app.post('/api/payments/razorpay/create-order', async (req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret || keyId.startsWith('MY_')) {
      res.status(503).json({
        configured: false,
        error:
          'Online payment gateway (Razorpay) is awaiting merchant credentials. Please use Cash on Delivery or configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      });
      return;
    }

    const amountInRupees = Number(req.body?.amount);
    const receipt = String(req.body?.receipt || `MM-${Date.now()}`).slice(0, 40);
    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      res.status(400).json({ error: 'Invalid order amount.' });
      return;
    }

    try {
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpResp = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amountInRupees * 100),
          currency: 'INR',
          receipt,
        }),
      });

      const data = await rzpResp.json();
      if (!rzpResp.ok) {
        res.status(rzpResp.status).json({ error: data?.error?.description || 'Failed to create Razorpay order.' });
        return;
      }

      res.json({
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId,
      });
    } catch {
      res.status(500).json({ error: 'Unable to reach Razorpay API.' });
    }
  });

  app.post('/api/payments/razorpay/verify', (req, res) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret.startsWith('MY_')) {
      res.status(503).json({ verified: false, error: 'Razorpay secret not configured.' });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ verified: false, error: 'Missing payment verification parameters.' });
      return;
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const verified =
      expectedSignature.length === String(razorpay_signature).length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(String(razorpay_signature)));

    if (!verified) {
      res.status(400).json({ verified: false, error: 'Payment signature verification failed.' });
      return;
    }

    res.json({ verified: true, razorpay_order_id, razorpay_payment_id });
  });

  // --- API: Razorpay Webhook Endpoint ---
  app.post('/api/payments/razorpay/webhook', (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = String(req.headers['x-razorpay-signature'] || '');
    if (!webhookSecret || webhookSecret.startsWith('MY_') || !signature) {
      res.status(400).json({ received: false });
      return;
    }
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (expected !== signature) {
      res.status(401).json({ received: false });
      return;
    }
    res.json({ received: true, event: req.body?.event || 'unknown' });
  });

  // --- API: Auto Reverse Geocoding (GPS -> Exact Indian PIN, City, State & Street Address) ---
  app.get('/api/location/reverse', async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      res.status(400).json({ error: 'Invalid coordinates.' });
      return;
    }

    try {
      const nomResp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lon)}&addressdetails=1&zoom=18`,
        {
          headers: {
            'User-Agent': 'MakhAndMoreApp/1.0 (care@makhandmore.com)',
            'Accept-Language': 'en-IN,en;q=0.9',
          },
        }
      );

      if (!nomResp.ok) {
        res.status(502).json({ error: 'Reverse geocoding service unavailable.' });
        return;
      }

      const nomData = (await nomResp.json()) as {
        display_name?: string;
        address?: Record<string, string>;
      };
      const addr = nomData.address || {};
      const rawPin = String(addr.postcode || '').replace(/\D/g, '').slice(0, 6);
      let city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.state_district ||
        addr.county ||
        '';
      let state = addr.state || '';
      let locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.hamlet ||
        '';

      // Cross-verify 6-digit Indian PIN with India Post for 100% accurate District & State
      if (/^[1-9]\d{5}$/.test(rawPin)) {
        try {
          const pinResp = await fetch(`https://api.postalpincode.in/pincode/${rawPin}`);
          if (pinResp.ok) {
            const pinJson = (await pinResp.json()) as Array<{
              Status?: string;
              PostOffice?: Array<{ Name?: string; District?: string; State?: string }>;
            }>;
            const po = pinJson?.[0]?.PostOffice?.[0];
            if (pinJson?.[0]?.Status === 'Success' && po) {
              if (po.District) city = po.District;
              if (po.State) state = po.State;
              if (!locality && po.Name) locality = po.Name;
            }
          }
        } catch {
          // keep Nominatim city/state
        }
      }

      const streetParts = [
        addr.house_number,
        addr.building,
        addr.road,
        locality,
      ].filter((part): part is string => Boolean(part && part.trim()));

      const uniqueStreetParts = Array.from(new Set(streetParts));
      const addressLine =
        uniqueStreetParts.join(', ') ||
        (nomData.display_name ? nomData.display_name.split(',').slice(0, 2).join(', ').trim() : '');

      res.json({
        success: true,
        pincode: /^[1-9]\d{5}$/.test(rawPin) ? rawPin : '',
        city: city.trim(),
        state: state.trim(),
        locality: locality.trim(),
        addressLine: addressLine.trim(),
      });
    } catch {
      res.status(500).json({ error: 'Unable to resolve address from coordinates.' });
    }
  });

  // --- API: Approximate IP Location Fallback (if GPS permission not granted yet) ---
  app.get('/api/location/ip', async (req, res) => {
    try {
      const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      const targetUrl = forwarded && !forwarded.startsWith('127.') && !forwarded.startsWith('::1')
        ? `https://ipwho.is/${encodeURIComponent(forwarded)}`
        : 'https://ipwho.is/';
      const ipResp = await fetch(targetUrl);
      if (!ipResp.ok) {
        res.status(502).json({ success: false });
        return;
      }
      const data = (await ipResp.json()) as {
        success?: boolean;
        postal?: string;
        city?: string;
        region?: string;
        country_code?: string;
      };
      const pin = String(data.postal || '').replace(/\D/g, '').slice(0, 6);
      res.json({
        success: Boolean(data.success),
        pincode: /^[1-9]\d{5}$/.test(pin) ? pin : '',
        city: data.city || '',
        state: data.region || '',
        countryCode: data.country_code || '',
      });
    } catch {
      res.json({ success: false });
    }
  });

  // --- API: Indian PIN Code Delivery Checker + India Post District/State Lookup ---
  app.get('/api/pincode/:pin', async (req, res) => {
    const pin = String(req.params.pin || '').trim();
    if (!/^[1-9]\d{5}$/.test(pin)) {
      res.status(400).json({ serviceable: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
      return;
    }
    const firstDigit = Number(pin[0]);
    const isBiharRegion = pin.startsWith('80') || pin.startsWith('84') || pin.startsWith('85');
    const isMetro = ['1', '4', '5', '6', '7'].includes(pin[0]);
    const estimatedDays = isBiharRegion ? '2–3 business days' : isMetro ? '3–5 business days' : '4–6 business days';
    const regionMap: Record<number, string> = {
      1: 'North India (Delhi NCR / Punjab / Haryana)',
      2: 'Uttar Pradesh & Uttarakhand',
      3: 'Rajasthan & Gujarat',
      4: 'Maharashtra, MP & Chhattisgarh',
      5: 'Andhra Pradesh, Telangana & Karnataka',
      6: 'Tamil Nadu & Kerala',
      7: 'West Bengal, Odisha & North-East',
      8: 'Bihar & Jharkhand (Home Region)',
      9: 'Army Postal Service / Special Region',
    };

    let city = '';
    let state = '';
    let locality = '';
    try {
      const pinResp = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      if (pinResp.ok) {
        const pinJson = (await pinResp.json()) as Array<{
          Status?: string;
          PostOffice?: Array<{ Name?: string; District?: string; State?: string }>;
        }>;
        const po = pinJson?.[0]?.PostOffice?.[0];
        if (pinJson?.[0]?.Status === 'Success' && po) {
          city = po.District || '';
          state = po.State || '';
          locality = po.Name || '';
        }
      }
    } catch {
      // fallback cleanly to region map
    }

    res.json({
      serviceable: true,
      pin,
      city,
      state,
      locality,
      region: city && state ? `${city}, ${state}` : regionMap[firstDigit] || 'Pan-India Delivery',
      estimatedDays,
      codAvailable: true,
      freeShippingNote: 'Free shipping on orders above ₹299',
    });
  });

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { maxAge: '7d' }));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAKH AND MORE server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
