/**
 * MAKH AND MORE — Phase 0 Firestore Security Rules TDD Specification
 * Validates that the "Dirty Dozen" adversarial payloads are rejected
 * by the hardened ruleset in firestore.rules.
 */

export interface AdversarialTestCase {
  id: string;
  name: string;
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: AdversarialTestCase[] = [
  {
    id: 'DD-01',
    name: 'Shadow Update / Privilege Escalation via Ghost role field on /users',
    path: '/users/user-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'buyer@example.com', email_verified: true },
    payload: { uid: 'user-1', displayName: 'Buyer', role: 'admin', isAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-02',
    name: 'Email Spoofing Admin Bypass (unverified admin email)',
    path: '/products/fake-sku',
    operation: 'create',
    auth: { uid: 'spoof-1', email: 'ayatarmanok@gmail.com', email_verified: false },
    payload: { name: 'Spoofed', slug: 'spoofed', category: 'makhana', price: 100, salePrice: 90, weight: '90g', sku: 'SP1', stock: 10, primaryImage: '/img.webp', published: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-03',
    name: 'PII Blanket Read on another customer profile',
    path: '/users/victim-uid',
    operation: 'get',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-04',
    name: 'PII Blanket List on all customer orders',
    path: '/orders',
    operation: 'list',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-05',
    name: 'Client-side fake paid/delivered order injection',
    path: '/orders/ord-fake-paid',
    operation: 'create',
    auth: { uid: 'buyer-1', email: 'buyer@example.com', email_verified: true },
    payload: { orderNumber: 'MM-9999', userId: 'buyer-1', paymentStatus: 'paid', orderStatus: 'delivered' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-06',
    name: 'Terminal State Tampering on delivered order',
    path: '/orders/ord-delivered',
    operation: 'update',
    auth: { uid: 'buyer-1', email: 'buyer@example.com', email_verified: true },
    payload: { orderStatus: 'cancelled' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-07',
    name: 'Self-approved review creation by non-admin',
    path: '/reviews/rev-fake',
    operation: 'create',
    auth: { uid: 'buyer-1', email: 'buyer@example.com', email_verified: true },
    payload: { productId: 'premium-jumbo-makhana-100g', userId: 'buyer-1', authorName: 'Spammer', rating: 5, comment: 'Self approved!', approved: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-08',
    name: 'Orphaned review targeting non-existent productId',
    path: '/reviews/rev-orphan',
    operation: 'create',
    auth: { uid: 'buyer-1', email: 'buyer@example.com', email_verified: true },
    payload: { productId: 'non-existent-product', userId: 'buyer-1', authorName: 'User', rating: 5, comment: 'Orphaned review', approved: false },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-09',
    name: 'ID Poisoning with oversized/invalid characters',
    path: '/products/bad$$id!@#',
    operation: 'get',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10',
    name: 'Backdated client timestamp spoofing on contact enquiry',
    path: '/enquiries/enq-backdated',
    operation: 'create',
    auth: null,
    payload: { name: 'Bot', email: 'bot@example.com', subject: 'Hi', message: 'Hello there', status: 'new', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11',
    name: 'Non-admin self-escalation to /admins collection',
    path: '/admins/attacker-uid',
    operation: 'create',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    payload: { email: 'attacker@example.com' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-12',
    name: 'Unpublished draft product scraping by guest',
    path: '/products/unpublished-draft',
    operation: 'get',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
];
