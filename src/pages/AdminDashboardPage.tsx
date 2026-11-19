import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Database,
  Delete,
  Download,
  Edit3,
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { BrandLogo, SafeImage } from '../components/BrandVisuals';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { OFFICIAL_ASSETS } from '../data/seedData';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useSEO } from '../lib/seo';
import {
  BlogArticle,
  Category,
  ContactEnquiry,
  Coupon,
  HeroBanner,
  NewsletterSubscriber,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Review,
  StoreSettings,
  UserProfile,
} from '../types';

type AdminTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'categories'
  | 'coupons'
  | 'banners'
  | 'blogs'
  | 'reviews'
  | 'customers'
  | 'settings';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
];

const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

function toSlug(val: string): string {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const ADMIN_PIN = '9090';
const ADMIN_PIN_STORAGE_KEY = 'makh_admin_pin_unlocked';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const {
    products: storeProducts,
    categories: storeCategories,
    banners: storeBanners,
    blogs: storeBlogs,
    coupons: storeCoupons,
    reviews: storeReviews,
    settings,
    firestoreSeeded,
    seedFirestoreDatabase,
    refreshStore,
    showToast,
  } = useStore();

  useSEO({
    title: 'Admin Dashboard | MAKH AND MORE',
    description: 'Store management dashboard for MAKH AND MORE by ASR Enterprises.',
    canonicalPath: '/admin',
    noindex: true,
  });

  const [pinUnlocked, setPinUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_PIN_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [tab, setTab] = useState<AdminTab>('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Full Admin Firestore collections (including unpublished/inactive items)
  const [products, setProducts] = useState<Product[]>(storeProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>(storeCategories);
  const [coupons, setCoupons] = useState<Coupon[]>(storeCoupons);
  const [banners, setBanners] = useState<HeroBanner[]>(storeBanners);
  const [blogs, setBlogs] = useState<BlogArticle[]>(storeBlogs);
  const [reviews, setReviews] = useState<Review[]>(storeReviews);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  // Settings editor local copy
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [announcementsText, setAnnouncementsText] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Product editor modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productGalleryText, setProductGalleryText] = useState('');
  const [productHighlightsText, setProductHighlightsText] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  // Order detail/edit modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Category, Coupon, Banner, Blog editors
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogArticle | null>(null);
  const [blogTagsText, setBlogTagsText] = useState('');

  useEffect(() => {
    setSettingsForm(settings);
    setAnnouncementsText((settings.announcementMessages || []).join('\n'));
  }, [settings]);

  const loadAllAdminData = useCallback(async () => {
    if (!pinUnlocked) return;
    setLoadingData(true);
    try {
      const [
        prodSnap,
        ordSnap,
        catSnap,
        coupSnap,
        banSnap,
        blogSnap,
        revSnap,
        userSnap,
        enqSnap,
        subSnap,
      ] = await Promise.allSettled([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'coupons')),
        getDocs(collection(db, 'banners')),
        getDocs(collection(db, 'blogs')),
        getDocs(collection(db, 'reviews')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'enquiries')),
        getDocs(collection(db, 'subscribers')),
      ]);

      if (prodSnap.status === 'fulfilled' && !prodSnap.value.empty) {
        setProducts(prodSnap.value.docs.map((d) => ({ ...(d.data() as Product), id: d.id })));
      } else {
        setProducts(storeProducts);
      }
      if (ordSnap.status === 'fulfilled') {
        setOrders(
          ordSnap.value.docs
            .map((d) => ({ ...(d.data() as Order), id: d.id }))
            .sort((a, b) => String(b.orderNumber).localeCompare(String(a.orderNumber)))
        );
      }
      if (catSnap.status === 'fulfilled' && !catSnap.value.empty) {
        setCategories(
          catSnap.value.docs
            .map((d) => ({ ...(d.data() as Category), id: d.id }))
            .sort((a, b) => (a.order || 0) - (b.order || 0))
        );
      } else {
        setCategories(storeCategories);
      }
      if (coupSnap.status === 'fulfilled' && !coupSnap.value.empty) {
        setCoupons(coupSnap.value.docs.map((d) => ({ ...(d.data() as Coupon), id: d.id })));
      } else {
        setCoupons(storeCoupons);
      }
      if (banSnap.status === 'fulfilled' && !banSnap.value.empty) {
        setBanners(
          banSnap.value.docs
            .map((d) => ({ ...(d.data() as HeroBanner), id: d.id }))
            .sort((a, b) => (a.order || 0) - (b.order || 0))
        );
      } else {
        setBanners(storeBanners);
      }
      if (blogSnap.status === 'fulfilled' && !blogSnap.value.empty) {
        setBlogs(blogSnap.value.docs.map((d) => ({ ...(d.data() as BlogArticle), id: d.id })));
      } else {
        setBlogs(storeBlogs);
      }
      if (revSnap.status === 'fulfilled' && !revSnap.value.empty) {
        setReviews(revSnap.value.docs.map((d) => ({ ...(d.data() as Review), id: d.id })));
      } else {
        setReviews(storeReviews);
      }
      if (userSnap.status === 'fulfilled') {
        setCustomers(userSnap.value.docs.map((d) => ({ ...(d.data() as UserProfile), uid: d.id })));
      }
      if (enqSnap.status === 'fulfilled') {
        setEnquiries(enqSnap.value.docs.map((d) => ({ ...(d.data() as ContactEnquiry), id: d.id })));
      }
      if (subSnap.status === 'fulfilled') {
        setSubscribers(
          subSnap.value.docs.map((d) => ({ ...(d.data() as NewsletterSubscriber), id: d.id }))
        );
      }
    } finally {
      setLoadingData(false);
    }
  }, [
    pinUnlocked,
    storeProducts,
    storeCategories,
    storeCoupons,
    storeBanners,
    storeBlogs,
    storeReviews,
  ]);

  useEffect(() => {
    if (pinUnlocked) {
      loadAllAdminData();
    }
  }, [pinUnlocked, loadAllAdminData]);

  // Analytics KPIs
  const kpis = useMemo(() => {
    const validOrders = orders.filter((o) => o.orderStatus !== 'cancelled');
    const totalSales = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered').length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'cancelled').length;
    const lowStockCount = products.filter((p) => p.stock <= 10).length;
    return {
      totalSales,
      totalOrders: orders.length,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockCount,
    };
  }, [orders, products]);

  const statusChartData = useMemo(() => {
    return ORDER_STATUSES.map((status) => {
      const matching = orders.filter((o) => o.orderStatus === status);
      return {
        status: status.charAt(0).toUpperCase() + status.slice(1),
        orders: matching.length,
        revenue: matching.reduce((s, o) => s + (Number(o.total) || 0), 0),
      };
    });
  }, [orders]);

  // Cloudinary Image Upload Handler
  const handleCloudinaryUpload = async (
    file: File,
    folder: string,
    onSuccess: (url: string, publicId: string) => void
  ) => {
    setUploadingImage(true);
    try {
      const res = await uploadImageToCloudinary(file, folder);
      onSuccess(res.url, res.publicId);
      showToast('Image uploaded to Cloudinary!');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Cloudinary upload failed. You can also paste an image URL.',
        'error'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // --- CRUD HANDLERS ---

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      await seedFirestoreDatabase();
      await loadAllAdminData();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed', false);
      showToast('Seeding failed. Check admin permissions.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const openProductEditor = (product?: Product) => {
    if (product) {
      setEditingProduct({ ...product });
      setProductGalleryText((product.gallery || []).join('\n'));
      setProductHighlightsText((product.highlights || []).join('\n'));
    } else {
      setEditingProduct({
        id: '',
        name: '',
        slug: '',
        category: categories[0]?.slug || 'makhana',
        flavour: '',
        shortDescription: '',
        description: '',
        price: 299,
        salePrice: 239,
        weight: '90g Jar',
        sku: `MM-${Date.now().toString().slice(-5)}`,
        stock: 50,
        primaryImage: OFFICIAL_ASSETS.jumboPouch,
        gallery: [OFFICIAL_ASSETS.jumboPouch],
        highlights: ['100% Natural Mithila Origin', 'Gluten-Free & Hygienically Packed'],
        ingredients: 'Popped Lotus Seeds (Makhana)',
        shelfLife: '6 Months from date of packaging',
        storage: 'Store in a cool, dry place.',
        faq: [],
        seoTitle: '',
        seoDescription: '',
        published: true,
        featured: false,
        rating: 0,
        reviewCount: 0,
      });
      setProductGalleryText(OFFICIAL_ASSETS.jumboPouch);
      setProductHighlightsText('100% Natural Mithila Origin\nGluten-Free & Hygienically Packed');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingItem(true);
    try {
      const slug = toSlug(editingProduct.slug || editingProduct.name);
      const id = editingProduct.id || slug || `prod-${Date.now()}`;
      const existingSnap = await getDoc(doc(db, 'products', id));
      const price = Math.max(0, Number(editingProduct.price) || 0);
      const salePrice = Math.min(price, Math.max(0, Number(editingProduct.salePrice) || 0));

      const gallery = productGalleryText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10);
      const highlights = productHighlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12);

      // Strictly obeys firestore.rules isValidProduct allowlist (never includes imageCrop)
      const payload: Record<string, unknown> = {
        id,
        name: editingProduct.name.trim().slice(0, 160),
        slug,
        category: editingProduct.category.trim().slice(0, 80),
        flavour: (editingProduct.flavour || '').trim().slice(0, 80),
        shortDescription: (editingProduct.shortDescription || '').trim().slice(0, 400),
        description: (editingProduct.description || '').trim().slice(0, 5000),
        price,
        salePrice,
        weight: editingProduct.weight.trim().slice(0, 40),
        sku: editingProduct.sku.trim().slice(0, 64),
        stock: Math.max(0, Number(editingProduct.stock) || 0),
        primaryImage: editingProduct.primaryImage.trim().slice(0, 600),
        gallery: gallery.length > 0 ? gallery : [editingProduct.primaryImage.trim()],
        highlights,
        ingredients: (editingProduct.ingredients || '').trim().slice(0, 1000),
        shelfLife: (editingProduct.shelfLife || '').trim().slice(0, 120),
        storage: (editingProduct.storage || '').trim().slice(0, 300),
        faq: (editingProduct.faq || []).slice(0, 10),
        seoTitle: (editingProduct.seoTitle || '').trim().slice(0, 120),
        seoDescription: (editingProduct.seoDescription || '').trim().slice(0, 300),
        published: Boolean(editingProduct.published),
        featured: Boolean(editingProduct.featured),
        rating: Number(editingProduct.rating) || 0,
        reviewCount: Number(editingProduct.reviewCount) || 0,
        createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (editingProduct.cloudinaryPublicId) {
        payload.cloudinaryPublicId = editingProduct.cloudinaryPublicId.slice(0, 256);
      }
      if (editingProduct.nutrition) {
        payload.nutrition = editingProduct.nutrition;
      }

      await setDoc(doc(db, 'products', id), payload);
      showToast(`Product "${editingProduct.name}" saved!`);
      setEditingProduct(null);
      await Promise.all([loadAllAdminData(), refreshStore()]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products', false);
      showToast('Failed to save product. Ensure all fields are valid.', 'error');
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteDoc = async (colName: string, id: string, label: string) => {
    try {
      await deleteDoc(doc(db, colName, id));
      showToast(`${label} deleted.`, 'info');
      await Promise.all([loadAllAdminData(), refreshStore()]);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${colName}/${id}`, false);
      showToast(`Could not delete ${label}.`, 'error');
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSavingItem(true);
    try {
      const orderRef = doc(db, 'orders', selectedOrder.id);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        showToast('Order document not found.', 'error');
        return;
      }
      const existing = orderSnap.data();
      const updatedOrderPayload: Record<string, unknown> = {
        ...existing,
        orderStatus: selectedOrder.orderStatus,
        paymentStatus: selectedOrder.paymentStatus,
        courierName: (selectedOrder.courierName || '').trim().slice(0, 120),
        trackingNumber: (selectedOrder.trackingNumber || '').trim().slice(0, 120),
        notes: (selectedOrder.notes || '').trim().slice(0, 500),
        updatedAt: serverTimestamp(),
      };
      await setDoc(orderRef, updatedOrderPayload);

      // Keep public non-PII orderTracking in sync
      const trackRef = doc(db, 'orderTracking', selectedOrder.orderNumber);
      const trackSnap = await getDoc(trackRef);
      if (trackSnap.exists()) {
        await setDoc(trackRef, {
          ...trackSnap.data(),
          orderStatus: selectedOrder.orderStatus,
          paymentStatus: selectedOrder.paymentStatus,
          courierName: (selectedOrder.courierName || '').trim().slice(0, 120),
          trackingNumber: (selectedOrder.trackingNumber || '').trim().slice(0, 120),
          updatedAt: serverTimestamp(),
        });
      }

      showToast(`Order ${selectedOrder.orderNumber} updated!`);
      setSelectedOrder(null);
      await loadAllAdminData();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${selectedOrder.id}`, false);
      showToast('Failed to update order.', 'error');
    } finally {
      setSavingItem(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSavingItem(true);
    try {
      const slug = toSlug(editingCategory.slug || editingCategory.name);
      const id = editingCategory.id || `cat-${slug}`;
      const existingSnap = await getDoc(doc(db, 'categories', id));
      await setDoc(doc(db, 'categories', id), {
        id,
        name: editingCategory.name.trim().slice(0, 80),
        slug,
        description: (editingCategory.description || '').trim().slice(0, 400),
        image: (editingCategory.image || '').trim().slice(0, 600),
        order: Number(editingCategory.order) || 1,
        active: Boolean(editingCategory.active),
        createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast('Category saved!');
      setEditingCategory(null);
      await Promise.all([loadAllAdminData(), refreshStore()]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'categories', false);
      showToast('Failed to save category.', 'error');
    } finally {
      setSavingItem(false);
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    setSavingItem(true);
    try {
      const code = editingCoupon.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      const id = editingCoupon.id || `coupon-${code.toLowerCase()}`;
      const existingSnap = await getDoc(doc(db, 'coupons', id));
      await setDoc(doc(db, 'coupons', id), {
        id,
        code,
        type: editingCoupon.type,
        value: Math.max(1, Number(editingCoupon.value) || 10),
        minOrderAmount: Math.max(0, Number(editingCoupon.minOrderAmount) || 0),
        maxDiscount: Math.max(0, Number(editingCoupon.maxDiscount) || 0),
        active: Boolean(editingCoupon.active),
        description: (editingCoupon.description || '').trim().slice(0, 200),
        createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast(`Coupon ${code} saved!`);
      setEditingCoupon(null);
      await Promise.all([loadAllAdminData(), refreshStore()]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'coupons', false);
      showToast('Failed to save coupon.', 'error');
    } finally {
      setSavingItem(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    setSavingItem(true);
    try {
      const id = editingBanner.id || `banner-${Date.now()}`;
      const existingSnap = await getDoc(doc(db, 'banners', id));
      await setDoc(doc(db, 'banners', id), {
        id,
        eyebrow: (editingBanner.eyebrow || '').trim().slice(0, 80),
        title: editingBanner.title.trim().slice(0, 120),
        subtitle: editingBanner.subtitle.trim().slice(0, 320),
        ctaText: editingBanner.ctaText.trim().slice(0, 40),
        ctaLink: editingBanner.ctaLink.trim().slice(0, 200),
        secondaryCtaText: (editingBanner.secondaryCtaText || '').trim().slice(0, 40),
        secondaryCtaLink: (editingBanner.secondaryCtaLink || '').trim().slice(0, 200),
        image: editingBanner.image.trim().slice(0, 600),
        order: Number(editingBanner.order) || 1,
        active: Boolean(editingBanner.active),
        createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast('Hero banner saved!');
      setEditingBanner(null);
      await Promise.all([loadAllAdminData(), refreshStore()]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'banners', false);
      showToast('Failed to save banner.', 'error');
    } finally {
      setSavingItem(false);
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    setSavingItem(true);
    try {
      const slug = toSlug(editingBlog.slug || editingBlog.title);
      const id = editingBlog.id || `blog-${slug.slice(0, 40)}`;
      const existingSnap = await getDoc(doc(db, 'blogs', id));
      const tags = blogTagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);

      await setDoc(doc(db, 'blogs', id), {
        id,
        title: editingBlog.title.trim().slice(0, 180),
        slug,
        excerpt: editingBlog.excerpt.trim().slice(0, 400),
        content: editingBlog.content.trim().slice(0, 20000),
        category: editingBlog.category.trim().slice(0, 80),
        featuredImage: (editingBlog.featuredImage || OFFICIAL_ASSETS.farmer).trim().slice(0, 600),
        author: (editingBlog.author || 'MAKH AND MORE Editorial').trim().slice(0, 80),
        readTime: (editingBlog.readTime || '4 min read').trim().slice(0, 30),
        tags,
        relatedProductSlugs: (editingBlog.relatedProductSlugs || []).slice(0, 6),
        seoTitle: (editingBlog.seoTitle || '').trim().slice(0, 120),
        seoDescription: (editingBlog.seoDescription || '').trim().slice(0, 300),
        published: Boolean(editingBlog.published),
        publishedAt: editingBlog.publishedAt || new Date().toISOString().split('T')[0],
        createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast('Blog article saved!');
      setEditingBlog(null);
      await Promise.all([loadAllAdminData(), refreshStore()]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'blogs', false);
      showToast('Failed to save blog post.', 'error');
    } finally {
      setSavingItem(false);
    }
  };

  const handleToggleReviewApproval = async (review: Review) => {
    try {
      await updateDoc(doc(db, 'reviews', review.id), {
        approved: !review.approved,
        updatedAt: serverTimestamp(),
      });
      showToast(review.approved ? 'Review hidden.' : 'Review approved & published!');
      await Promise.all([loadAllAdminData(), refreshStore()]);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${review.id}`, false);
      showToast('Could not update review.', 'error');
    }
  };

  const handleUpdateEnquiryStatus = async (enquiry: ContactEnquiry, status: ContactEnquiry['status']) => {
    try {
      await updateDoc(doc(db, 'enquiries', enquiry.id), { status });
      setEnquiries((prev) => prev.map((e) => (e.id === enquiry.id ? { ...e, status } : e)));
      showToast(`Enquiry marked as ${status}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `enquiries/${enquiry.id}`, false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const announcementMessages = announcementsText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 10);

      await setDoc(doc(db, 'settings', 'store'), {
        brandName: settingsForm.brandName.trim().slice(0, 80),
        tagline: settingsForm.tagline.trim().slice(0, 160),
        announcementMessages,
        freeShippingThreshold: Math.max(0, Number(settingsForm.freeShippingThreshold) || 0),
        standardShippingFee: Math.max(0, Number(settingsForm.standardShippingFee) || 0),
        bulkDiscountThreshold: Math.max(0, Number(settingsForm.bulkDiscountThreshold) || 0),
        bulkDiscountPercent: Math.max(0, Number(settingsForm.bulkDiscountPercent) || 0),
        codEnabled: Boolean(settingsForm.codEnabled),
        razorpayEnabled: Boolean(settingsForm.razorpayEnabled),
        whatsappNumber: settingsForm.whatsappNumber.trim().slice(0, 24),
        supportEmail: settingsForm.supportEmail.trim().slice(0, 120),
        supportPhone: settingsForm.supportPhone.trim().slice(0, 30),
        address: settingsForm.address.trim().slice(0, 300),
        supportHours: settingsForm.supportHours.trim().slice(0, 240),
        socialInstagram: settingsForm.socialInstagram.trim().slice(0, 240),
        socialFacebook: settingsForm.socialFacebook.trim().slice(0, 240),
        socialTwitter: settingsForm.socialTwitter.trim().slice(0, 240),
        seoTitle: settingsForm.seoTitle.trim().slice(0, 120),
        seoDescription: settingsForm.seoDescription.trim().slice(0, 300),
        policies: settingsForm.policies,
        updatedAt: serverTimestamp(),
      });
      showToast('Store settings & policies saved to Firestore!');
      await refreshStore();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/store', false);
      showToast('Failed to save settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const exportSubscribersCsv = () => {
    const csv = ['Email', ...subscribers.map((s) => s.email)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'makh-and-more-subscribers.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- PIN-ONLY ACCESS GATE (9090 ONLY) ---
  const verifyPin = (candidate: string) => {
    if (candidate === ADMIN_PIN) {
      try {
        sessionStorage.setItem(ADMIN_PIN_STORAGE_KEY, '1');
      } catch {
        // ignore storage errors
      }
      setPinError('');
      setPinInput('');
      setPinUnlocked(true);
      showToast('Admin Panel unlocked!');
    } else {
      setPinError('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pinInput.length >= 4) return;
    setPinError('');
    const next = `${pinInput}${digit}`;
    setPinInput(next);
    if (next.length === 4) {
      verifyPin(next);
    }
  };

  const handlePinBackspace = () => {
    setPinError('');
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handlePinLock = () => {
    try {
      sessionStorage.removeItem(ADMIN_PIN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setPinUnlocked(false);
    setPinInput('');
    setPinError('');
    showToast('Admin Panel locked.', 'info');
  };

  if (!pinUnlocked) {
    return (
      <div className="min-h-screen bg-[#FFF9EE] bg-dots-light flex items-center justify-center px-4 py-8">
        <div className="max-w-sm w-full bg-white rounded-[30px] border-2 border-[#0D3B2A]/10 p-6 sm:p-7 text-center shadow-xl">
          <BrandLogo className="h-10 mx-auto mb-3" />
          <div className="w-12 h-12 rounded-2xl bg-[#EBF9C8] text-[#0D3B2A] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[#0D3B2A]">
            Admin PIN Lock
          </h1>
          <p className="text-xs text-[#4A5E54] mt-1">
            Enter the 4-digit Admin PIN to manage MAKH AND MORE.
          </p>

          {/* 4-Digit PIN Visual Indicators */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyPin(pinInput);
            }}
            className="mt-5"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              {[0, 1, 2, 3].map((idx) => {
                const filled = idx < pinInput.length;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-extrabold transition-all ${
                      pinError
                        ? 'border-[#F25C54] bg-[#FFE4E1]/40 text-[#C83B24]'
                        : filled
                        ? 'border-[#0D3B2A] bg-[#EBF9C8] text-[#0D3B2A]'
                        : 'border-[#0D3B2A]/15 bg-[#FFF9EE] text-[#0D3B2A]/30'
                    }`}
                  >
                    {filled ? '•' : ''}
                  </div>
                );
              })}
            </div>

            {/* Direct keyboard input for desktop / mobile paste */}
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              aria-label="Enter 4-digit Admin PIN"
              value={pinInput}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPinError('');
                setPinInput(clean);
                if (clean.length === 4) {
                  verifyPin(clean);
                }
              }}
              placeholder="Enter 4-digit PIN"
              className="w-full h-11 px-4 rounded-2xl border border-[#0D3B2A]/15 bg-[#FFF9EE]/70 text-center text-sm font-mono font-bold tracking-[0.4em] text-[#0D3B2A] focus:outline-none focus:border-[#0D3B2A]"
            />

            {pinError && (
              <p className="mt-2.5 text-xs font-bold text-[#C83B24] bg-[#FFE4E1] py-2 px-3 rounded-xl">
                {pinError}
              </p>
            )}

            {/* Touch-Friendly Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinDigit(digit)}
                  className="h-12 rounded-2xl bg-[#FFF9EE] border border-[#0D3B2A]/12 font-display text-lg font-extrabold text-[#0D3B2A] hover:bg-[#EBF9C8] active:scale-95 transition-all cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPinInput('');
                  setPinError('');
                }}
                className="h-12 rounded-2xl bg-[#FFE4E1]/70 text-xs font-extrabold text-[#C83B24] hover:bg-[#FFE4E1] active:scale-95 transition-all cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handlePinDigit('0')}
                className="h-12 rounded-2xl bg-[#FFF9EE] border border-[#0D3B2A]/12 font-display text-lg font-extrabold text-[#0D3B2A] hover:bg-[#EBF9C8] active:scale-95 transition-all cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handlePinBackspace}
                aria-label="Backspace"
                className="h-12 rounded-2xl bg-[#FFF1B8] text-[#0D3B2A] hover:bg-[#F4B926]/60 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            <button
              type="submit"
              className="mt-4 w-full h-11 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-extrabold hover:bg-[#175C41] transition-colors cursor-pointer shadow-md"
            >
              Unlock Admin Panel
            </button>
          </form>

          <Link
            to="/"
            className="mt-3 block w-full py-2.5 rounded-full border border-[#0D3B2A]/15 text-[#0D3B2A] text-xs font-bold hover:bg-[#0D3B2A]/5"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    const statusOk = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const q = orderSearch.trim().toLowerCase();
    const qOk =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q);
    return statusOk && qOk;
  });

  const navTabs: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: `Products (${products.length})`, icon: Package },
    { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'banners', label: 'Hero Banners', icon: ImageIcon },
    { id: 'blogs', label: 'Blog CMS', icon: FileText },
    { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
    { id: 'customers', label: 'Customers & Leads', icon: Users },
    { id: 'settings', label: 'Settings & Policies', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row">
      {/* Admin Sidebar */}
      <aside className="lg:w-64 bg-forest text-cream shrink-0 p-3.5 sm:p-5 flex flex-col">
        <div className="flex items-center justify-between lg:block mb-3 lg:mb-5">
          <BrandLogo variant="dark-bg" className="h-9 sm:h-10" />
          <div className="flex items-center gap-2 lg:mt-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs text-cream/80 hover:text-gold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Storefront
            </Link>
            <button
              type="button"
              onClick={handlePinLock}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cream/10 hover:bg-cream/20 text-[11px] font-bold text-[#B7E843] cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              Lock
            </button>
          </div>
        </div>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          {navTabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors text-left cursor-pointer ${
                  tab === item.id
                    ? 'bg-gold text-forest'
                    : 'text-cream/80 hover:bg-cream/10 hover:text-cream'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:block mt-auto pt-4 border-t border-cream/15 text-[11px] text-cream/65">
          <p className="font-semibold text-cream">ASR ENTERPRISES</p>
          <p className="truncate">{user?.email || 'Admin PIN Session'}</p>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-3.5 sm:p-6 overflow-x-hidden">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="font-serif text-xl sm:text-3xl font-semibold text-forest capitalize">
              {tab === 'overview' ? 'Store Overview & Analytics' : tab}
            </h1>
            <p className="text-xs text-ink/60">
              Live store management for MAKH AND MORE
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadAllAdminData}
              disabled={loadingData}
              className="px-4 py-2 rounded-full bg-white border border-forest/15 text-xs font-semibold text-forest hover:bg-forest/5 inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="px-4 py-2 rounded-full bg-gold text-forest text-xs font-semibold hover:bg-gold-light inline-flex items-center gap-1.5"
            >
              {seeding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              {firestoreSeeded ? 'Re-Seed Default Catalog' : 'Seed Storefront Data to Firestore'}
            </button>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {!firestoreSeeded && (
              <div className="p-5 rounded-2xl bg-gold/15 border border-gold/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-forest">
                      Initialize Your Live Firestore Catalog
                    </p>
                    <p className="text-xs text-ink/75 mt-0.5">
                      Click “Seed Storefront Data to Firestore” to populate all 7 official MAKH AND
                      MORE products, 5 categories, 3 banners, 2 coupons, 3 blogs, and store settings
                      into your live database.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSeedDatabase}
                  disabled={seeding}
                  className="px-5 py-2.5 rounded-full bg-forest text-cream text-xs font-semibold hover:bg-forest-light"
                >
                  {seeding ? 'Seeding…' : 'Seed Now'}
                </button>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-forest/10 p-5 shadow-xs">
                <p className="text-xs text-ink/60 font-medium">Gross Revenue</p>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1 tabular-nums">
                  ₹{kpis.totalSales.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-leaf mt-1">Excluding cancelled orders</p>
              </div>
              <div className="bg-white rounded-2xl border border-forest/10 p-5 shadow-xs">
                <p className="text-xs text-ink/60 font-medium">Total Orders</p>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1 tabular-nums">
                  {kpis.totalOrders}
                </p>
                <p className="text-[11px] text-ink/60 mt-1">
                  {kpis.pendingOrders} pending • {kpis.deliveredOrders} delivered
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-forest/10 p-5 shadow-xs">
                <p className="text-xs text-ink/60 font-medium">Active Catalog</p>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1 tabular-nums">
                  {products.length}
                </p>
                <p className="text-[11px] text-accent mt-1">
                  {kpis.lowStockCount} low-stock alert(s)
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-forest/10 p-5 shadow-xs">
                <p className="text-xs text-ink/60 font-medium">Registered Customers</p>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1 tabular-nums">
                  {customers.length}
                </p>
                <p className="text-[11px] text-ink/60 mt-1">
                  {subscribers.length} subscribers • {enquiries.length} enquiries
                </p>
              </div>
            </div>

            {/* Chart + Recent Orders */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-7 bg-white rounded-2xl border border-forest/10 p-6 shadow-xs">
                <h2 className="font-serif text-lg font-semibold text-forest mb-4">
                  Revenue by Order Status (₹)
                </h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E4D8" />
                      <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#16241E' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#16241E' }} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#0F3D2E" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="xl:col-span-5 bg-white rounded-2xl border border-forest/10 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-lg font-semibold text-forest">Recent Orders</h2>
                  <button
                    type="button"
                    onClick={() => setTab('orders')}
                    className="text-xs font-semibold text-leaf hover:underline"
                  >
                    View All
                  </button>
                </div>
                {orders.length === 0 ? (
                  <p className="text-xs text-ink/60 py-8 text-center">No orders placed yet.</p>
                ) : (
                  <div className="divide-y divide-forest/10">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        className="py-3 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <p className="font-mono font-bold text-forest">{ord.orderNumber}</p>
                          <p className="text-ink/65">{ord.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-forest tabular-nums">₹{ord.total}</p>
                          <p className="uppercase text-[10px] font-semibold text-leaf">
                            {ord.orderStatus}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => openProductEditor()}
                className="px-5 py-2.5 rounded-full bg-forest text-cream text-xs font-semibold hover:bg-forest-light inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-forest/10 overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream/80 text-forest uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">SKU / Weight</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/10">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-cream/30">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-cream p-1 shrink-0">
                          <SafeImage
                            src={p.primaryImage}
                            alt={p.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-forest">{p.name}</p>
                          <p className="text-ink/55">{p.category}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-mono text-ink/80">{p.sku}</p>
                        <p className="text-ink/55">{p.weight}</p>
                      </td>
                      <td className="p-4 tabular-nums">
                        <span className="font-bold text-forest">₹{p.salePrice}</span>{' '}
                        <span className="line-through text-ink/45">₹{p.price}</span>
                      </td>
                      <td className="p-4 tabular-nums">
                        <span className={p.stock <= 10 ? 'text-accent font-bold' : 'text-forest'}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={p.published ? 'text-leaf font-semibold' : 'text-ink/50'}>
                          {p.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openProductEditor(p)}
                          className="p-1.5 rounded-lg text-forest hover:bg-forest/10"
                          aria-label="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc('products', p.id, p.name)}
                          className="p-1.5 rounded-lg text-accent hover:bg-accent/10"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by Order #, Customer Name, Phone…"
                className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl bg-white border border-forest/15 text-xs"
              />
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white border border-forest/15 text-xs"
              >
                <option value="all">All Statuses</option>
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-forest/10 overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream/80 text-forest uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items & Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/10">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-ink/55">
                        No matching orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-cream/30">
                        <td className="p-4 font-mono font-bold text-forest">{ord.orderNumber}</td>
                        <td className="p-4">
                          <p className="font-semibold text-forest">{ord.customerName}</p>
                          <p className="text-ink/60">{ord.customerPhone}</p>
                        </td>
                        <td className="p-4 tabular-nums">
                          <p className="font-bold text-forest">₹{ord.total}</p>
                          <p className="text-ink/55">{ord.items.length} item(s)</p>
                        </td>
                        <td className="p-4 uppercase">
                          <p className="font-semibold text-forest">{ord.paymentMethod}</p>
                          <p className="text-ink/55">{ord.paymentStatus}</p>
                        </td>
                        <td className="p-4 uppercase font-semibold text-leaf">{ord.orderStatus}</td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder({ ...ord })}
                            className="px-3 py-1.5 rounded-lg bg-forest text-cream text-xs font-semibold hover:bg-forest-light"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {tab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setEditingCategory({
                    id: '',
                    name: '',
                    slug: '',
                    description: '',
                    image: OFFICIAL_ASSETS.jumboPouch,
                    order: categories.length + 1,
                    active: true,
                  })
                }
                className="px-5 py-2.5 rounded-full bg-forest text-cream text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-forest/10 p-5 flex items-start justify-between gap-3 shadow-xs"
                >
                  <div>
                    <p className="font-serif text-lg font-semibold text-forest">{cat.name}</p>
                    <p className="text-xs font-mono text-ink/50">/category/{cat.slug}</p>
                    <p className="text-xs text-ink/70 mt-1 line-clamp-2">{cat.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ ...cat })}
                      className="p-1.5 text-forest hover:bg-forest/10 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoc('categories', cat.id, cat.name)}
                      className="p-1.5 text-accent hover:bg-accent/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COUPONS TAB */}
        {tab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setEditingCoupon({
                    id: '',
                    code: '',
                    type: 'percent',
                    value: 15,
                    minOrderAmount: 299,
                    maxDiscount: 300,
                    active: true,
                    description: '',
                  })
                }
                className="px-5 py-2.5 rounded-full bg-forest text-cream text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Coupon
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((cp) => (
                <div
                  key={cp.id}
                  className="bg-white rounded-2xl border border-forest/10 p-5 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <p className="font-mono text-base font-bold text-forest">{cp.code}</p>
                    <p className="text-xs text-ink/70">
                      {cp.type === 'percent' ? `${cp.value}% OFF` : `₹${cp.value} OFF`} • Min order ₹
                      {cp.minOrderAmount}
                    </p>
                    <p className="text-[11px] text-leaf font-semibold mt-0.5">
                      {cp.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingCoupon({ ...cp })}
                      className="p-1.5 text-forest hover:bg-forest/10 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoc('coupons', cp.id, cp.code)}
                      className="p-1.5 text-accent hover:bg-accent/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BANNERS TAB */}
        {tab === 'banners' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setEditingBanner({
                    id: '',
                    eyebrow: 'Authentic Mithila Harvest',
                    title: '',
                    subtitle: '',
                    ctaText: 'Shop Now',
                    ctaLink: '/shop',
                    secondaryCtaText: '',
                    secondaryCtaLink: '',
                    image: OFFICIAL_ASSETS.heroSnacks,
                    order: banners.length + 1,
                    active: true,
                  })
                }
                className="px-5 py-2.5 rounded-full bg-forest text-cream text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Hero Banner
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((bn) => (
                <div
                  key={bn.id}
                  className="bg-white rounded-2xl border border-forest/10 p-5 flex gap-4 shadow-xs"
                >
                  <div className="w-20 h-20 aspect-square rounded-xl bg-cream overflow-hidden shrink-0">
                    <SafeImage src={bn.image} alt={bn.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-base font-semibold text-forest truncate">
                      {bn.title}
                    </p>
                    <p className="text-xs text-ink/65 line-clamp-2">{bn.subtitle}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingBanner({ ...bn })}
                        className="text-xs font-semibold text-forest hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc('banners', bn.id, bn.title)}
                        className="text-xs font-semibold text-accent hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLOGS TAB */}
        {tab === 'blogs' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditingBlog({
                    id: '',
                    title: '',
                    slug: '',
                    excerpt: '',
                    content: '## Heading\n\nWrite your article here...',
                    category: 'Mithila Heritage',
                    featuredImage: OFFICIAL_ASSETS.farmer,
                    author: 'MAKH AND MORE Editorial',
                    readTime: '4 min read',
                    tags: ['Makhana'],
                    relatedProductSlugs: [],
                    seoTitle: '',
                    seoDescription: '',
                    published: true,
                    publishedAt: new Date().toISOString().split('T')[0],
                  });
                  setBlogTagsText('Makhana, Mithila');
                }}
                className="px-5 py-2.5 rounded-full bg-forest text-cream text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Write New Article
              </button>
            </div>
            <div className="space-y-3">
              {blogs.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-forest/10 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs"
                >
                  <div>
                    <p className="font-serif text-lg font-semibold text-forest">{b.title}</p>
                    <p className="text-xs text-ink/60">
                      {b.category} • /blog/{b.slug} • {b.published ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBlog({ ...b });
                        setBlogTagsText((b.tags || []).join(', '));
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-forest/20 text-xs font-semibold text-forest"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoc('blogs', b.id, b.title)}
                      className="px-3.5 py-1.5 rounded-lg border border-accent/25 text-xs font-semibold text-accent"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {tab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-forest/10 p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-semibold text-forest">
              Customer Review Moderation
            </h2>
            {reviews.length === 0 ? (
              <p className="text-xs text-ink/60">No customer reviews submitted yet.</p>
            ) : (
              <div className="divide-y divide-forest/10">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-4 flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <p className="text-xs font-semibold text-forest">
                        {rev.authorName} — {rev.rating}★ on {rev.productName || rev.productId}
                      </p>
                      {rev.title && <p className="text-sm font-semibold text-ink">{rev.title}</p>}
                      <p className="text-xs text-ink/75">{rev.comment}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleReviewApproval(rev)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${
                          rev.approved
                            ? 'bg-cream text-forest border border-forest/20'
                            : 'bg-leaf text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {rev.approved ? 'Approved (Hide)' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc('reviews', rev.id, 'Review')}
                        className="p-1.5 text-accent hover:bg-accent/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CUSTOMERS, ENQUIRIES & SUBSCRIBERS TAB */}
        {tab === 'customers' && (
          <div className="space-y-6">
            {/* Enquiries */}
            <div className="bg-white rounded-2xl border border-forest/10 p-6 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-forest mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-leaf" />
                Contact Enquiries ({enquiries.length})
              </h2>
              {enquiries.length === 0 ? (
                <p className="text-xs text-ink/60">No contact enquiries yet.</p>
              ) : (
                <div className="divide-y divide-forest/10">
                  {enquiries.map((enq) => (
                    <div key={enq.id} className="py-4 flex flex-wrap justify-between gap-4 text-xs">
                      <div className="max-w-xl">
                        <p className="font-semibold text-forest">
                          {enq.name} ({enq.email}
                          {enq.phone ? ` • ${enq.phone}` : ''})
                        </p>
                        <p className="font-medium text-leaf mt-0.5">{enq.subject}</p>
                        <p className="text-ink/75 mt-1">{enq.message}</p>
                      </div>
                      <select
                        value={enq.status}
                        onChange={(e) =>
                          handleUpdateEnquiryStatus(enq, e.target.value as ContactEnquiry['status'])
                        }
                        className="h-9 px-3 rounded-lg border border-forest/20 bg-cream text-xs font-semibold"
                      >
                        <option value="new">New</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Newsletter Subscribers */}
            <div className="bg-white rounded-2xl border border-forest/10 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-semibold text-forest flex items-center gap-2">
                  <Mail className="w-5 h-5 text-leaf" />
                  Newsletter Subscribers ({subscribers.length})
                </h2>
                {subscribers.length > 0 && (
                  <button
                    type="button"
                    onClick={exportSubscribersCsv}
                    className="px-4 py-2 rounded-full border border-forest/20 text-xs font-semibold text-forest inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                )}
              </div>
              {subscribers.length === 0 ? (
                <p className="text-xs text-ink/60">No subscribers yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subscribers.map((s) => (
                    <span
                      key={s.id}
                      className="px-3 py-1.5 rounded-lg bg-cream text-xs text-forest border border-forest/10"
                    >
                      {s.email}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Registered Users */}
            <div className="bg-white rounded-2xl border border-forest/10 p-6 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-forest mb-4">
                Registered Customers ({customers.length})
              </h2>
              <div className="divide-y divide-forest/10 text-xs">
                {customers.map((c) => (
                  <div key={c.uid} className="py-3 flex justify-between gap-4">
                    <div>
                      <p className="font-semibold text-forest">{c.displayName}</p>
                      <p className="text-ink/60">{c.email}</p>
                    </div>
                    <p className="text-ink/70">{c.phone || c.whatsappNumber || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS & POLICIES TAB */}
        {tab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
            <div className="bg-white rounded-2xl border border-forest/10 p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-xl font-semibold text-forest">
                General, Shipping & Payment Controls
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-forest mb-1">Brand Name</label>
                  <input
                    value={settingsForm.brandName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest mb-1">Tagline</label>
                  <input
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest mb-1">
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThreshold}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        freeShippingThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest mb-1">
                    Standard Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.standardShippingFee}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        standardShippingFee: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest mb-1">
                    Auto Bulk Discount Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.bulkDiscountThreshold}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        bulkDiscountThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest mb-1">
                    Auto Bulk Discount (%)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.bulkDiscountPercent}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        bulkDiscountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20"
                  />
                </div>
                <label className="flex items-center gap-2 font-semibold text-forest">
                  <input
                    type="checkbox"
                    checked={settingsForm.codEnabled}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, codEnabled: e.target.checked })
                    }
                  />
                  Enable Cash on Delivery (COD)
                </label>
                <label className="flex items-center gap-2 font-semibold text-forest">
                  <input
                    type="checkbox"
                    checked={settingsForm.razorpayEnabled}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, razorpayEnabled: e.target.checked })
                    }
                  />
                  Enable Razorpay Online Payments
                </label>
              </div>

              <div className="text-xs">
                <label className="block font-semibold text-forest mb-1">
                  Announcement Bar Messages (one per line)
                </label>
                <textarea
                  rows={4}
                  value={announcementsText}
                  onChange={(e) => setAnnouncementsText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-forest mb-1">Support Phone</label>
                  <input
                    value={settingsForm.supportPhone}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, supportPhone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest mb-1">WhatsApp Number</label>
                  <input
                    value={settingsForm.whatsappNumber}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest mb-1">Instagram URL</label>
                  <input
                    value={settingsForm.socialInstagram}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, socialInstagram: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest mb-1">
                    X / Twitter URL (Optional)
                  </label>
                  <input
                    value={settingsForm.socialTwitter}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, socialTwitter: e.target.value })
                    }
                    placeholder="https://x.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest/20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-forest/10 p-6 shadow-xs space-y-4 text-xs">
              <h2 className="font-serif text-xl font-semibold text-forest">
                Store Legal Policies
              </h2>
              {(
                [
                  ['shippingPolicy', 'Shipping Policy'],
                  ['refundReturns', 'Refund & Returns Policy'],
                  ['privacyPolicy', 'Privacy Policy'],
                  ['termsAndConditions', 'Terms & Conditions'],
                  ['disclaimer', 'Disclaimer'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block font-semibold text-forest mb-1">{label}</label>
                  <textarea
                    rows={4}
                    value={settingsForm.policies[key]}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        policies: { ...settingsForm.policies, [key]: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-7 py-3 rounded-full bg-forest text-cream text-sm font-semibold hover:bg-forest-light inline-flex items-center gap-2"
            >
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings & Policies
            </button>
          </form>
        )}
      </main>

      {/* --- PRODUCT EDITOR MODAL --- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold text-forest">
                {editingProduct.id ? 'Edit Product' : 'Add Product'}
              </h2>
              <button type="button" onClick={() => setEditingProduct(null)}>
                <X className="w-5 h-5 text-ink/60" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-forest block mb-1">Product Name *</label>
                <input
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                      slug: editingProduct.id ? editingProduct.slug : toSlug(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
                />
              </div>
              <div>
                <label className="font-semibold text-forest block mb-1">SEO Slug *</label>
                <input
                  required
                  value={editingProduct.slug}
                  onChange={(e) => setEditingProduct({ ...editingProduct, slug: toSlug(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-forest/20 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-forest block mb-1">Category *</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-forest/20 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                  {categories.length === 0 && <option value="makhana">Makhana</option>}
                </select>
              </div>
              <div>
                <label className="font-semibold text-forest block mb-1">MRP / Regular Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
                />
              </div>
              <div>
                <label className="font-semibold text-forest block mb-1">Sale Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={editingProduct.salePrice}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, salePrice: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
                />
              </div>
              <div>
                <label className="font-semibold text-forest block mb-1">Weight *</label>
                <input
                  required
                  value={editingProduct.weight}
                  onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
                />
              </div>
              <div>
                <label className="font-semibold text-forest block mb-1">SKU & Stock *</label>
                <div className="flex gap-2">
                  <input
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    placeholder="SKU"
                    className="w-1/2 px-3 py-2 rounded-xl border border-forest/20"
                  />
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                    }
                    placeholder="Stock"
                    className="w-1/2 px-3 py-2 rounded-xl border border-forest/20"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-forest block mb-1">
                  Primary Image URL (or Upload to Cloudinary) *
                </label>
                <div className="flex gap-2">
                  <input
                    required
                    value={editingProduct.primaryImage}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, primaryImage: e.target.value })
                    }
                    className="flex-1 px-3.5 py-2 rounded-xl border border-forest/20"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-cream border border-forest/20 text-forest font-semibold cursor-pointer inline-flex items-center gap-1.5 shrink-0 hover:bg-forest/5">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleCloudinaryUpload(file, 'makh-and-more/products', (url, publicId) =>
                            setEditingProduct((prev) =>
                              prev ? { ...prev, primaryImage: url, cloudinaryPublicId: publicId } : prev
                            )
                          );
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-forest block mb-1">Short Description</label>
                <input
                  value={editingProduct.shortDescription}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, shortDescription: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-forest block mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
                />
              </div>

              <div>
                <label className="font-semibold text-forest block mb-1">
                  Gallery URLs (one per line)
                </label>
                <textarea
                  rows={3}
                  value={productGalleryText}
                  onChange={(e) => setProductGalleryText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
                />
              </div>

              <div>
                <label className="font-semibold text-forest block mb-1">
                  Key Highlights (one per line)
                </label>
                <textarea
                  rows={3}
                  value={productHighlightsText}
                  onChange={(e) => setProductHighlightsText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-forest block mb-1">Ingredients</label>
                <input
                  value={editingProduct.ingredients}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, ingredients: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
                />
              </div>

              <label className="flex items-center gap-2 font-semibold text-forest">
                <input
                  type="checkbox"
                  checked={editingProduct.published}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, published: e.target.checked })
                  }
                />
                Published on Storefront
              </label>
              <label className="flex items-center gap-2 font-semibold text-forest">
                <input
                  type="checkbox"
                  checked={Boolean(editingProduct.featured)}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, featured: e.target.checked })
                  }
                />
                Featured Product
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-forest/10">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-5 py-2.5 rounded-full border border-forest/20 text-xs font-semibold text-forest"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingItem}
                className="px-6 py-2.5 rounded-full bg-forest text-cream text-xs font-semibold hover:bg-forest-light"
              >
                {savingItem ? 'Saving…' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- ORDER MANAGEMENT MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleUpdateOrder}
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold text-forest">
                  Manage Order {selectedOrder.orderNumber}
                </h2>
                <p className="text-ink/60">
                  {selectedOrder.customerName} • {selectedOrder.customerPhone}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-ink/60" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-cream space-y-1">
              <p className="font-semibold text-forest">Shipping Address</p>
              <p className="text-ink/75">
                {selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city},{' '}
                {selectedOrder.shippingAddress.state} – {selectedOrder.shippingAddress.pincode}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-forest block mb-1">Order Status</label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) =>
                    setSelectedOrder({
                      ...selectedOrder,
                      orderStatus: e.target.value as OrderStatus,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-forest/20 bg-white uppercase"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-forest block mb-1">Payment Status</label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) =>
                    setSelectedOrder({
                      ...selectedOrder,
                      paymentStatus: e.target.value as PaymentStatus,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-forest/20 bg-white uppercase"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-forest block mb-1">Courier Partner</label>
                <input
                  value={selectedOrder.courierName || ''}
                  onChange={(e) =>
                    setSelectedOrder({ ...selectedOrder, courierName: e.target.value })
                  }
                  placeholder="Delhivery / BlueDart / DTDC"
                  className="w-full px-3 py-2 rounded-xl border border-forest/20"
                />
              </div>
              <div>
                <label className="font-semibold text-forest block mb-1">Tracking / AWB Number</label>
                <input
                  value={selectedOrder.trackingNumber || ''}
                  onChange={(e) =>
                    setSelectedOrder({ ...selectedOrder, trackingNumber: e.target.value })
                  }
                  placeholder="AWB123456789"
                  className="w-full px-3 py-2 rounded-xl border border-forest/20 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-forest/10">
              <Link
                to={`/order-confirmation/${selectedOrder.id}`}
                className="inline-flex items-center gap-1.5 text-forest font-semibold hover:underline"
              >
                <Printer className="w-4 h-4" />
                Printable Invoice
              </Link>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-full border border-forest/20 font-semibold text-forest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="px-5 py-2 rounded-full bg-forest text-cream font-semibold hover:bg-forest-light"
                >
                  {savingItem ? 'Updating…' : 'Update Order'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- CATEGORY MODAL --- */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCategory}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-3 text-xs shadow-2xl"
          >
            <h2 className="font-serif text-xl font-semibold text-forest">Category Details</h2>
            <input
              required
              placeholder="Category Name"
              value={editingCategory.name}
              onChange={(e) =>
                setEditingCategory({
                  ...editingCategory,
                  name: e.target.value,
                  slug: editingCategory.id ? editingCategory.slug : toSlug(e.target.value),
                })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
            />
            <input
              required
              placeholder="Slug"
              value={editingCategory.slug}
              onChange={(e) => setEditingCategory({ ...editingCategory, slug: toSlug(e.target.value) })}
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20 font-mono"
            />
            <textarea
              rows={2}
              placeholder="Description"
              value={editingCategory.description}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, description: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
            />
            <input
              placeholder="Image URL"
              value={editingCategory.image}
              onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 rounded-full border border-forest/20"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 rounded-full bg-forest text-cream font-semibold">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- COUPON MODAL --- */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCoupon}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-3 text-xs shadow-2xl"
          >
            <h2 className="font-serif text-xl font-semibold text-forest">Coupon Details</h2>
            <input
              required
              placeholder="Code (e.g. MAKH20)"
              value={editingCoupon.code}
              onChange={(e) =>
                setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20 font-mono"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={editingCoupon.type}
                onChange={(e) =>
                  setEditingCoupon({
                    ...editingCoupon,
                    type: e.target.value as 'percent' | 'fixed',
                  })
                }
                className="px-3 py-2 rounded-xl border border-forest/20 bg-white"
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
              <input
                type="number"
                required
                placeholder="Value"
                value={editingCoupon.value}
                onChange={(e) =>
                  setEditingCoupon({ ...editingCoupon, value: Number(e.target.value) })
                }
                className="px-3 py-2 rounded-xl border border-forest/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min Order ₹"
                value={editingCoupon.minOrderAmount}
                onChange={(e) =>
                  setEditingCoupon({ ...editingCoupon, minOrderAmount: Number(e.target.value) })
                }
                className="px-3 py-2 rounded-xl border border-forest/20"
              />
              <input
                type="number"
                placeholder="Max Discount ₹"
                value={editingCoupon.maxDiscount || 0}
                onChange={(e) =>
                  setEditingCoupon({ ...editingCoupon, maxDiscount: Number(e.target.value) })
                }
                className="px-3 py-2 rounded-xl border border-forest/20"
              />
            </div>
            <label className="flex items-center gap-2 font-semibold text-forest">
              <input
                type="checkbox"
                checked={editingCoupon.active}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, active: e.target.checked })}
              />
              Coupon Active
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="px-4 py-2 rounded-full border border-forest/20"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 rounded-full bg-forest text-cream font-semibold">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- BANNER MODAL --- */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveBanner}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-3 text-xs shadow-2xl"
          >
            <h2 className="font-serif text-xl font-semibold text-forest">Hero Banner</h2>
            <input
              placeholder="Eyebrow"
              value={editingBanner.eyebrow}
              onChange={(e) => setEditingBanner({ ...editingBanner, eyebrow: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
            />
            <input
              required
              placeholder="Headline Title"
              value={editingBanner.title}
              onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
            />
            <textarea
              rows={2}
              required
              placeholder="Subtitle"
              value={editingBanner.subtitle}
              onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="CTA Text"
                value={editingBanner.ctaText}
                onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                className="px-3 py-2 rounded-xl border border-forest/20"
              />
              <input
                required
                placeholder="CTA Link (/shop)"
                value={editingBanner.ctaLink}
                onChange={(e) => setEditingBanner({ ...editingBanner, ctaLink: e.target.value })}
                className="px-3 py-2 rounded-xl border border-forest/20"
              />
            </div>
            <input
              required
              placeholder="Banner Image URL"
              value={editingBanner.image}
              onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 rounded-full border border-forest/20"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 rounded-full bg-forest text-cream font-semibold">
                Save Banner
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- BLOG MODAL --- */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveBlog}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-3 text-xs shadow-2xl"
          >
            <h2 className="font-serif text-xl font-semibold text-forest">Blog Article Editor</h2>
            <input
              required
              placeholder="Article Title *"
              value={editingBlog.title}
              onChange={(e) =>
                setEditingBlog({
                  ...editingBlog,
                  title: e.target.value,
                  slug: editingBlog.id ? editingBlog.slug : toSlug(e.target.value),
                })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="Slug"
                value={editingBlog.slug}
                onChange={(e) => setEditingBlog({ ...editingBlog, slug: toSlug(e.target.value) })}
                className="px-3 py-2 rounded-xl border border-forest/20 font-mono"
              />
              <input
                required
                placeholder="Category"
                value={editingBlog.category}
                onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                className="px-3 py-2 rounded-xl border border-forest/20"
              />
            </div>
            <input
              required
              placeholder="Short Excerpt"
              value={editingBlog.excerpt}
              onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
            />
            <input
              placeholder="Featured Image URL"
              value={editingBlog.featuredImage}
              onChange={(e) => setEditingBlog({ ...editingBlog, featuredImage: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
            />
            <input
              placeholder="Tags (comma-separated)"
              value={blogTagsText}
              onChange={(e) => setBlogTagsText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20"
            />
            <textarea
              rows={8}
              required
              placeholder="Content (use ## for headings)"
              value={editingBlog.content}
              onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-forest/20 font-mono"
            />
            <label className="flex items-center gap-2 font-semibold text-forest">
              <input
                type="checkbox"
                checked={editingBlog.published}
                onChange={(e) => setEditingBlog({ ...editingBlog, published: e.target.checked })}
              />
              Published
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="px-4 py-2 rounded-full border border-forest/20"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 rounded-full bg-forest text-cream font-semibold">
                Save Article
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
