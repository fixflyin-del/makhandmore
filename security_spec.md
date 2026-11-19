# MAKH AND MORE — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default-Deny Baseline**: Every path not explicitly matched is denied for both reads and writes.
2. **PII Isolation**: `users/{userId}` and `orders/{orderId}` contain customer emails, phone numbers, and shipping addresses; reads are strictly limited to `isOwner(uid)` or `isAdmin()`. Public order status checks use the sanitized non-PII `orderTracking/{orderNumber}` collection (single-document `get` only, no `list`).
3. **Privilege Escalation Prevention**: Customers can never write to `admins/{uid}`, can never inject a `role` or `isAdmin` field into `users/{userId}`, and admin identity is verified exclusively via `admins/{uid}` existence or the verified bootstrap email (`email_verified == true`).
4. **Anti-Update-Gap & Strict Keys**: Every write passes a dedicated `isValid<Entity>(incoming())` validator enforcing strict keys (`hasAll` + `hasOnly`), string `.size()` bounds, array `.size()` bounds, and server timestamp checks (`request.time`).
5. **Terminal State Locking**: Orders in terminal states (`delivered` or `cancelled`) cannot be modified by non-admins.
6. **Review Integrity**: Non-admin customers can only submit reviews with `approved == false` and `userId == request.auth.uid` for an existing product (`exists(/products/...)`).
7. **Order Integrity**: Newly created orders must start with `orderStatus == 'pending'` and `paymentStatus == 'pending'` (unless written by an admin), preventing client-side fake `paid` or `delivered` injection.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Ghost Field / Shadow Update on User Profile**: `{ uid: "u1", displayName: "Eve", role: "admin", isAdmin: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }`
2. **Email Spoofing Admin Bypass**: Unverified auth token `{ email: "ayatarmanok@gmail.com", email_verified: false }` attempting `create` on `/products/fake-item`.
3. **PII Blanket Read on Another User**: Authenticated user `u2` executing `get('/users/u1')`.
4. **PII Blanket List on Orders**: Authenticated user `u2` executing `list('/orders')` without owning the queried documents.
5. **Client-Side Fake Paid Order Creation**: Creating `/orders/ord1` with `{ ..., paymentStatus: "paid", orderStatus: "delivered" }`.
6. **Order Terminal State Tampering**: Customer updating `/orders/ord1` after `existing().orderStatus == 'delivered'`.
7. **Self-Approved Fake Review**: Customer creating `/reviews/rev1` with `{ ..., approved: true, userId: "u1" }`.
8. **Orphaned Review Injection**: Customer creating `/reviews/rev1` referencing a non-existent `productId: "does-not-exist"`.
9. **ID Poisoning / Resource Exhaustion**: Attempting `create` on `/products/<200-char-invalid-id>` or injecting a 50KB `displayName`.
10. **Client Timestamp Spoofing**: Creating `/enquiries/enq1` with a backdated `createdAt` not equal to `request.time`.
11. **Admin Collection Self-Escalation**: Authenticated non-admin writing `/admins/{ownUid}`.
12. **Unpublished Product Scraping**: Unauthenticated user reading `/products/draft-sku` where `published == false`.
