import crypto from 'crypto';
import express from 'express';

const app = express();
app.use(express.json({ limit: '2mb' }));

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
      res
        .status(rzpResp.status)
        .json({ error: data?.error?.description || 'Failed to create Razorpay order.' });
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

app.get('/api/pincode/:pin', (req, res) => {
  const pin = String(req.params.pin || '').trim();
  if (!/^[1-9]\d{5}$/.test(pin)) {
    res.status(400).json({ serviceable: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
    return;
  }
  const firstDigit = Number(pin[0]);
  const isBiharRegion = pin.startsWith('80') || pin.startsWith('84') || pin.startsWith('85');
  const isMetro = ['1', '4', '5', '6', '7'].includes(pin[0]);
  const estimatedDays = isBiharRegion
    ? '2–3 business days'
    : isMetro
      ? '3–5 business days'
      : '4–6 business days';
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
  res.json({
    serviceable: true,
    pin,
    region: regionMap[firstDigit] || 'Pan-India Delivery',
    estimatedDays,
    codAvailable: true,
    freeShippingNote: 'Free shipping on orders above ₹299',
  });
});

export default app;
