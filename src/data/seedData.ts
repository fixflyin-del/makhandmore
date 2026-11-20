import { BlogArticle, Category, Coupon, HeroBanner, Product, StoreSettings } from '../types';

export const OFFICIAL_ASSETS = {
  logo: '/assets/aistudio/cropped-makhana-logO-FINAL-5-png-rgb_6015b2a8.webp',
  farmer: '/assets/aistudio/Farmer_b1266eef.webp',
  heroSnacks: '/assets/aistudio/makhana-makh-and-more-snacks_be51bb7d.webp',
  pudinaJar: '/assets/aistudio/Pudina-single-400x600_ccf96f5b.png',
  fourJarsLineup: '/assets/aistudio/71Z2JzHPOTL._SL1254_-400x400_bd3a0922.jpg',
  flavourCollection: '/assets/aistudio/Makh-and-More-Flavorful-Snack-Collection_a3da26fc.png',
  jumboPouch: '/assets/aistudio/front_17085455.webp',
} as const;

export const INITIAL_SETTINGS: StoreSettings = {
  brandName: 'MAKH AND MORE',
  tagline: 'Healthy Snacking Redefined.',
  announcementMessages: [
    'Free Shipping on orders above ₹299!',
    'Shop for ₹599 or More & Get 20% OFF!',
    'Premium Quality 100% Natural & Fresh Mithila Makhana.',
    'Proudly Crafted in Mithila, Darbhanga, Bihar.',
  ],
  freeShippingThreshold: 299,
  standardShippingFee: 49,
  bulkDiscountThreshold: 599,
  bulkDiscountPercent: 20,
  codEnabled: true,
  razorpayEnabled: true,
  whatsappNumber: '+919135986786',
  supportEmail: 'info@makhandmore.com',
  supportPhone: '+91 9135 986 786',
  address: 'ASR ENTERPRISES, Vill. Jatuka, Darbhanga, Bihar – 847422, India.',
  supportHours: 'Monday–Friday: 6:30 AM–8:00 PM | Saturday: 7:30 AM–8:00 PM | Sunday: Closed',
  socialInstagram: 'https://www.instagram.com/makhandmore',
  socialFacebook: 'https://www.facebook.com/makhandmore',
  socialTwitter: '',
  seoTitle: 'MAKH AND MORE — Premium Mithila Makhana | Healthy Snacking Redefined',
  seoDescription:
    'Shop 100% natural, farm-fresh Mithila Makhana, roasted flavoured fox nuts, and dry fruits directly from Darbhanga, Bihar. Free shipping above ₹299.',
  policies: {
    shippingPolicy: `Shipping & Delivery Policy — MAKH AND MORE (ASR ENTERPRISES)

1. Order Processing
All orders placed on makhandmore.com are freshly packed and hygienically sealed at our facility in Darbhanga, Bihar. Orders are typically dispatched within 1–2 business days (Monday to Saturday).

2. Shipping Charges & Free Shipping
• Free Shipping across India on all orders of ₹299 and above.
• A standard shipping charge of ₹49 applies to orders below ₹299.

3. Estimated Delivery Timelines
• Bihar & Jharkhand: 2–3 business days
• Metro Cities (Delhi NCR, Mumbai, Bengaluru, Kolkata, Hyderabad, Chennai, Pune): 3–5 business days
• Rest of India: 4–7 business days

4. Order Tracking
Once dispatched, your tracking number and courier details are updated on your order and can be checked anytime via our Track Order page or WhatsApp support (+91 9135 986 786).`,
    refundReturns: `Refund & Returns Policy — MAKH AND MORE (ASR ENTERPRISES)

Because MAKH AND MORE sells consumable food products, we maintain strict hygiene and food-safety standards.

1. Eligibility for Replacement or Refund
We accept return or replacement requests within 48 hours of delivery only in the following cases:
• You received a damaged, torn, or unsealed pouch/jar.
• You received an incorrect product or missing items compared to your order invoice.
• The product arrived past its printed shelf life.

2. How to Raise a Request
Please share your Order ID and clear unboxing photos or a short video via email at info@makhandmore.com or WhatsApp at +91 9135 986 786 within 48 hours of receiving your parcel.

3. Refund Processing
Approved refunds for prepaid orders are initiated to the original payment method within 5–7 business days. For COD orders, refunds are processed via verified UPI/bank transfer after confirmation.

4. Order Cancellations
Pending orders that have not yet been dispatched can be cancelled directly from My Account or by messaging our support team.`,
    privacyPolicy: `Privacy Policy — MAKH AND MORE (ASR ENTERPRISES)

ASR ENTERPRISES ("MAKH AND MORE", "we", "our") respects your privacy and is committed to protecting the personal data you share with us.

1. Information We Collect
• Contact & delivery details: Name, phone/WhatsApp number, email address, and shipping address needed to fulfill your order.
• Order & preference history: Purchased items, wishlist, and customer support correspondence.
• Payment security: Online payments are processed via certified payment gateways. We never store your card numbers, CVV, or UPI PINs on our servers or database.

2. How We Use Your Information
• To process, pack, ship, and track your MAKH AND MORE orders.
• To send order updates via WhatsApp, SMS, or email.
• To respond to customer enquiries and improve our products.

3. Data Protection & Contact
We never sell or rent customer data to third parties. To update or delete your stored account details, write to info@makhandmore.com.`,
    termsAndConditions: `Terms & Conditions — MAKH AND MORE (ASR ENTERPRISES)

Welcome to MAKH AND MORE, owned and operated by ASR ENTERPRISES, Vill. Jatuka, Darbhanga, Bihar – 847422, India.

1. General
By accessing this website and placing an order, you agree to provide accurate delivery information and comply with these terms.

2. Pricing & Availability
All prices are listed in Indian Rupees (INR) inclusive of applicable taxes unless stated otherwise. Promotional offers (such as Free Shipping above ₹299 and 20% Off on ₹599+) apply according to active store settings.

3. Authentic Product Presentation
We strive to display accurate photography, weights, and ingredient listings for all MAKH AND MORE packs. Natural agricultural variations in makhana kernel size may occur between harvests.

4. Intellectual Property
All MAKH AND MORE trademarks, logos, packaging designs, and written content belong exclusively to ASR ENTERPRISES.

5. Governing Law
These terms are governed by the laws of India, with jurisdiction in Darbhanga, Bihar.`,
    disclaimer: `Disclaimer — MAKH AND MORE (ASR ENTERPRISES)

The content published on makhandmore.com, including blog articles, product highlights, and general nutritional information about makhana (fox nuts) and dry fruits, is provided solely for general informational and culinary purposes.

Our products are natural food items and are not intended to diagnose, treat, cure, or prevent any medical condition. Individuals with specific dietary requirements, food allergies, or medical conditions should consult a qualified healthcare or nutrition professional before making dietary changes.

Always verify allergen, ingredient, and best-before information printed on the physical product package before consumption.`,
  },
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-makhana',
    name: 'Premium Jumbo Makhana',
    slug: 'makhana',
    description: 'Handpicked, extra-large raw Mithila fox nuts ready for roasting, kheer, curries, and everyday snacking.',
    image: OFFICIAL_ASSETS.jumboPouch,
    order: 1,
    active: true,
  },
  {
    id: 'cat-roasted',
    name: 'Roasted Makhana',
    slug: 'roasted-makhana',
    description: 'Slow-roasted crisp Mithila makhana jars packed fresh for light, guilt-free crunch anytime.',
    image: OFFICIAL_ASSETS.pudinaJar,
    order: 2,
    active: true,
  },
  {
    id: 'cat-flavoured',
    name: 'Flavoured Makhana',
    slug: 'flavoured-makhana',
    description: 'Bold Indian and global seasonings — Pudina, Peri Peri, Cheese, and Himalayan Salt.',
    image: OFFICIAL_ASSETS.flavourCollection,
    order: 3,
    active: true,
  },
  {
    id: 'cat-combo',
    name: 'Makhana Combo',
    slug: 'makhana-combo',
    description: 'Value multi-flavour snack jars curated for families, office desks, and festive gifting.',
    image: OFFICIAL_ASSETS.fourJarsLineup,
    order: 4,
    active: true,
  },
  {
    id: 'cat-dry-fruits',
    name: 'Dry Fruits',
    slug: 'dry-fruits',
    description: 'Wholesome, hygienically sorted natural nuts and dry fruits selected for everyday nutrition.',
    image: OFFICIAL_ASSETS.heroSnacks,
    order: 5,
    active: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'premium-roasted-makhana-combo-4-flavours',
    name: 'Premium Roasted Makhana Combo – 4 Flavours',
    slug: 'roasted-makhana-combo-4-flavours',
    category: 'makhana-combo',
    flavour: 'Assorted 4 Flavours',
    shortDescription:
      'Complete 4-jar tasting collection featuring Cheese, Pudina, Himalayan Salt, and Peri Peri roasted Mithila makhana (4 x 90g).',
    description:
      'Not just makhana — it is a complete flavour experience. Our signature 4-Flavour Roasted Makhana Combo brings together all four signature MAKH AND MORE jars in one value pack: tangy Cheese, refreshing Pudina, crisp Himalayan Salt, and fiery Peri Peri. Slow-roasted from handpicked Darbhanga makhana kernels and sealed in reusable airtight jars to lock in crunch from the first bite to the last.',
    price: 1196,
    salePrice: 759,
    weight: '360g (4 x 90g Jars)',
    sku: 'MM-COMBO-4FLV',
    stock: 48,
    primaryImage: OFFICIAL_ASSETS.fourJarsLineup,
    imageCrop: 'none',
    gallery: [
      OFFICIAL_ASSETS.fourJarsLineup,
      OFFICIAL_ASSETS.flavourCollection,
      OFFICIAL_ASSETS.pudinaJar,
      OFFICIAL_ASSETS.heroSnacks,
    ],
    highlights: [
      'Includes 4 airtight 90g jars: Cheese, Pudina, Himalayan Salt & Peri Peri',
      '100% Roasted, never deep-fried — light and crunchy',
      'Gluten-free, naturally rich in plant protein and fibre',
      'Sourced directly from authentic Mithila farms in Darbhanga, Bihar',
      'Ideal for family snacking, office desks, travel, and healthy gifting',
    ],
    ingredients:
      'Popped Lotus Seeds (Makhana), Edible Vegetable Oil (minimal spray for seasoning adhesion), Natural Spice & Herb Blends (Pudina Mint, Peri Peri Chilli & Spices, Cheese Seasoning, Himalayan Pink Salt).',
    nutrition: {
      servingSize: '30g per serving (approx.)',
      energy: '132 kcal',
      protein: '3.1g',
      carbohydrates: '21g',
      dietaryFiber: '2.8g',
      totalFat: '3.8g',
    },
    shelfLife: '6 Months from date of packaging',
    storage: 'Store in a cool, dry place. Keep jar lid tightly closed after each serving to retain crispness.',
    faq: [
      {
        question: 'Which 4 flavours are included in this combo?',
        answer: 'You receive one 90g jar each of Cheese, Pudina, Himalayan Salt, and Peri Peri roasted makhana.',
      },
      {
        question: 'Are these makhana jars fried or roasted?',
        answer: 'Every batch is slow-roasted for a clean crunch — never deep-fried.',
      },
      {
        question: 'Does this combo qualify for Free Shipping and the 20% offer?',
        answer: 'Yes! Orders above ₹299 ship free across India, and orders of ₹599 or more automatically unlock 20% off at checkout.',
      },
    ],
    seoTitle: 'Premium Roasted Makhana Combo (4 Flavours, 360g) | MAKH AND MORE',
    seoDescription:
      'Buy MAKH AND MORE 4-Flavour Roasted Makhana Combo (Cheese, Pudina, Himalayan Salt, Peri Peri). Authentic Mithila fox nuts at ₹759 with free shipping.',
    published: true,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },
  {
    id: 'roasted-makhana-pudina-90g',
    name: 'Pudina Makhana 90g',
    slug: 'roasted-makhana-pudina-90g',
    category: 'flavoured-makhana',
    flavour: 'Pudina',
    shortDescription:
      'Refreshing garden-mint and zesty Indian spice blend tumbled onto crisp slow-roasted Mithila makhana.',
    description:
      'Cool, aromatic, and unmistakably Indian. Our Pudina Roasted Makhana pairs airy, hand-sorted Mithila fox nuts with real dried mint leaves, black salt, and mild chaat spices. Packed in a sleek 90g airtight jar, it makes an effortless tea-time companion and midday crunch without heavy oiliness.',
    price: 299,
    salePrice: 239,
    weight: '90g Jar',
    sku: 'MM-RST-PUD-90',
    stock: 74,
    primaryImage: OFFICIAL_ASSETS.pudinaJar,
    imageCrop: 'none',
    gallery: [
      OFFICIAL_ASSETS.pudinaJar,
      OFFICIAL_ASSETS.flavourCollection,
      OFFICIAL_ASSETS.fourJarsLineup,
    ],
    highlights: [
      'Roasted, not fried — crisp garden mint flavour',
      'Low calorie, high fibre, naturally gluten-free snack',
      'Packed in a resealable 90g transparent jar with golden lid',
      'Authentic Mithila lotus seeds from Darbhanga, Bihar',
    ],
    ingredients:
      'Popped Lotus Seeds (Makhana), Edible Vegetable Oil, Dried Mint (Pudina) Leaves, Black Salt, Iodized Salt, Cumin, Amchur (Dry Mango Powder), Mixed Indian Spices.',
    nutrition: {
      servingSize: '30g',
      energy: '128 kcal',
      protein: '3.2g',
      carbohydrates: '21.5g',
      dietaryFiber: '3.0g',
      totalFat: '3.4g',
    },
    shelfLife: '6 Months from date of packaging',
    storage: 'Store in a cool, dry place away from direct sunlight. Reseal lid tightly after opening.',
    faq: [
      {
        question: 'Is Pudina Makhana spicy?',
        answer: 'It has a refreshing minty tang with gentle, balanced chaat warmth suitable for all age groups.',
      },
      {
        question: 'Is it gluten-free?',
        answer: 'Yes, makhana is naturally gluten-free and hygienically packed.',
      },
    ],
    seoTitle: 'Pudina Roasted Makhana 90g Jar | MAKH AND MORE',
    seoDescription:
      'Shop Pudina Roasted Makhana 90g from MAKH AND MORE. Crisp Mithila fox nuts coated with refreshing mint & spices for ₹239.',
    published: true,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },
  {
    id: 'roasted-makhana-peri-peri-90g',
    name: 'Peri Peri Makhana 90g',
    slug: 'roasted-makhana-peri-peri-90g',
    category: 'flavoured-makhana',
    flavour: 'Peri Peri',
    shortDescription:
      'Bold, zesty Peri Peri chilli and citrus spice coating over slow-roasted Mithila fox nuts.',
    description:
      'Craving fiery crunch without the fried-chip guilt? Our Peri Peri Roasted Makhana coats plump, crisp Mithila lotus seeds in a punchy blend of red chilli, paprika, garlic, oregano, and tangy citrus zest. Designed for movie nights, late-evening cravings, and spice lovers across India.',
    price: 299,
    salePrice: 239,
    weight: '90g Jar',
    sku: 'MM-RST-PERI-90',
    stock: 62,
    primaryImage: OFFICIAL_ASSETS.fourJarsLineup,
    imageCrop: 'peri-peri',
    gallery: [
      OFFICIAL_ASSETS.flavourCollection,
      OFFICIAL_ASSETS.fourJarsLineup,
    ],
    highlights: [
      'Bold tangy Peri Peri spice crafted for crunch lovers',
      'Slow-roasted Mithila makhana — never deep-fried',
      'Naturally gluten-free & rich in plant protein',
      'Hygienically sealed 90g reusable jar',
    ],
    ingredients:
      'Popped Lotus Seeds (Makhana), Edible Vegetable Oil, Red Chilli Powder, Paprika, Garlic Powder, Onion Powder, Oregano, Iodized Salt, Acidity Regulator (Citric Acid), Spice Extracts.',
    nutrition: {
      servingSize: '30g',
      energy: '134 kcal',
      protein: '3.0g',
      carbohydrates: '21.0g',
      dietaryFiber: '2.8g',
      totalFat: '4.0g',
    },
    shelfLife: '6 Months from date of packaging',
    storage: 'Keep tightly sealed in a cool, dry place.',
    faq: [
      {
        question: 'How spicy is the Peri Peri flavour?',
        answer: 'Medium-high tang and chilli warmth — bold and zesty without overpowering the natural crunch of makhana.',
      },
    ],
    seoTitle: 'Peri Peri Roasted Makhana 90g Jar | MAKH AND MORE',
    seoDescription:
      'Order fiery, crunchy Peri Peri Roasted Makhana 90g crafted from authentic Mithila fox nuts. Hygienically packed by MAKH AND MORE.',
    published: true,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },
  {
    id: 'roasted-makhana-cheese-90g',
    name: 'Cheese Makhana 90g',
    slug: 'roasted-makhana-cheese-90g',
    category: 'flavoured-makhana',
    flavour: 'Cheese',
    shortDescription:
      'Rich, savoury cheddar-style cheese seasoning lightly dusted over airy roasted Mithila makhana.',
    description:
      'Loved by kids and adults alike, our Cheese Roasted Makhana transforms wholesome Mithila fox nuts into a creamy, savoury treat. Slow-roasted to perfection and evenly seasoned for melt-in-the-mouth cheese richness with a satisfying, light crunch.',
    price: 299,
    salePrice: 239,
    weight: '90g Jar',
    sku: 'MM-RST-CHS-90',
    stock: 55,
    primaryImage: OFFICIAL_ASSETS.fourJarsLineup,
    imageCrop: 'cheese',
    gallery: [
      OFFICIAL_ASSETS.flavourCollection,
      OFFICIAL_ASSETS.fourJarsLineup,
    ],
    highlights: [
      'Creamy savoury cheese coating loved by kids & families',
      'Roasted, never fried — smart alternative to cheese puffs',
      'Rich in fibre & plant protein from Darbhanga makhana',
      'Airtight 90g jar keeps every kernel crisp',
    ],
    ingredients:
      'Popped Lotus Seeds (Makhana), Edible Vegetable Oil, Cheese Powder (Milk Solids), Iodized Salt, Yeast Extract, Mild Spices & Condiments.',
    nutrition: {
      servingSize: '30g',
      energy: '136 kcal',
      protein: '3.3g',
      carbohydrates: '20.8g',
      dietaryFiber: '2.6g',
      totalFat: '4.2g',
    },
    shelfLife: '6 Months from date of packaging',
    storage: 'Store in a cool, dry place and close the lid firmly after each serving.',
    faq: [
      {
        question: 'Is Cheese Makhana suitable for kids tiffins?',
        answer: 'Yes, it is a mild, crunchy, non-fried snack popular for school tiffins and evening snacking.',
      },
    ],
    seoTitle: 'Cheese Roasted Makhana 90g Jar | MAKH AND MORE',
    seoDescription:
      'Buy MAKH AND MORE Cheese Roasted Makhana 90g — rich cheesy crunch on wholesome Mithila fox nuts at ₹239.',
    published: true,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },
  {
    id: 'roasted-makhana-himalayan-salt-90g',
    name: 'Himalayan Salt Makhana 90g',
    slug: 'roasted-makhana-himalayan-salt-90g',
    category: 'roasted-makhana',
    flavour: 'Himalayan Salt',
    shortDescription:
      'Pure, minimalist crunch lightly seasoned with natural Himalayan Pink Salt — ideal for daily snacking & fasting.',
    description:
      'When the harvest is this good, simplicity shines. Our Himalayan Salt Roasted Makhana celebrates the delicate, nutty taste of authentic Mithila lotus seeds with just a whisper of natural Himalayan pink salt. Clean, crisp, and versatile for workdays, post-workout munching, or traditional vrat days.',
    price: 299,
    salePrice: 239,
    weight: '90g Jar',
    sku: 'MM-RST-HIM-90',
    stock: 80,
    primaryImage: OFFICIAL_ASSETS.fourJarsLineup,
    imageCrop: 'himalayan',
    gallery: [
      OFFICIAL_ASSETS.flavourCollection,
      OFFICIAL_ASSETS.fourJarsLineup,
    ],
    highlights: [
      'Lightly seasoned with authentic Himalayan Pink Salt',
      'Clean-label ingredients — zero artificial colours or preservatives',
      'Roasted, light, low-calorie & gluten-free',
      'Freshly sealed in a 90g airtight jar',
    ],
    ingredients: 'Popped Lotus Seeds (Makhana), Edible Vegetable Oil, Himalayan Pink Salt (Sendha Namak).',
    nutrition: {
      servingSize: '30g',
      energy: '125 kcal',
      protein: '3.2g',
      carbohydrates: '21.8g',
      dietaryFiber: '3.0g',
      totalFat: '2.9g',
    },
    shelfLife: '6 Months from date of packaging',
    storage: 'Store in a cool, dry place. Reseal jar tightly after opening.',
    faq: [
      {
        question: 'Can Himalayan Salt Makhana be eaten during fasting (vrat)?',
        answer: 'It is seasoned strictly with Himalayan Pink Salt (Sendha Namak) and popped lotus seeds. Check your personal fasting customs regarding oil.',
      },
    ],
    seoTitle: 'Himalayan Salt Roasted Makhana 90g Jar | MAKH AND MORE',
    seoDescription:
      'Shop Himalayan Salt Roasted Makhana 90g by MAKH AND MORE. Pure Mithila fox nuts lightly salted with Himalayan pink salt.',
    published: true,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },
  {
    id: 'premium-jumbo-makhana-200g',
    name: 'Premium Jumbo Makhana 200g',
    slug: 'premium-jumbo-makhana-200g',
    category: 'makhana',
    flavour: 'Natural Plain',
    shortDescription:
      'Extra-large 6-Suta grade raw Mithila Jumbo Makhana pouch (200g) — handpicked directly from Darbhanga farms.',
    description:
      'Our flagship family pack of raw, unflavoured Premium Jumbo Makhana. Harvested from the nutrient-rich wetlands of Mithila, Darbhanga, each pearl-white kernel is carefully graded for jumbo size, uniform puff, and zero husk residue. Dry-roast with ghee at home, simmer into festive makhana kheer, or add to rich Indian curries.',
    price: 599,
    salePrice: 449,
    weight: '200g Zipper Pouch',
    sku: 'MM-JMB-200',
    stock: 92,
    primaryImage: OFFICIAL_ASSETS.jumboPouch,
    imageCrop: 'none',
    gallery: [
      OFFICIAL_ASSETS.jumboPouch,
      OFFICIAL_ASSETS.heroSnacks,
      OFFICIAL_ASSETS.farmer,
    ],
    highlights: [
      '100% Natural, raw jumbo-sized Mithila Makhana (200g family pouch)',
      'Gluten-free, hygienically processed & rich in plant protein',
      'Resealable zip-lock stand-up pouch preserves natural freshness',
      'Proudly crafted in Mithila, Darbhanga, Bihar',
    ],
    ingredients: '100% Natural Raw Popped Lotus Seeds (Mithila Jumbo Makhana). Zero additives.',
    nutrition: {
      servingSize: '100g (raw)',
      energy: '347 kcal',
      protein: '9.7g',
      carbohydrates: '76.9g',
      dietaryFiber: '14.5g',
      totalFat: '0.1g',
    },
    shelfLife: '9 Months from date of packaging',
    storage: 'Keep zip-lock sealed tightly in a cool, dry place away from moisture.',
    faq: [
      {
        question: 'Is Jumbo Makhana raw or roasted?',
        answer: 'This pouch contains 100% natural raw jumbo makhana so you can roast it fresh with ghee/spices or use it in kheer and curries.',
      },
      {
        question: 'How do I roast it at home?',
        answer: 'Dry-roast on low flame for 5–7 minutes with a teaspoon of ghee or oil until crisp, then toss with your favourite spices.',
      },
    ],
    seoTitle: 'Premium Jumbo Makhana 200g Pouch | Authentic Mithila Fox Nuts',
    seoDescription:
      'Buy 100% natural Premium Jumbo Makhana 200g directly from Darbhanga, Bihar. Hygienically packed zip pouch at ₹449 with free shipping.',
    published: true,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },
  {
    id: 'premium-jumbo-makhana-100g',
    name: 'Premium Jumbo Makhana 100g',
    slug: 'premium-jumbo-makhana-100g',
    category: 'makhana',
    flavour: 'Natural Plain',
    shortDescription:
      '100% natural, extra-large raw Mithila Jumbo Makhana in a resealable 100g freshness pouch.',
    description:
      'Experience authentic Darbhanga harvest quality in a convenient 100g resealable pouch. Hand-selected for bold jumbo kernel size and pristine white puff, our Premium Jumbo Makhana is hygienically cleaned, naturally gluten-free, and endlessly versatile for home roasting, fasting recipes, and wholesome everyday cooking.',
    price: 299,
    salePrice: 229,
    weight: '100g Zipper Pouch',
    sku: 'MM-JMB-100',
    stock: 115,
    primaryImage: OFFICIAL_ASSETS.jumboPouch,
    imageCrop: 'none',
    gallery: [
      OFFICIAL_ASSETS.jumboPouch,
      OFFICIAL_ASSETS.heroSnacks,
      OFFICIAL_ASSETS.farmer,
    ],
    highlights: [
      '100% Natural jumbo Mithila fox nuts (100g pouch)',
      'Gluten-free, hygienically processed, rich in protein',
      'Zero preservatives, zero artificial polish',
      'Proudly crafted in Mithila, Darbhanga, Bihar',
    ],
    ingredients: '100% Natural Raw Popped Lotus Seeds (Mithila Jumbo Makhana).',
    nutrition: {
      servingSize: '100g (raw)',
      energy: '347 kcal',
      protein: '9.7g',
      carbohydrates: '76.9g',
      dietaryFiber: '14.5g',
      totalFat: '0.1g',
    },
    shelfLife: '9 Months from date of packaging',
    storage: 'Store in a cool, dry place and zip shut tightly after opening.',
    faq: [
      {
        question: 'What makes Mithila Makhana special?',
        answer: 'Mithila (Darbhanga, Bihar) produces India’s most renowned fox nuts, prized for their large puff size, tender crunch, and GI-heritage cultivation.',
      },
    ],
    seoTitle: 'Premium Jumbo Makhana 100g Pouch | MAKH AND MORE',
    seoDescription:
      'Order 100% natural Premium Jumbo Makhana 100g from MAKH AND MORE. Farm-fresh Darbhanga fox nuts for ₹229.',
    published: true,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },
];

export const INITIAL_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    eyebrow: 'Authentic Mithila Harvest · Darbhanga',
    title: 'Pure. Natural. Delicious.',
    subtitle:
      'Handpicked Mithila Makhana crafted with care. Roasted, never fried — bursting with crisp flavour.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    secondaryCtaText: '4-Flavour Combo',
    secondaryCtaLink: '/category/makhana-combo',
    image: OFFICIAL_ASSETS.heroSnacks,
    order: 1,
    active: true,
  },
  {
    id: 'banner-2',
    eyebrow: 'Roasted. Flavoured. Makhana.',
    title: 'Bold Crunch, Real Flavour.',
    subtitle:
      'Discover four slow-roasted jars — Cheese, Pudina, Himalayan Salt & Peri Peri. Crunch without the fry.',
    ctaText: 'Shop Combo',
    ctaLink: '/product/roasted-makhana-combo-4-flavours',
    secondaryCtaText: 'All Flavours',
    secondaryCtaLink: '/category/flavoured-makhana',
    image: OFFICIAL_ASSETS.flavourCollection,
    order: 2,
    active: true,
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coupon-makh20',
    code: 'MAKH20',
    type: 'percent',
    value: 20,
    minOrderAmount: 599,
    maxDiscount: 400,
    active: true,
    description: '20% OFF on orders of ₹599 or more',
  },
  {
    id: 'coupon-mithila10',
    code: 'MITHILA10',
    type: 'percent',
    value: 10,
    minOrderAmount: 299,
    maxDiscount: 150,
    active: true,
    description: '10% OFF on orders above ₹299',
  },
];

export const INITIAL_BLOGS: BlogArticle[] = [
  {
    id: 'blog-mithila-heritage',
    title: 'Why Mithila Makhana Is India’s Finest Fox Nut',
    slug: 'why-mithila-makhana-is-indias-finest-fox-nut',
    excerpt:
      'Step inside the lush ponds of Darbhanga, Bihar to discover the centuries-old craft behind authentic, extra-large Mithila Makhana.',
    content: `## The Pride of Darbhanga’s Wetlands

Long before fox nuts became a modern pantry staple across urban India, generations of farming families in Mithila — centered around Darbhanga and Madhubani in Bihar — mastered the delicate art of cultivating *Euryale ferox*, locally revered as Makhana.

Growing makhana is nothing like ordinary field agriculture. Farmers wade into tranquil freshwater ponds to sow, tend, and hand-collect dark lotus seeds from the pond floor using traditional woven bamboo baskets.

## From Pond Seed to Pearl-White Pop

Once harvested, the seeds undergo a meticulous multi-stage process:
- **Washing and Sun-Drying**: Fresh seeds are thoroughly washed and sun-dried to balance moisture.
- **Size Grading**: Seeds are sorted through sieves so only uniform, jumbo kernels pop evenly.
- **Traditional Roasting & Popping**: Skilled artisans roast the seeds in heated iron pans and swiftly crack the outer shell with wooden mallets, revealing the crisp, snow-white puffed kernel inside.

## How to Spot Genuine Premium Jumbo Makhana

True Mithila jumbo makhana stands apart in three simple ways:
1. **Large, Round Kernel Size**: High-grade kernels puff generously with minimal dark shell flecks.
2. **Clean Aroma & Crisp Texture**: Freshly packed makhana snaps cleanly when roasted and absorbs spices or milk evenly.
3. **Transparent Origin**: Buying directly from Mithila-rooted brands like MAKH AND MORE ensures fresher harvest batches and fair value for local farming communities.

*Note: Nutritional attributes discussed in our journal are general food information and not medical advice.*`,
    category: 'Mithila Heritage',
    featuredImage: OFFICIAL_ASSETS.farmer,
    author: 'MAKH AND MORE Editorial',
    readTime: '4 min read',
    tags: ['Mithila Makhana', 'Darbhanga', 'Farm to Home'],
    relatedProductSlugs: ['premium-jumbo-makhana-200g', 'premium-jumbo-makhana-100g'],
    seoTitle: 'Why Mithila Makhana from Darbhanga Is India’s Finest Fox Nut',
    seoDescription:
      'Discover how traditional Mithila farmers in Darbhanga cultivate, harvest, and pop authentic jumbo makhana.',
    published: true,
    publishedAt: '2026-09-18',
  },
  {
    id: 'blog-5-ways-roasted-makhana',
    title: '5 Wholesome Ways to Enjoy Roasted Makhana Every Day',
    slug: '5-wholesome-ways-to-enjoy-roasted-makhana-daily',
    excerpt:
      'From 4 PM chai cravings to crisp salad toppers and festive bowls, here are five effortless ways to swap fried snacks for roasted makhana.',
    content: `## Reimagining Everyday Indian Snacking

Most of us reach for whatever is closest at 4 PM — usually deep-fried namkeen or sugar-heavy biscuits. Keeping a jar of slow-roasted makhana within arm’s reach turns that afternoon pause into a lighter, crunchy ritual.

## 1. The 4 PM Masala Chai Companion
Pair a handful of **Pudina Roasted Makhana** with steaming ginger chai. The refreshing garden mint and mild chaat notes balance rich tea without leaving greasy fingers.

## 2. Work-Desk Focus Bowl
Keep **Himalayan Salt Makhana** beside your laptop. Lightly salted with pure pink salt and naturally gluten-free, it offers satisfying crunch through long afternoon calls.

## 3. Crunchy Soup & Salad Croutons
Skip refined-flour croutons and scatter **Cheese** or **Peri Peri Makhana** over hot tomato soup or a fresh cucumber-corn salad right before serving.

## 4. Quick 5-Minute Makhana Chaat
Toss roasted makhana with finely chopped onion, tomato, coriander, roasted peanuts, and a squeeze of fresh lemon juice for an instant evening bowl.

## 5. Festive Homemade Ghee-Roasted Kheer
For traditional family gatherings, lightly crush our **Premium Jumbo Makhana**, toast in a spoon of ghee, and simmer slowly with milk, cardamom, and slivered almonds.`,
    category: 'Recipes & Snacking',
    featuredImage: OFFICIAL_ASSETS.heroSnacks,
    author: 'MAKH AND MORE Kitchen',
    readTime: '5 min read',
    tags: ['Healthy Snacking', 'Recipes', 'Roasted Makhana'],
    relatedProductSlugs: ['roasted-makhana-combo-4-flavours', 'roasted-makhana-pudina-90g'],
    seoTitle: '5 Wholesome Ways to Enjoy Roasted Makhana Every Day | MAKH AND MORE',
    seoDescription:
      'Explore 5 easy, delicious ways to include roasted and jumbo Mithila makhana in your daily snacks, salads, and recipes.',
    published: true,
    publishedAt: '2026-10-04',
  },
  {
    id: 'blog-flavour-guide',
    title: 'Choosing Your Signature Flavour: Pudina, Peri Peri, Cheese or Himalayan Salt?',
    slug: 'from-darbhanga-wetlands-to-your-snack-bowl',
    excerpt:
      'A tasting guide to all four MAKH AND MORE slow-roasted makhana jars so you can pick the crunch that matches every mood.',
    content: `## Crafted for Indian Palates, Roasted Never Fried

Every flavour in the MAKH AND MORE collection starts with the exact same foundation: hand-selected Mithila makhana roasted gently until crisp, then tumbled with thoughtfully balanced spice blends.

## Pudina — Cool & Tangy
Built with real dried mint leaves and traditional Indian chaat spices, Pudina is our go-to choice for tea-time snacking and warm afternoons.

## Peri Peri — Bold & Zesty
Red chilli, paprika, oregano, and a lively citrus kick make Peri Peri the instant favourite for movie nights and weekend gatherings.

## Cheese — Creamy & Savoury
Smooth, comforting cheddar-style seasoning loved equally by kids’ lunchboxes and late-night snackers looking for a lighter swap for fried cheese puffs.

## Himalayan Salt — Pure & Minimalist
Just crisp roasted makhana and natural Himalayan pink salt — ideal when you want pure, understated crunch with clean ingredients.

## Can’t Pick Just One?
Our **Premium Roasted Makhana Combo – 4 Flavours** includes full 90g jars of all four flavours at a special bundle price — making it the easiest way to discover your household favourite.`,
    category: 'Flavour Guide',
    featuredImage: OFFICIAL_ASSETS.flavourCollection,
    author: 'MAKH AND MORE Editorial',
    readTime: '3 min read',
    tags: ['Flavoured Makhana', 'Tasting Guide', 'Combo'],
    relatedProductSlugs: ['roasted-makhana-combo-4-flavours', 'roasted-makhana-peri-peri-90g'],
    seoTitle: 'MAKH AND MORE Flavour Guide: Pudina, Peri Peri, Cheese & Himalayan Salt',
    seoDescription:
      'Compare Pudina, Peri Peri, Cheese, and Himalayan Salt roasted makhana flavours from MAKH AND MORE.',
    published: true,
    publishedAt: '2026-10-28',
  },
];

export const GENERAL_FAQS = [
  {
    question: 'Where does MAKH AND MORE source its makhana?',
    answer:
      'All our makhana is sourced directly from authentic makhana farms in Mithila (Darbhanga, Bihar) and hygienically processed & packed by ASR Enterprises.',
  },
  {
    question: 'Are your flavoured makhana jars fried or roasted?',
    answer:
      'Every jar of Pudina, Peri Peri, Cheese, and Himalayan Salt makhana is slow-roasted for natural crunch — never deep-fried.',
  },
  {
    question: 'What are the shipping charges and free shipping offer?',
    answer:
      'We offer Free Shipping across India on all orders of ₹299 and above. Orders below ₹299 carry a flat ₹49 shipping fee.',
  },
  {
    question: 'How does the 20% OFF offer work?',
    answer:
      'When your cart subtotal reaches ₹599 or more, you automatically unlock 20% OFF (or apply code MAKH20 at checkout).',
  },
  {
    question: 'Do I need to create an account before shopping?',
    answer:
      'No! You can browse, add to cart, and save wishlist items freely. At checkout, simply verify your WhatsApp number in one tap (or use Guest Checkout / Google Sign-In) to complete your order quickly.',
  },
  {
    question: 'Is Cash on Delivery (COD) available across India?',
    answer:
      'Yes, Cash on Delivery is available on serviceable PIN codes across India alongside secure online payments.',
  },
  {
    question: 'How can I contact MAKH AND MORE support?',
    answer:
      'Reach us on WhatsApp or call +91 9135 986 786, or email info@makhandmore.com (Mon–Fri 6:30 AM–8:00 PM, Sat 7:30 AM–8:00 PM, Sun Closed).',
  },
];
