import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  History,
  KeyRound,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Plus,
  Printer,
  Shield,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import {
  AnimatedDotCluster,
  AnimatedSparkle,
  BrandLogo,
  WavySectionDivider,
} from '../components/BrandVisuals';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useSEO } from '../lib/seo';
import { Order, SavedAddress } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const { user, signInWithGoogle, loginWithEmail, resetPassword } = useAuth();
  const { showToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  useSEO({
    title: 'Sign In | MAKH AND MORE',
    description:
      'Sign in to your MAKH AND MORE account to view orders and saved shipping addresses.',
    canonicalPath: '/login',
    noindex: true,
  });

  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      showToast('Signed in successfully!');
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      showToast('Welcome back to MAKH AND MORE!');
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed.';
      if (msg.includes('operation-not-allowed')) {
        setError(
          'Email/Password login is not enabled in Firebase Console yet. Please use "Continue with Google" above or Direct WhatsApp Login at checkout.'
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email address first to receive a password reset link.');
      return;
    }
    setError('');
    try {
      await resetPassword(email);
      setResetSent(true);
      showToast('Password reset email sent!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.');
    }
  };

  return (
    <div className="relative bg-[#FFF9EE] bg-dots-light min-h-[78vh] py-10 sm:py-16 px-4 overflow-hidden">
      <div className="max-w-md mx-auto bg-white rounded-[2.25rem] border-2 border-[#0D3B2A]/10 p-6 sm:p-9 shadow-xl relative">
        <AnimatedSparkle
          color="#F4B926"
          className="w-7 h-7 absolute -top-3 -right-2 pointer-events-none"
        />

        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <BrandLogo className="h-12" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
            Welcome Back!
          </h1>
          <p className="text-xs text-[#4A5E54] mt-1.5 leading-relaxed">
            Track orders, manage addresses, or skip login and use Direct WhatsApp Login at checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full min-h-[48px] py-3 px-4 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-display font-bold hover:bg-[#175C41] transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs font-semibold text-[#4A5E54]/70">
          <div className="h-px flex-1 bg-[#0D3B2A]/10" />
          <span>or sign in with email</span>
          <div className="h-px flex-1 bg-[#0D3B2A]/10" />
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0D3B2A] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm focus:outline-none focus:border-[#23884D] focus:bg-white"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#0D3B2A]">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-bold text-[#23884D] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm focus:outline-none focus:border-[#23884D] focus:bg-white"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FFE4E1] text-xs font-medium text-[#C83B24] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {resetSent && (
            <div className="p-3.5 rounded-2xl bg-[#E2F6E7] text-xs font-semibold text-[#156C3D] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Password reset link sent to {email}.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[46px] py-3 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-sm font-display font-bold hover:bg-[#B7E843] transition-colors disabled:opacity-60"
          >
            Sign In with Email
          </button>
        </form>

        <p className="text-xs text-center text-[#4A5E54] mt-6">
          New to MAKH AND MORE?{' '}
          <Link to="/register" className="font-bold text-[#0D3B2A] hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, registerWithEmail } = useAuth();
  const { showToast } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useSEO({
    title: 'Create Account | MAKH AND MORE',
    description:
      'Register an optional customer account on MAKH AND MORE for saved addresses and order history.',
    canonicalPath: '/register',
    noindex: true,
  });

  useEffect(() => {
    if (user) {
      navigate('/account', { replace: true });
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(name, email, password, phone);
      showToast('Account created! Welcome to MAKH AND MORE.');
      navigate('/account', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      if (msg.includes('operation-not-allowed')) {
        setError(
          'Email/Password signup is not enabled in Firebase Console yet. Use "Continue with Google" below or Direct WhatsApp Login at checkout.'
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-[#FFF9EE] bg-dots-light min-h-[78vh] py-10 sm:py-16 px-4 overflow-hidden">
      <div className="max-w-md mx-auto bg-white rounded-[2.25rem] border-2 border-[#0D3B2A]/10 p-6 sm:p-9 shadow-xl relative">
        <AnimatedSparkle
          color="#B7E843"
          className="w-7 h-7 absolute -top-3 -left-2 pointer-events-none"
        />

        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <BrandLogo className="h-12" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A]">
            Join the Crunch Club
          </h1>
          <p className="text-xs text-[#4A5E54] mt-1.5">
            Save shipping addresses and track all your Mithila Makhana orders in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            setError('');
            setLoading(true);
            try {
              await signInWithGoogle();
              navigate('/account', { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Google sign-in failed.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full min-h-[48px] py-3 px-4 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-display font-bold hover:bg-[#175C41] transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs font-semibold text-[#4A5E54]/70">
          <div className="h-px flex-1 bg-[#0D3B2A]/10" />
          <span>or register with email</span>
          <div className="h-px flex-1 bg-[#0D3B2A]/10" />
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#0D3B2A] mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm focus:outline-none focus:border-[#23884D] focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0D3B2A] mb-1">
              Mobile / WhatsApp Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm focus:outline-none focus:border-[#23884D] focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0D3B2A] mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm focus:outline-none focus:border-[#23884D] focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0D3B2A] mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm focus:outline-none focus:border-[#23884D] focus:bg-white"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FFE4E1] text-xs font-medium text-[#C83B24] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[46px] py-3 rounded-full bg-[#EBF9C8] text-[#0D3B2A] text-sm font-display font-bold hover:bg-[#B7E843] transition-colors"
          >
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-center text-[#4A5E54] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#0D3B2A] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

type AccountTab = 'orders' | 'profile' | 'addresses' | 'wishlist' | 'recent' | 'security';

function getOrderStatusChip(status: Order['orderStatus']) {
  switch (status) {
    case 'delivered':
      return 'bg-[#E2F6E7] text-[#156C3D]';
    case 'shipped':
      return 'bg-[#FFF1B8] text-[#B36208]';
    case 'cancelled':
      return 'bg-[#FFE4E1] text-[#C83B24]';
    case 'confirmed':
    case 'packed':
      return 'bg-[#EBF9C8] text-[#0D3B2A]';
    default:
      return 'bg-[#FFE7D4] text-[#C83B24]';
  }
}

export function AccountPage() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    isAdmin,
    loading,
    whatsappSession,
    logout,
    updateUserProfile,
    saveAddress,
    removeAddress,
    changeUserPassword,
  } = useAuth();
  const { products, wishlistIds, recentlyViewedIds, showToast } = useStore();

  const [tab, setTab] = useState<AccountTab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile form
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // New Address form
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<SavedAddress, 'id'>>({
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: true,
  });

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [pwFeedback, setPwFeedback] = useState('');

  useSEO({
    title: 'My Account | MAKH AND MORE',
    description: 'Manage your MAKH AND MORE profile, saved addresses, and order history.',
    canonicalPath: '/account',
    noindex: true,
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPhone(profile.phone || '');
      setWhatsappNumber(profile.whatsappNumber || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoadingOrders(true);
    getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid)))
      .then((snap) => {
        if (!active) return;
        const list = snap.docs
          .map((d) => ({ ...(d.data() as Order), id: d.id }))
          .sort((a, b) => String(b.orderNumber).localeCompare(String(a.orderNumber)));
        setOrders(list);
      })
      .catch((err) => {
        handleFirestoreError(err, OperationType.LIST, 'orders', false);
      })
      .finally(() => {
        if (active) setLoadingOrders(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const handleCancelOrder = async (order: Order) => {
    if (order.orderStatus !== 'pending') return;
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        orderStatus: 'cancelled',
        notes: 'Cancelled by customer from My Account',
        updatedAt: serverTimestamp(),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, orderStatus: 'cancelled' } : o))
      );
      showToast(`Order ${order.orderNumber} cancelled.`, 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`, false);
      showToast('Could not cancel order. Contact support on WhatsApp.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFF9EE] min-h-[65vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D3B2A]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#FFF9EE] bg-dots-light min-h-[75vh] py-14 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-[2.25rem] border-2 border-[#0D3B2A]/10 p-8 sm:p-10 text-center shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-[#EBF9C8] text-[#0D3B2A] flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B2A] mb-2">
            Your MAKH AND MORE Account
          </h1>
          <p className="text-sm text-[#4A5E54] mb-6 leading-relaxed">
            {whatsappSession?.verified
              ? `Your WhatsApp (${whatsappSession.phone}) is verified for express checkout! Sign in with Google or Email to view synced multi-device order history.`
              : 'Sign in to access saved addresses and past orders — or use Track Order with your Order Number anytime.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="min-h-[46px] px-7 py-3 rounded-full bg-[#0D3B2A] text-[#B7E843] text-sm font-display font-bold hover:bg-[#175C41] inline-flex items-center"
            >
              Sign In / Register
            </Link>
            <Link
              to="/track-order"
              className="min-h-[46px] px-7 py-3 rounded-full bg-[#FFF1B8] text-[#0D3B2A] text-sm font-bold hover:bg-[#F4B926] transition-colors inline-flex items-center"
            >
              Track an Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const savedWishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
  const recentProducts = recentlyViewedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const navItems: {
    id: AccountTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: `Wishlist (${savedWishlistProducts.length})`, icon: Heart },
    { id: 'recent', label: 'Recent', icon: History },
    { id: 'security', label: 'Security', icon: KeyRound },
  ];

  return (
    <div className="bg-[#FFF9EE] min-h-[75vh] pb-16 sm:pb-24 overflow-hidden">
      {/* Dotted Forest Account Header Banner */}
      <section className="relative bg-gradient-to-br from-[#0D3B2A] via-[#144E39] to-[#23884D] text-[#FFF9EE] overflow-hidden">
        <div className="absolute inset-0 bg-dots-forest opacity-40 pointer-events-none" />
        <AnimatedDotCluster
          color="#B7E843"
          accentColor="#F4B926"
          className="w-24 h-24 absolute top-4 right-6 opacity-45 pointer-events-none hidden sm:block"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-10 sm:pb-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#B7E843] text-[#0D3B2A] font-display font-extrabold text-2xl flex items-center justify-center shadow-lg shrink-0">
                {(profile?.displayName || user.displayName || 'M').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#B7E843]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Welcome Back
                </span>
                <h1 className="font-display text-2xl sm:text-4xl font-extrabold mt-0.5 leading-tight">
                  {profile?.displayName || user.displayName || 'Customer Account'}
                </h1>
                <p className="text-xs text-[#FFF9EE]/75 mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="min-h-[42px] px-5 py-2 rounded-full bg-[#F4B926] text-[#0D3B2A] text-xs font-display font-bold hover:bg-[#ffd45a] inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  showToast('Signed out successfully.', 'info');
                  navigate('/');
                }}
                className="min-h-[42px] px-5 py-2 rounded-full bg-white/10 border border-white/25 text-[#FFF9EE] text-xs font-bold hover:bg-white/20 inline-flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
        <WavySectionDivider fill="#FFF9EE" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Mobile Scrollable Pill Tab Bar */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`min-h-[42px] px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 transition-all shrink-0 ${
                  active
                    ? 'bg-[#0D3B2A] text-[#B7E843] shadow-sm'
                    : 'bg-white text-[#0D3B2A] border border-[#0D3B2A]/12'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-[2rem] border border-[#0D3B2A]/10 p-3 shadow-xs space-y-1.5 sticky top-28">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${
                    tab === item.id
                      ? 'bg-[#0D3B2A] text-[#B7E843] shadow-xs'
                      : 'text-[#4A5E54] hover:bg-[#FFF9EE] hover:text-[#0D3B2A]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </aside>

          {/* Main Tab Content */}
          <div className="lg:col-span-9">
            {tab === 'orders' && (
              <div className="bg-white rounded-[2rem] border border-[#0D3B2A]/10 p-5 sm:p-7 shadow-xs">
                <h2 className="font-display text-2xl font-extrabold text-[#0D3B2A] mb-5">
                  My Orders
                </h2>
                {loadingOrders ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0D3B2A] mx-auto" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-10 text-center bg-[#FFF9EE] rounded-[1.5rem] p-6">
                    <Package className="w-10 h-10 text-[#23884D] mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[#0D3B2A] mb-4">
                      You haven’t placed any orders yet.
                    </p>
                    <Link
                      to="/shop"
                      className="min-h-[44px] inline-flex items-center px-6 py-2.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-display font-bold"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-[1.75rem] border border-[#0D3B2A]/10 p-5 bg-[#FFF9EE]/60 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-mono text-sm font-extrabold text-[#0D3B2A]">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-[#4A5E54]">
                              {order.items.length} item(s) •{' '}
                              <span className="uppercase font-semibold">{order.paymentMethod}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${getOrderStatusChip(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus}
                            </span>
                            <span className="font-display text-lg font-extrabold text-[#0D3B2A] tabular-nums">
                              ₹{order.total.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-[#12261E]/80 space-y-1.5 bg-white rounded-2xl p-3.5 border border-[#0D3B2A]/5">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between gap-2">
                              <span>
                                {it.name} ({it.weight}) × {it.quantity}
                              </span>
                              <span className="font-semibold tabular-nums">
                                ₹{it.price * it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
                          <Link
                            to={`/order-confirmation/${order.id}`}
                            className="px-3.5 py-2 rounded-full bg-white border border-[#0D3B2A]/12 font-bold text-[#0D3B2A] hover:bg-[#EBF9C8] inline-flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Invoice
                          </Link>
                          <Link
                            to={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
                            className="px-3.5 py-2 rounded-full bg-[#0D3B2A] text-[#B7E843] font-bold hover:bg-[#175C41]"
                          >
                            Track Shipment
                          </Link>
                          {order.orderStatus === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order)}
                              className="font-bold text-[#C83B24] hover:underline ml-auto"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'profile' && (
              <div className="bg-white rounded-[2rem] border border-[#0D3B2A]/10 p-5 sm:p-7 shadow-xs">
                <h2 className="font-display text-2xl font-extrabold text-[#0D3B2A] mb-5">
                  Profile Details
                </h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSavingProfile(true);
                    try {
                      await updateUserProfile({ displayName, phone, whatsappNumber });
                      showToast('Profile updated!');
                    } finally {
                      setSavingProfile(false);
                    }
                  }}
                  className="space-y-4 max-w-lg"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#0D3B2A] mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm focus:outline-none focus:border-[#23884D] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0D3B2A] mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm focus:outline-none focus:border-[#23884D] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0D3B2A] mb-1.5">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm focus:outline-none focus:border-[#23884D] focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="min-h-[44px] px-7 py-2.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-display font-bold hover:bg-[#175C41]"
                  >
                    {savingProfile ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {tab === 'addresses' && (
              <div className="bg-white rounded-[2rem] border border-[#0D3B2A]/10 p-5 sm:p-7 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <h2 className="font-display text-2xl font-extrabold text-[#0D3B2A]">
                    Saved Addresses
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowAddrForm(!showAddrForm)}
                    className="min-h-[42px] px-5 py-2 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-display font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add Address
                  </button>
                </div>

                {showAddrForm && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await saveAddress({ ...newAddr, id: `addr-${Date.now()}` });
                      setShowAddrForm(false);
                      showToast('Address saved!');
                    }}
                    className="mb-6 p-5 rounded-[1.75rem] bg-[#EBF9C8]/60 border border-[#23884D]/20 grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <input
                      placeholder="Label (Home / Office)"
                      required
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      className="min-h-[44px] px-4 py-2 rounded-2xl border border-[#0D3B2A]/15 bg-white text-sm"
                    />
                    <input
                      placeholder="Full Name *"
                      required
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="min-h-[44px] px-4 py-2 rounded-2xl border border-[#0D3B2A]/15 bg-white text-sm"
                    />
                    <input
                      placeholder="Phone *"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="min-h-[44px] px-4 py-2 rounded-2xl border border-[#0D3B2A]/15 bg-white text-sm"
                    />
                    <input
                      placeholder="PIN Code (6 digits) *"
                      required
                      value={newAddr.pincode}
                      onChange={(e) =>
                        setNewAddr({
                          ...newAddr,
                          pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                        })
                      }
                      className="min-h-[44px] px-4 py-2 rounded-2xl border border-[#0D3B2A]/15 bg-white text-sm"
                    />
                    <input
                      placeholder="Address Line 1 *"
                      required
                      value={newAddr.line1}
                      onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                      className="sm:col-span-2 min-h-[44px] px-4 py-2 rounded-2xl border border-[#0D3B2A]/15 bg-white text-sm"
                    />
                    <input
                      placeholder="City *"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="min-h-[44px] px-4 py-2 rounded-2xl border border-[#0D3B2A]/15 bg-white text-sm"
                    />
                    <input
                      placeholder="State *"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="min-h-[44px] px-4 py-2 rounded-2xl border border-[#0D3B2A]/15 bg-white text-sm"
                    />
                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddrForm(false)}
                        className="min-h-[40px] px-5 py-2 rounded-full bg-white border border-[#0D3B2A]/15 text-xs font-bold text-[#0D3B2A]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="min-h-[40px] px-6 py-2 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-display font-bold"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(profile?.addresses || []).length === 0 ? (
                    <p className="text-sm text-[#4A5E54]">No saved addresses yet.</p>
                  ) : (
                    (profile?.addresses || []).map((addr) => (
                      <div
                        key={addr.id}
                        className="p-5 rounded-[1.5rem] border border-[#0D3B2A]/10 bg-[#FFF9EE]/70 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-0.5 rounded-full bg-[#FFF1B8] text-[11px] font-extrabold uppercase text-[#0D3B2A]">
                              {addr.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAddress(addr.id)}
                              className="p-1.5 rounded-full text-[#4A5E54] hover:text-[#C83B24] hover:bg-[#FFE4E1]"
                              aria-label="Delete address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-display text-base font-bold text-[#0D3B2A] mt-2">
                            {addr.fullName}
                          </p>
                          <p className="text-xs text-[#4A5E54] mt-1 leading-relaxed">
                            {addr.line1}, {addr.city}, {addr.state} – {addr.pincode}
                          </p>
                          <p className="text-xs font-semibold text-[#0D3B2A] mt-1.5 tabular-nums">
                            {addr.phone}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === 'wishlist' && (
              <div className="bg-white rounded-[2rem] border border-[#0D3B2A]/10 p-5 sm:p-7 shadow-xs">
                <h2 className="font-display text-2xl font-extrabold text-[#0D3B2A] mb-5">
                  Saved Wishlist
                </h2>
                {savedWishlistProducts.length === 0 ? (
                  <p className="text-sm text-[#4A5E54]">No items saved to your wishlist yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {savedWishlistProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'recent' && (
              <div className="bg-white rounded-[2rem] border border-[#0D3B2A]/10 p-5 sm:p-7 shadow-xs">
                <h2 className="font-display text-2xl font-extrabold text-[#0D3B2A] mb-5">
                  Recently Viewed
                </h2>
                {recentProducts.length === 0 ? (
                  <p className="text-sm text-[#4A5E54]">No recently viewed products yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {recentProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'security' && (
              <div className="bg-white rounded-[2rem] border border-[#0D3B2A]/10 p-5 sm:p-7 shadow-xs">
                <h2 className="font-display text-2xl font-extrabold text-[#0D3B2A] mb-2">
                  Password & Security
                </h2>
                <p className="text-xs text-[#4A5E54] mb-5 leading-relaxed">
                  If you signed in with Google, your security is managed by Google Sign-In. Email
                  users can update their password below.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPwFeedback('');
                    try {
                      await changeUserPassword(newPassword);
                      setNewPassword('');
                      setPwFeedback('Password updated successfully!');
                    } catch (err) {
                      setPwFeedback(
                        err instanceof Error
                          ? err.message
                          : 'Please re-authenticate to change password.'
                      );
                    }
                  }}
                  className="max-w-md space-y-3"
                >
                  <input
                    type="password"
                    minLength={6}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF9EE]/60 border border-[#0D3B2A]/15 text-sm focus:outline-none focus:border-[#23884D] focus:bg-white"
                  />
                  {pwFeedback && (
                    <p className="text-xs font-bold text-[#0D3B2A] bg-[#EBF9C8] px-4 py-2 rounded-xl">
                      {pwFeedback}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="min-h-[44px] px-7 py-2.5 rounded-full bg-[#0D3B2A] text-[#B7E843] text-xs font-display font-bold hover:bg-[#175C41]"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
