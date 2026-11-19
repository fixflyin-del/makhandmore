export interface NutritionInfo {
  servingSize?: string;
  energy?: string;
  protein?: string;
  carbohydrates?: string;
  dietaryFiber?: string;
  totalFat?: string;
  sodium?: string;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  flavour?: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice: number;
  weight: string;
  sku: string;
  stock: number;
  primaryImage: string;
  imageCrop?: 'cheese' | 'pudina' | 'himalayan' | 'peri-peri' | 'none';
  cloudinaryPublicId?: string;
  gallery: string[];
  highlights: string[];
  ingredients: string;
  nutrition?: NutritionInfo;
  shelfLife: string;
  storage: string;
  faq: ProductFAQ[];
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  weight: string;
  price: number;
  salePrice: number;
  image: string;
  imageCrop?: Product['imageCrop'];
  quantity: number;
  stock: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface SavedAddress extends ShippingAddress {
  id: string;
  label: string;
  isDefault?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  addresses?: SavedAddress[];
  recentlyViewed?: string[];
  wishlistIds?: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'razorpay' | 'upi';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  whatsappVerified?: boolean;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courierName?: string;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrderTracking {
  orderNumber: string;
  phoneLast4: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  courierName?: string;
  trackingNumber?: string;
  itemCount: number;
  total: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  active: boolean;
  description?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  authorName: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase?: boolean;
  approved: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featuredImage: string;
  author: string;
  readTime: string;
  tags: string[];
  relatedProductSlugs: string[];
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  publishedAt: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image: string;
  order: number;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PolicyContent {
  shippingPolicy: string;
  refundReturns: string;
  privacyPolicy: string;
  termsAndConditions: string;
  disclaimer: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  announcementMessages: string[];
  freeShippingThreshold: number;
  standardShippingFee: number;
  bulkDiscountThreshold: number;
  bulkDiscountPercent: number;
  codEnabled: boolean;
  razorpayEnabled: boolean;
  whatsappNumber: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  supportHours: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTwitter: string;
  seoTitle: string;
  seoDescription: string;
  policies: PolicyContent;
  updatedAt?: unknown;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  createdAt?: unknown;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt?: unknown;
}

export interface WhatsAppSession {
  phone: string;
  verified: boolean;
  verificationToken: string;
  verifiedAt: number;
}
