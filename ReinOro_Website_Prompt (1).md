# REIN ORO — PREMIUM E-COMMERCE WEBSITE
## Full-Stack Production Build Prompt
### Prepared by Digital Byte Solutions

---

## MISSION

You are building the official e-commerce website for **Rein Oro — Premium Dry Fruits**, a luxury health snack brand selling premium Makhana and dry fruits in the Indian market. This is not a template. This is not a Shopify store. This is a bespoke, conversion-engineered, luxury digital storefront that competes visually with global premium brands like Kama Ayurveda, Forest Essentials, and John Masters Organics — but with the speed, animation depth, and modern engineering of Apple.com. Every pixel, every transition, every scroll event must make the visitor feel they are interacting with a ₹10,000-crore brand. You are building to convert. You are building to impress. You are building for launch.

---

## BRAND IDENTITY

**Brand Name:** Rein Oro
**Tagline:** *Purity Crowned in Gold*
**Sub-tagline:** *Premium Dry Fruits & Makhana — Crafted for the Discerning*
**Brand Voice:** Authoritative. Luxurious. Quietly confident. Never loud. Never cheap.
**Emotional Target:** The moment someone unboxes a gift from Tiffany & Co. — that silence, that reverence, that feeling that what they are holding is exceptional.
**Market Position:** Ultra-premium health snack brand. Health-conscious urban Indians, fitness professionals, gifting market, premium households.

---

## DESIGN SYSTEM — DO NOT DEVIATE

### TYPOGRAPHY

- **Display / Hero Headlines:** `Cormorant Garamond` — weight 700, letter-spacing: -0.02em. Use exclusively for H1s, hero text, section titles.
- **Sub-headlines / Product Names:** `Cormorant Garamond` — weight 400, italic variant for elegance on product cards.
- **Body / UI Text:** `Jost` — weight 300 (body), 500 (labels/CTAs), 600 (navigation). Clean, modern, Indian-market legible.
- **Accent / Price Tags / Badges:** `Cinzel` — weight 400. Used sparingly for price numerals and luxury badge text only.
- **Import:** Google Fonts — Cormorant Garamond (300, 400, 400i, 600, 700), Jost (300, 400, 500, 600), Cinzel (400, 600).
- **Base size:** 16px. Line-height: 1.7 for body. Hero headline: clamp(48px, 8vw, 96px).

### COLOR PALETTE

```
--rein-black:        #0A0A0A   /* Primary background */
--rein-charcoal:     #141414   /* Cards, sections */
--rein-surface:      #1C1A16   /* Warm dark surface */
--rein-gold-primary: #C9A84C   /* Main gold — CTAs, accents */
--rein-gold-light:   #E8C97A   /* Hover states, glow */
--rein-gold-dim:     #8A6F32   /* Subtle borders, dividers */
--rein-cream:        #F5EDD6   /* Text on dark backgrounds */
--rein-white:        #FFFFFF   /* Pure white — sparingly */
--rein-gray-light:   #9A9485   /* Muted body text */
--rein-gray-mid:     #4A4640   /* Disabled states */
--rein-success:      #4A7C59   /* Order confirmed green */
--rein-error:        #8B3A3A   /* Form errors */
--rein-overlay:      rgba(10,10,10,0.85) /* Modal overlays */
```

**Background Logic:** `#0A0A0A` is your base. Sections alternate between `#0A0A0A` and `#1C1A16` using a warm dark brown-black to prevent monotony. Never use pure white backgrounds. Never use cool grays. The warmth of `#1C1A16` references natural makhana and wood — this is intentional and subconscious brand reinforcement.

**Gold Logic:** `#C9A84C` is the brand gold. It is warm, earthy, and authentic — not the garish metallic yellow of cheap brands. Use it for primary CTAs, underline accents, star ratings, and selected states. Apply a linear-gradient from `#C9A84C` to `#E8C97A` on hover states only. Never fill large surfaces with gold — it cheapens the luxury.

### TEXTURE & DEPTH

Apply a 3% opacity diagonal grain texture overlay (use CSS `background-image: url("data:image/svg+xml,...")` noise SVG) on every full-bleed dark section. This adds material depth and prevents the "flat dark" AI aesthetic. The grain should be invisible at first glance and felt subconsciously.

Add a radial `rgba(201,168,76,0.04)` gold glow on the `body` element, centered at 50% 0% — this creates a subtle warm bloom at the top of every page.

---

## TECH STACK — MANDATORY

```
Frontend Framework:   Next.js 14 (App Router, RSC)
Styling:              Tailwind CSS + CSS custom properties (above palette)
Animations:           GSAP 3.12 + ScrollTrigger plugin
Carousel/Sliders:     Swiper.js 11
Icons:                Phosphor Icons (React)
3D/Particle Effects:  particles.js (hero section only)
Image Optimization:   Next.js <Image> — WebP, lazy load, blur placeholder
State Management:     Zustand (cart, user session)
Database & Auth:      Firebase v9 (Firestore, Auth, Storage)
Payments:             Razorpay (React SDK)
Notifications:        Firebase Cloud Messaging (push) + Nodemailer (email)
SMS:                  MSG91 API (order updates)
SEO:                  Next.js Metadata API, JSON-LD structured data, sitemap.xml
Hosting:              Vercel (customer site) + Firebase Hosting (admin PWA)
Domain:               reinoro.com (placeholder — connect at launch)
```

---

## PAGE ARCHITECTURE

Build the following pages as the complete sitemap:

```
/                          → Home (Landing + Hero + Features)
/products                  → Full product catalog
/products/[slug]           → Individual product detail page
/cart                      → Shopping cart (slide-in drawer + dedicated page)
/checkout                  → Multi-step checkout (address → payment → confirm)
/order-confirmation/[id]   → Post-purchase confirmation
/account                   → Customer account (login/register)
/account/orders            → Order history
/account/profile           → Profile management
/about                     → Brand story
/contact                   → Contact page
/policies/shipping         → Shipping policy
/policies/returns          → Return policy
/policies/privacy          → Privacy policy
/admin                     → Admin PWA root (auth-gated)
/admin/dashboard           → Sales overview
/admin/products            → Product management
/admin/products/new        → Add product form
/admin/products/[id]/edit  → Edit product form
/admin/orders              → Order management
/admin/orders/[id]         → Order detail
/admin/customers           → Customer list
/admin/analytics           → Revenue & insights
/admin/settings            → Store configuration
```

---

## SECTION-BY-SECTION BUILD SPEC

### SECTION 01 — NAVIGATION

Build a fixed, scroll-aware navbar. On load: transparent background, logo centered, nav links left, actions right. On scroll past 80px: background transitions to `rgba(10,10,10,0.96)` with `backdrop-filter: blur(20px)` and a 1px bottom border in `#C9A84C` at 30% opacity. Transition: `all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`.

**Left:** `Home | Shop | Our Story | Contact` — Jost 500, 14px, letter-spacing: 0.12em, text-transform: uppercase, color: `#F5EDD6`. Hover: color transitions to `#C9A84C` with a 0.6px underline animation sliding in from left.

**Center:** Rein Oro logo SVG (use the uploaded logo as `<img>` tag with `width: 140px`). On mobile: shrinks to `110px`.

**Right:** Phosphor `MagnifyingGlass` icon (search), Phosphor `User` icon (account), Phosphor `ShoppingBag` icon (cart with animated counter badge). Cart badge: `#C9A84C` background, `#0A0A0A` text, Cinzel font, bounces on item add using `GSAP.fromTo` scale 1→1.4→1 with `elastic.out(1, 0.5)` easing.

**Mobile:** Hamburger becomes a full-screen overlay menu with staggered GSAP link reveals. Menu background: `#0A0A0A`, links large (Cormorant Garamond 700, 52px).

---

### SECTION 02 — HERO

This is the most critical section. It is a full-viewport cinematic experience that must arrest the visitor within 1.2 seconds.

**Background:** `#0A0A0A` with particles.js configured for floating gold particle field — 60 particles, `#C9A84C` at 0.3 opacity, random size 1–3px, slow drift speed (0.3), no line connections. This simulates premium product dust/shimmer.

**Layout:** Split 55/45. Left: headline stack + CTA. Right: hero product image on floating gold-rimmed circular platform.

**Left Stack (GSAP stagger reveal on page load, `power3.out`, 0.8s, stagger 0.12s):**
```
EYEBROW:  "CRAFTED FOR THE DISCERNING" — Jost 500, 11px, letter-spacing: 0.35em, color: #C9A84C
H1:       "The Gold Standard" — Cormorant Garamond 700, clamp(56px,7vw,96px), color: #F5EDD6
H1 LINE2: "of Healthy Snacking." — same, italic variant, color: #E8C97A
BODY:     "Rein Oro brings you India's finest Makhana — roasted to perfection, 
           seasoned with heritage, delivered to your door." 
          — Jost 300, 18px, color: #9A9485, max-width: 480px
CTA ROW:  [PRIMARY BUTTON] [SECONDARY LINK]
```

**Primary CTA:** "Explore Collection" — Jost 600, 14px, letter-spacing: 0.2em, uppercase. Background: `linear-gradient(135deg, #C9A84C, #E8C97A)`. Color: `#0A0A0A`. Padding: 16px 40px. Border-radius: 2px (sharp luxury corner). On hover: `box-shadow: 0 0 40px rgba(201,168,76,0.35)`, slight translateY(-2px). Transition: `all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)`.

**Secondary CTA:** "Watch Our Story →" — Jost 400, 14px, color: `#9A9485`. Hover: color `#C9A84C`. This is a ghost link, no button styling.

**Right side:** Large product image (placeholder: `/images/hero-product.png`) displayed inside a `border-radius: 50%` container with a gold gradient ring border (`border: 2px solid transparent; background: linear-gradient(#1C1A16,#1C1A16) padding-box, linear-gradient(135deg,#C9A84C,#8A6F32) border-box`). Apply CSS `animation: float 6s ease-in-out infinite` — translateY oscillating ±16px. Behind image: large radial blur glow `rgba(201,168,76,0.12)` — 600px circle.

**Scroll Indicator:** Bottom center. Animated Phosphor `ArrowDown` icon + "Scroll to Discover" text. GSAP pulse animation on the arrow. Disappears on first scroll.

---

### SECTION 03 — TRUST BAR

Full-width horizontal marquee (CSS `animation: marquee 25s linear infinite`). Background: `#1C1A16`. Content items separated by small Rein Oro lotus ornament SVG (recreate from logo):

```
✦ 100% Natural   ✦ No Preservatives   ✦ Cold-Pressed Oils   ✦ Premium Grade A Makhana
✦ Lab Certified   ✦ Free Shipping on ₹599+   ✦ 10,000+ Happy Customers   ✦ Pan India Delivery
```

Text: Jost 500, 13px, letter-spacing: 0.2em, uppercase, color: `#9A9485`. Gold ornament `✦` in `#C9A84C`.

---

### SECTION 04 — FEATURED COLLECTION

**Section Header:**
```
EYEBROW: "OUR COLLECTION" — centered, Jost 500, 11px, letter-spacing: 0.4em, color: #C9A84C
H2: "Flavors Worthy of the Crown" — Cormorant Garamond 700, 52px, color: #F5EDD6, centered
```

**Product Grid:** 4-column on desktop, 2-column on tablet, 1-column on mobile. CSS Grid. Gap: 24px.

**Product Card Design:**
- Background: `#141414`
- Border: `1px solid rgba(201,168,76,0.12)`
- Border-radius: `4px`
- Overflow: hidden
- Transition: `transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease`
- On hover: `transform: translateY(-8px)`, `box-shadow: 0 24px 80px rgba(201,168,76,0.12)`, border-color upgrades to `rgba(201,168,76,0.4)`

**Card Image Area:**
- Aspect ratio: 1:1
- Background: `#1C1A16`
- Image: `object-fit: cover`, scale to 1.06 on hover (CSS transition 0.6s ease)
- Top-left badge (if on sale): Jost 600, 11px, "SALE" or "NEW" — background: `#C9A84C`, color: `#0A0A0A`, padding: 4px 10px
- Add to cart overlay: on card hover, semi-transparent overlay slides up from bottom (translateY 100% → 0, 0.35s). Contains "ADD TO CART" button and Phosphor `Eye` (quick view) icon.

**Card Body (padding: 20px):**
```
PRODUCT NAME: Cormorant Garamond 400 italic, 20px, color: #F5EDD6
WEIGHT:       Jost 300, 13px, color: #9A9485 (e.g., "250g")
RATING ROW:   5 gold stars (Phosphor Star, weight fill, color: #C9A84C) + review count
PRICE ROW:    Cinzel 600, 20px, color: #C9A84C — "₹249"
              If discounted: original price in Jost 300, 14px, color: #4A4640, line-through
```

**ScrollTrigger:** Cards animate in with GSAP `fromTo` — `opacity: 0, y: 60` to `opacity: 1, y: 0`, stagger 0.1s, triggered when 80% into viewport.

**Below Grid:** "View All Products →" ghost CTA — centered, Jost 500, 13px, letter-spacing 0.2em, uppercase, color `#C9A84C`, with a 1px gold underline on hover.

---

### SECTION 05 — BRAND STORY / WHY REIN ORO

**Layout:** Two-column. Left: rich editorial image stack (2 images overlapping, rotated ±3deg). Right: story text.

**Headline:** `"The Art of the Exceptional Snack"` — Cormorant Garamond 700, 48px.

**Body:** 3 paragraphs, Jost 300, 17px, color `#9A9485`, line-height 1.85. Use placeholder lorem ipsum shaped as brand copy about Makhana heritage, sourcing from Bihar's premier farms, and the Rein Oro roasting process.

**3 Stat Counters (GSAP CountTo on scroll enter):**
```
10,000+   Happy Customers
50+       Flavors Crafted
100%      Naturally Sourced
```
Counter numerals: Cinzel 600, 48px, color: `#C9A84C`. Label: Jost 400, 14px, color: `#9A9485`.

---

### SECTION 06 — BESTSELLERS SWIPER

**Swiper.js config:** `slidesPerView: 1.2` (mobile), `2.2` (tablet), `3.5` (desktop). `spaceBetween: 24`. `grabCursor: true`. `loop: true`. `autoplay: { delay: 3500, disableOnInteraction: false }`. Custom gold navigation arrows (Phosphor `ArrowLeft` / `ArrowRight`). Gold pagination bullets.

**Section label:** "BESTSELLERS" eyebrow above a `"What Everyone's Ordering"` Cormorant headline.

---

### SECTION 07 — UGC / TESTIMONIALS

**Layout:** Masonry-style 3-column testimonial cards. Each card:
- Background: `#141414`
- Border-left: `3px solid #C9A84C`
- Padding: 28px
- Quote text: Cormorant Garamond 400 italic, 18px, color: `#F5EDD6`
- Customer name: Jost 600, 13px, letter-spacing: 0.15em, uppercase, color: `#C9A84C`
- Location: Jost 300, 13px, color: `#9A9485`
- Star rating: Phosphor Star filled, `#C9A84C`

**8 placeholder testimonials.** On mobile: Swiper carousel, 1 per slide.

---

### SECTION 08 — GIFTING / PREMIUM PACKAGING CTA

**Full-width section, 100vh.** Background: fixed parallax image of premium black and gold product packaging (placeholder: `/images/gift-bg.jpg`). Dark overlay: `rgba(10,10,10,0.72)`.

**Center content (GSAP fade-in on scroll):**
```
EYEBROW:  "GIFT REIN ORO"
H2:       "When Ordinary Gifts Won't Do."
BODY:     "Handcrafted gift hampers. Premium packaging. Pan-India delivery."
CTA:      "Build Your Gift Box" — primary gold button
```

---

### SECTION 09 — FOOTER

**4-column footer.** Background: `#0A0A0A`. Top border: `1px solid rgba(201,168,76,0.2)`. Padding: 80px 0 40px.

```
COL 1: Rein Oro logo + 2-line brand tagline + social icons (Phosphor: InstagramLogo, FacebookLogo, YoutubeLogo — placeholders: [INSTAGRAM_URL] [FACEBOOK_URL] [YOUTUBE_URL])

COL 2: SHOP
  All Products | Bestsellers | New Arrivals | Gift Hampers | Bulk Orders

COL 3: COMPANY  
  About Us | Blog | Careers | Press | Contact

COL 4: SUPPORT
  Shipping Policy | Return Policy | Privacy Policy | FAQs | Track Order
```

**Newsletter Bar (above footer columns):** Full-width. "Join the Rein Oro Inner Circle" + email input + "Subscribe" button. Input: dark border, gold focus ring. Integrates with [MAILCHIMP_API_PLACEHOLDER] or Firebase for email collection.

**Bottom bar:** Copyright `© 2025 Rein Oro. All rights reserved.` Jost 300, 13px. Payment icons: Razorpay badge, UPI, Visa, Mastercard.

---

## PRODUCT DETAIL PAGE (`/products/[slug]`)

**Layout:** Two-column. Left: image gallery. Right: product info.

**Image Gallery:**
- Main image: large square, border: gold ring on hover
- Thumbnail strip: Swiper.js, horizontal, 4 thumbnails, click to update main
- Zoom: on main image hover, CSS `transform: scale(1.08)` with `overflow: hidden`

**Right Column:**
```
BREADCRUMB: Home / Shop / Peri Peri Makhana
PRODUCT NAME: Cormorant Garamond 700, 40px
RATING: Stars + "(124 Reviews)" — anchor scrolls to reviews section
PRICE: Cinzel 600, 32px, color: #C9A84C
SHORT DESCRIPTION: Jost 300, 16px, 2-3 lines
SIZE SELECTOR: Button group (100g | 250g | 500g | 1kg) — selected state: gold border + gold text
QUANTITY SELECTOR: [-] [2] [+] with Jost 600 numerals
ADD TO CART: Full-width gold primary button, Phosphor ShoppingBag icon
BUY NOW: Full-width ghost button (gold border, transparent bg)
WISHLIST: Phosphor Heart icon + "Save for Later" text link
```

**Product Tabs (below fold):** `Description | Ingredients | Nutrition | Reviews` — tab selector with gold underline indicator animated with GSAP.

**Reviews Section:** Star breakdown bar chart + individual review cards. Integrate Firestore reviews collection — `productId`, `userId`, `rating`, `comment`, `createdAt`.

**Related Products:** "You May Also Love" — Swiper carousel of 4 products.

---

## CART & CHECKOUT

**Cart Drawer:** Slides in from right (`translateX(100%) → 0`), `0.45s cubic-bezier(0.25,0.46,0.45,0.94)`. Backdrop overlay fades in. Shows: item list with image/name/qty/price, order subtotal, "Free shipping on orders above ₹599" progress bar, "Proceed to Checkout" gold CTA.

**Checkout Flow (3 steps, progress indicator at top):**

**Step 1 — Delivery:** Name, Phone, Email, Address Line 1, Address Line 2, City, State, Pincode. Pincode auto-fills City + State via India Post API (`[PINCODE_API_PLACEHOLDER]`). Jost 400 inputs, gold focus border, smooth label float animation.

**Step 2 — Payment:** Razorpay standard checkout OR embedded Razorpay element. Display order summary on right. Razorpay key: `[RAZORPAY_KEY_ID_PLACEHOLDER]`. Secret: `[RAZORPAY_SECRET_PLACEHOLDER]`.

**Step 3 — Confirmation:** Gold checkmark animation (GSAP draw SVG stroke). Order number in Cinzel. Summary table. "Download Invoice" + "Continue Shopping" buttons. Triggers: Firebase write to `orders` collection, MSG91 SMS to customer (`[MSG91_AUTH_KEY_PLACEHOLDER]`), Nodemailer confirmation email (`[SMTP_HOST_PLACEHOLDER]`, `[SMTP_USER_PLACEHOLDER]`, `[SMTP_PASS_PLACEHOLDER]`).

---

## FIREBASE DATA SCHEMA

```javascript
// FIRESTORE COLLECTIONS

// products/{productId}
{
  name: string,
  slug: string,           // URL-friendly, unique
  description: string,
  shortDescription: string,
  ingredients: string,
  nutritionFacts: object, // { calories, protein, fat, carbs, fiber }
  images: string[],       // Firebase Storage download URLs
  price: number,          // in INR paise (multiply by 100 for display)
  discountPrice: number | null,
  weight: string[],       // ["100g","250g","500g","1kg"]
  category: string,       // "flavored" | "plain" | "premium" | "combo"
  tags: string[],
  stock: number,
  sku: string,
  rating: number,         // computed avg
  reviewCount: number,
  isFeatured: boolean,
  isBestseller: boolean,
  isActive: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// orders/{orderId}
{
  orderNumber: string,    // "RO-2025-0001"
  customerId: string,     // Firebase Auth UID
  customerName: string,
  customerPhone: string,
  customerEmail: string,
  items: [{
    productId: string,
    name: string,
    image: string,
    weight: string,
    qty: number,
    unitPrice: number,
    totalPrice: number
  }],
  subtotal: number,
  shippingFee: number,
  discount: number,
  couponCode: string | null,
  total: number,
  address: { line1, line2, city, state, pincode },
  paymentId: string,      // Razorpay payment ID
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
  orderStatus: "new" | "processing" | "shipped" | "delivered" | "cancelled",
  trackingNumber: string | null,
  courierPartner: string | null,
  notes: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// customers/{userId}
{
  uid: string,
  name: string,
  email: string,
  phone: string,
  photoURL: string | null,
  addresses: [{
    label: "Home" | "Office" | "Other",
    line1, line2, city, state, pincode,
    isDefault: boolean
  }],
  wishlist: string[],     // productIds
  totalOrders: number,
  totalSpent: number,
  createdAt: Timestamp,
  lastLoginAt: Timestamp
}

// reviews/{reviewId}
{
  productId: string,
  userId: string,
  userName: string,
  rating: number,         // 1-5
  title: string,
  comment: string,
  isVerifiedPurchase: boolean,
  createdAt: Timestamp
}

// coupons/{code}
{
  code: string,
  type: "flat" | "percent",
  value: number,
  minOrderValue: number,
  maxUses: number,
  usedCount: number,
  validUntil: Timestamp,
  isActive: boolean
}

// analytics/daily/{YYYY-MM-DD}
{
  date: string,
  totalRevenue: number,
  totalOrders: number,
  newCustomers: number,
  topProducts: [{ productId, name, qty, revenue }]
}
```

---

## ADMIN PWA (`/admin/*`)

Build as a separate Next.js route group with its own layout. Protected by Firebase Auth — only `[ADMIN_EMAIL_PLACEHOLDER]` UID can access. Redirect all non-admin users to `/account`.

### PWA Manifest (`public/manifest.json`):
```json
{
  "name": "Rein Oro Admin",
  "short_name": "RO Admin",
  "theme_color": "#C9A84C",
  "background_color": "#0A0A0A",
  "display": "standalone",
  "icons": [{ "src": "/admin-icon-512.png", "sizes": "512x512", "type": "image/png" }]
}
```

### Admin Dashboard (`/admin/dashboard`):

**Color overrides for admin:** Keep `#0A0A0A` base. Accent: `#C9A84C`. Cards: `#141414`. Use Recharts or Chart.js for analytics.

**KPI Row (4 cards):**
```
Today's Revenue (₹)  |  New Orders  |  Active Products  |  Low Stock Alerts
```
Each card: `#141414` background, top border `3px solid #C9A84C`, Cinzel numeral large, Jost label small. Real-time Firestore listeners (`onSnapshot`) — numbers update live without page refresh.

**Revenue Chart:** Recharts `AreaChart`. X-axis: last 7 days. Y-axis: ₹ revenue. Fill: gradient from `#C9A84C` at 40% opacity to transparent. Stroke: `#C9A84C`.

**Recent Orders Table:** 10 most recent orders. Columns: Order#, Customer, Amount, Status, Date, Action. Status pills: color-coded (gold=new, blue=processing, green=delivered). Click row → `/admin/orders/[id]`.

**Low Stock Alert:** Red badge on sidebar nav + inline card. Lists products with `stock < 10`.

---

### Admin Product Management:

**Product List (`/admin/products`):**
- Search input (live Firestore query on `name`)
- Filter tabs: All | Active | Draft | Out of Stock
- Grid of product cards with thumbnail, name, price, stock, status toggle (Zustand + Firestore update)
- Bulk select + bulk delete or bulk activate
- "Add New Product" → full-width gold button → `/admin/products/new`

**Add / Edit Product Form:**
- **Image Upload:** Drag-and-drop zone (react-dropzone) + "Take Photo" button (triggers `<input type="file" capture="environment">`). Uploads to `Firebase Storage → products/{productId}/`. Shows upload progress bar. Allows reordering by drag. Deletes from Storage on remove.
- **Fields:** All Firestore product schema fields as inputs. Rich text `description` via `react-quill` (lightweight, no `<form>` tags, use `onChange` handlers). Weight selector: checkbox group. Category: select dropdown.
- **SEO Panel (collapsible):** Meta title, meta description, OG image (auto-filled from first product image).
- **Publish Controls:** "Save as Draft" | "Publish" — two separate buttons, both call Firestore write.
- **Auto-slug generation:** as user types product name, slug auto-fills in lowercase-kebab-case.

---

### Admin Order Management (`/admin/orders`):

**Tabs:** New | Processing | Shipped | Delivered | Cancelled — each tab filtered by `orderStatus`.

**Order Card:** Order#, customer name (+ phone tap-to-call on mobile), item summary, total, time elapsed. Color-coded left border by status.

**Order Detail (`/admin/orders/[id]`):**
- Full order info, item breakdown, customer address with "Open in Google Maps" link
- **Status Dropdown:** Select → Firestore update → triggers MSG91 SMS to customer
- **Tracking Number Input:** text field → save → shown to customer in their account
- "Print Invoice" — generates PDF via `jsPDF` (client-side), styled with Rein Oro letterhead
- "Issue Refund" — placeholder button (routes to Razorpay dashboard link in new tab)

---

## SEO & PERFORMANCE

**Metadata (Next.js Metadata API, per page):**
```javascript
// app/products/[slug]/page.js
export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  return {
    title: `${product.name} | Rein Oro — Premium Makhana`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      images: [{ url: product.images[0], width: 1200, height: 630 }],
    },
    alternates: { canonical: `https://reinoro.com/products/${product.slug}` }
  };
}
```

**JSON-LD Structured Data (product pages):**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{product.name}}",
  "image": "{{product.images[0]}}",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": "{{product.price}}",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{product.rating}}",
    "reviewCount": "{{product.reviewCount}}"
  }
}
```

**Performance targets:** Lighthouse score ≥ 92 (Performance), ≥ 95 (SEO), ≥ 90 (Accessibility). All images: WebP, lazy-loaded, blur placeholder. GSAP: dynamic import (`await import('gsap')`). Google Fonts: `font-display: swap`, preconnect. Route prefetching: `<Link prefetch>` on all nav links.

**Sitemap (`/sitemap.xml`):** Auto-generated via Next.js `sitemap.js` — includes all product slugs pulled from Firestore at build time (ISR revalidation: 3600s).

**Robots.txt:** Allow all except `/admin/*`.

---

## GSAP ANIMATION MASTER REFERENCE

```javascript
// PAGE LOAD — stagger hero elements
gsap.fromTo(".hero-stack > *", 
  { opacity: 0, y: 40 }, 
  { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.2 }
);

// SECTION HEADERS — scroll triggered
ScrollTrigger.create({
  trigger: ".section-header",
  start: "top 80%",
  onEnter: () => gsap.fromTo(".section-header", 
    { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
  )
});

// PRODUCT CARDS — stagger scroll reveal
gsap.fromTo(".product-card",
  { opacity: 0, y: 60, scale: 0.97 },
  { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "power2.out",
    scrollTrigger: { trigger: ".products-grid", start: "top 75%" }
  }
);

// COUNTER ANIMATION
ScrollTrigger.create({
  trigger: ".stat-counters",
  start: "top 70%",
  onEnter: () => {
    gsap.to(".counter", {
      duration: 2.5,
      ease: "power2.out",
      snap: { textContent: 1 },
      textContent: (i, el) => el.dataset.target
    });
  }
});

// CART DRAWER
gsap.fromTo(".cart-drawer",
  { x: "100%" },
  { x: 0, duration: 0.45, ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }
);

// NAVBAR SCROLL BEHAVIOR
ScrollTrigger.create({
  start: "top -80",
  onUpdate: (self) => {
    gsap.to("nav", {
      backgroundColor: self.progress > 0 ? "rgba(10,10,10,0.96)" : "transparent",
      duration: 0.4
    });
  }
});
```

---

## ENVIRONMENT VARIABLES (`.env.local`)

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=[FIREBASE_API_KEY_PLACEHOLDER]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[FIREBASE_AUTH_DOMAIN_PLACEHOLDER]
NEXT_PUBLIC_FIREBASE_PROJECT_ID=[FIREBASE_PROJECT_ID_PLACEHOLDER]
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[FIREBASE_STORAGE_BUCKET_PLACEHOLDER]
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[FCM_SENDER_ID_PLACEHOLDER]
NEXT_PUBLIC_FIREBASE_APP_ID=[FIREBASE_APP_ID_PLACEHOLDER]

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=[RAZORPAY_KEY_ID_PLACEHOLDER]
RAZORPAY_SECRET=[RAZORPAY_SECRET_PLACEHOLDER]

# MSG91 SMS
MSG91_AUTH_KEY=[MSG91_AUTH_KEY_PLACEHOLDER]
MSG91_SENDER_ID=[MSG91_SENDER_ID_PLACEHOLDER]
MSG91_TEMPLATE_ORDER_CONFIRM=[MSG91_TEMPLATE_1_PLACEHOLDER]
MSG91_TEMPLATE_ORDER_SHIPPED=[MSG91_TEMPLATE_2_PLACEHOLDER]

# Email (SMTP)
SMTP_HOST=[SMTP_HOST_PLACEHOLDER]
SMTP_PORT=587
SMTP_USER=[SMTP_USER_PLACEHOLDER]
SMTP_PASS=[SMTP_PASS_PLACEHOLDER]
SMTP_FROM=orders@reinoro.com

# Admin
ADMIN_UID=[FIREBASE_ADMIN_UID_PLACEHOLDER]

# Site
NEXT_PUBLIC_SITE_URL=https://reinoro.com
```

---

## CONVERSION PSYCHOLOGY — NON-NEGOTIABLE

**1. Scarcity:** Display `"Only {stock} left"` in amber text on product cards when `stock < 15`. Triggers FOMO.

**2. Social Proof Velocity:** Hero trust bar includes `"10,000+ Happy Customers"`. Product pages show `"124 people ordered this today"` (static or Firestore-driven). Both reduce purchase anxiety.

**3. Free Shipping Threshold Bar:** In cart drawer, always show `"Add ₹{X} more for FREE shipping"` progress bar filling gold. Increases average order value.

**4. Exit-Intent Modal:** On `mouseleave` document (desktop only) — modal appears with `"Wait — Here's 10% Off Your First Order"` + coupon code input + email capture. GSAP scale-in from 0.9. Cookie-gated: shows once per session only.

**5. Sticky "Add to Cart":** On product detail page, after scrolling past the main CTA, a sticky bottom bar appears (mobile + desktop) with product name, price, and "Add to Cart" button. Never let the add-to-cart be off-screen.

**6. Checkout Progress Bar:** 3-step progress bar at top of checkout. Visual completion feeling keeps users from abandoning mid-checkout.

**7. Trust Signals at Checkout:** Below the "Pay Now" button display: lock icon + "100% Secure Payment" + Razorpay logo + UPI/Visa/Mastercard icons. Reduces payment anxiety.

**8. Post-Purchase Upsell:** On order confirmation page, show `"Customers who bought this also loved:"` — 3 related products with "Add to Next Order" CTA. Captures repeat intent at the peak satisfaction moment.

---

## FINAL DELIVERY CHECKLIST

Before marking as complete, verify every item:

```
□ All 9 customer-facing sections rendered and responsive (320px to 2560px)
□ All admin routes auth-gated and functional
□ Firebase Firestore CRUD working for products and orders
□ Firebase Storage image upload + delete working in admin
□ Razorpay checkout flow working in test mode
□ MSG91 SMS fires on order confirmation and status update
□ Nodemailer email fires on order confirmation
□ Cart persists on page refresh (Zustand + localStorage)
□ All GSAP animations smooth at 60fps (no jank)
□ Swiper.js carousels working on touch and mouse
□ PWA installable (manifest + service worker registered)
□ Lighthouse score: Performance ≥ 92, SEO ≥ 95
□ All placeholder [XXXX_PLACEHOLDER] values documented for handover
□ .env.local documented with all variable names
□ Mobile nav, cart drawer, and checkout fully touch-optimized
□ All images using Next.js <Image> with blur placeholder
□ Sitemap.xml and robots.txt present
□ JSON-LD structured data on product pages
□ 404 page designed in Rein Oro brand aesthetic
□ Loading skeleton screens on product grid (shimmer effect, gold tint)
```

---

*This prompt is the complete specification for Rein Oro's production e-commerce platform. Execute with the precision of a ₹50,000 build. Every interaction the customer has with this website must reinforce that Rein Oro is the finest health snack brand in India.*

---

**Prepared by:** Digital Byte Solutions, Dehradun
**Version:** 1.0 — Production Build
**Classification:** Confidential — Rein Oro Internal Use
