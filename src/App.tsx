import React, { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { AccountPage, LoginPage, RegisterPage } from './pages/AccountPages';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { BlogDetailPage, BlogListPage } from './pages/BlogPages';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { FaqPage, PolicyPage } from './pages/LegalAndFaqPages';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ShopPage } from './pages/ShopPage';
import { AboutUsPage, OurStoryPage } from './pages/StoryAndAboutPages';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { WishlistPage } from './pages/WishlistPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="bg-cream min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md text-center bg-white rounded-3xl border border-forest/10 p-10 shadow-xs">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gold-dark">
          404 — Page Not Found
        </p>
        <h1 className="font-serif text-3xl font-semibold text-forest mt-2">
          We couldn’t find that snack aisle
        </h1>
        <p className="text-sm text-ink/70 mt-3 mb-6">
          The page you’re looking for may have moved. Explore our authentic Mithila Makhana
          collection instead.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-2.5 rounded-full bg-forest text-cream text-sm font-semibold hover:bg-forest-light"
          >
            Go Home
          </Link>
          <Link
            to="/shop"
            className="px-6 py-2.5 rounded-full border border-forest/20 text-forest text-sm font-semibold hover:bg-forest/5"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    </div>
  );
}

function StorefrontRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/category/:slug" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route
          path="/shipping-policy"
          element={
            <PolicyPage
              policyKey="shippingPolicy"
              title="Shipping & Delivery Policy"
              canonicalPath="/shipping-policy"
              description="Pan-India shipping timelines, free shipping above ₹299, and dispatch details from ASR Enterprises, Darbhanga."
            />
          }
        />
        <Route
          path="/refund-returns"
          element={
            <PolicyPage
              policyKey="refundReturns"
              title="Refund & Returns Policy"
              canonicalPath="/refund-returns"
              description="Return, replacement, and refund policy for MAKH AND MORE Mithila Makhana orders."
            />
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <PolicyPage
              policyKey="privacyPolicy"
              title="Privacy Policy"
              canonicalPath="/privacy-policy"
              description="How MAKH AND MORE (ASR Enterprises) safeguards customer data and privacy."
            />
          }
        />
        <Route
          path="/terms-and-conditions"
          element={
            <PolicyPage
              policyKey="termsAndConditions"
              title="Terms & Conditions"
              canonicalPath="/terms-and-conditions"
              description="Terms of service governing orders and usage of makhandmore.com."
            />
          }
        />
        <Route
          path="/disclaimer"
          element={
            <PolicyPage
              policyKey="disclaimer"
              title="Disclaimer"
              canonicalPath="/disclaimer"
              description="Product and nutritional information disclaimer for MAKH AND MORE."
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <StoreProvider>
            <Routes>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/*" element={<StorefrontRoutes />} />
            </Routes>
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
