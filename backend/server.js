import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new DatabaseSync(path.join(__dirname, 'rein_oro.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    member_since TEXT DEFAULT CURRENT_TIMESTAMP,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    flavor TEXT NOT NULL,
    title TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    weight TEXT NOT NULL,
    benefits TEXT NOT NULL,
    benefits_image TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    specs TEXT NOT NULL,
    nutrition TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    date TEXT NOT NULL,
    est_delivery TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    discount INTEGER NOT NULL,
    shipping INTEGER NOT NULL,
    tax INTEGER NOT NULL,
    cod_fee INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'Processing'
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    flavor TEXT NOT NULL,
    weight TEXT NOT NULL,
    qty INTEGER NOT NULL,
    price INTEGER NOT NULL,
    image TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cms_content (
    page_name TEXT NOT NULL,
    selector TEXT NOT NULL,
    content_value TEXT NOT NULL,
    PRIMARY KEY (page_name, selector)
  );

  CREATE TABLE IF NOT EXISTS cms_styles (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    subtitle TEXT,
    image TEXT,
    link TEXT
  );

  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quote TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS blog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'New'
  );

  CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    discount_rate REAL NOT NULL,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS newsletter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS seo_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payment_settings (
    method TEXT PRIMARY KEY,
    enabled INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS gateway_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS shipping_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Schema Migration: Add stock column to products if not exists
try {
  db.exec('ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 25');
} catch (e) {
  // Column already exists
}

// Scarcity Simulation: Mock low stock for Cheese & Onion
try {
  db.prepare("UPDATE products SET stock = 12 WHERE id = 'makhana_cheese_onion'").run();
} catch (e) {
  // Fail silently
}

// Helper to seed products
function seedProducts() {
  const check = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (check.count > 0) return;

  const defaultProducts = [
    {
      id: 'makhana_cheese_onion',
      name: 'Makhana',
      flavor: 'Cheese & Onion',
      title: 'Makhana Cheese & Onion',
      price: 799,
      image: 'images/makhana_cheese_onion.png',
      description: 'Crunchy, light and full of flavor. Our Cheese & Onion Makhana is roasted to perfect-ness with a delicious blend of savoury cheese and onion seasoning.',
      weight: '100g',
      benefits: JSON.stringify(['Roasted, Not Fried', 'Light & Crunchy', 'Perfectly Seasoned', 'Rich in Antioxidants', 'Zero Trans Fat']),
      benefits_image: 'images/makhana_bowl_love.png',
      ingredients: JSON.stringify([
        { name: 'Makhana', img: 'images/ingredient_makhana.png' },
        { name: 'Cheese Powder', img: 'images/ingredient_cheese.png' },
        { name: 'Onion Powder', img: 'images/ingredient_onion.png' },
        { name: 'Rock Salt', img: 'images/ingredient_salt.png' },
        { name: 'Spices & Herbs', img: 'images/ingredient_spices.png' }
      ]),
      specs: JSON.stringify({
        'Brand': 'Rein Oro',
        'Flavour': 'Cheese & Onion',
        'Net Weight': '100g',
        'Diet Type': 'Vegetarian',
        'Shelf Life': '6 Months from date of packaging',
        'Country of Origin': 'India'
      }),
      nutrition: JSON.stringify({
        'Calories': '385 Kcal',
        'Protein': '9.2g',
        'Total Carbohydrates': '68.4g',
        'Dietary Fiber': '7.5g',
        'Total Fat': '7.8g',
        'Trans Fat': '0g',
        'Sodium': '280mg'
      })
    },
    {
      id: 'makhana_classic',
      name: 'Makhana',
      flavor: 'Classic Salted',
      title: 'Makhana Classic Salted',
      price: 499,
      image: 'images/makhana_classic.png',
      description: 'Crunchy, light and slow roasted to perfection. A timeless classic salted seasoning that brings out the pure, clean flavors of our select makhana.',
      weight: '100g',
      benefits: JSON.stringify(['Roasted, Not Fried', 'Light & Crunchy', 'Classic Salted', 'Rich in Antioxidants', 'Zero Cholesterol']),
      benefits_image: 'images/makhana_bowl_love.png',
      ingredients: JSON.stringify([
        { name: 'Makhana', img: 'images/ingredient_makhana.png' },
        { name: 'Rock Salt', img: 'images/ingredient_salt.png' },
        { name: 'Olive Oil', img: 'images/ingredient_spices.png' }
      ]),
      specs: JSON.stringify({
        'Brand': 'Rein Oro',
        'Flavour': 'Classic Salted',
        'Net Weight': '100g',
        'Diet Type': 'Vegetarian',
        'Shelf Life': '6 Months from date of packaging',
        'Country of Origin': 'India'
      }),
      nutrition: JSON.stringify({
        'Calories': '375 Kcal',
        'Protein': '9.5g',
        'Total Carbohydrates': '71.2g',
        'Dietary Fiber': '7.8g',
        'Total Fat': '5.6g',
        'Trans Fat': '0g',
        'Sodium': '210mg'
      })
    },
    {
      id: 'makhana_periperi',
      name: 'Makhana',
      flavor: 'Peri Peri',
      title: 'Makhana Peri Peri',
      price: 499,
      image: 'images/makhana_periperi.png',
      description: "Infused with a fiery blend of african bird's eye chili, garlic, and citrus. Spicy, tangy, and absolutely addictive for heat seekers.",
      weight: '100g',
      benefits: JSON.stringify(['Roasted, Not Fried', 'Light & Crunchy', 'Fiery Peri Peri', 'Boosts Metabolism', 'Zero Trans Fat']),
      benefits_image: 'images/makhana_bowl_love.png',
      ingredients: JSON.stringify([
        { name: 'Makhana', img: 'images/ingredient_makhana.png' },
        { name: 'Peri Peri Seasoning', img: 'images/ingredient_spices.png' },
        { name: 'Garlic Powder', img: 'images/ingredient_onion.png' },
        { name: 'Rock Salt', img: 'images/ingredient_salt.png' }
      ]),
      specs: JSON.stringify({
        'Brand': 'Rein Oro',
        'Flavour': 'Peri Peri Spices',
        'Net Weight': '100g',
        'Diet Type': 'Vegetarian',
        'Shelf Life': '6 Months from date of packaging',
        'Country of Origin': 'India'
      }),
      nutrition: JSON.stringify({
        'Calories': '390 Kcal',
        'Protein': '9.1g',
        'Total Carbohydrates': '66.8g',
        'Dietary Fiber': '7.2g',
        'Total Fat': '8.2g',
        'Trans Fat': '0g',
        'Sodium': '320mg'
      })
    },
    {
      id: 'makhana_himalayan',
      name: 'Makhana',
      flavor: 'Himalayan Salt',
      title: 'Makhana Himalayan Salt',
      price: 499,
      image: 'images/makhana_himalayan.png',
      description: 'Lightly roasted lotus seeds dusted with pure, mineral-rich pink Himalayan rock salt. Clean, natural, and incredibly refreshing.',
      weight: '100g',
      benefits: JSON.stringify(['Roasted, Not Fried', 'Mineral Rich Himalayan Salt', 'Crunchy & Light', 'Perfect Daily Snack', 'Zero Trans Fat']),
      benefits_image: 'images/makhana_bowl_love.png',
      ingredients: JSON.stringify([
        { name: 'Makhana', img: 'images/ingredient_makhana.png' },
        { name: 'Pink Himalayan Salt', img: 'images/ingredient_salt.png' },
        { name: 'Cold Pressed Oil', img: 'images/ingredient_spices.png' }
      ]),
      specs: JSON.stringify({
        'Brand': 'Rein Oro',
        'Flavour': 'Himalayan Pink Salt',
        'Net Weight': '100g',
        'Diet Type': 'Vegetarian',
        'Shelf Life': '6 Months from date of packaging',
        'Country of Origin': 'India'
      }),
      nutrition: JSON.stringify({
        'Calories': '372 Kcal',
        'Protein': '9.6g',
        'Total Carbohydrates': '72.4g',
        'Dietary Fiber': '8.0g',
        'Total Fat': '5.2g',
        'Trans Fat': '0g',
        'Sodium': '180mg'
      })
    },
    {
      id: 'almonds_california',
      name: 'California',
      flavor: 'Almonds',
      title: 'California Premium Almonds',
      price: 699,
      image: 'images/almonds_california.png',
      description: 'Hand-selected, premium California almonds. Uniform in size, double-sorted, and packed with high protein, healthy fats, and antioxidants.',
      weight: '250g',
      benefits: JSON.stringify(['Double Sorted', 'High in Vitamin E', 'Rich in Protein', 'Premium California Origin', 'Boosts Brain Health']),
      benefits_image: 'images/makhana_bowl_love.png',
      ingredients: JSON.stringify([
        { name: 'Premium Almonds', img: 'images/almonds_california.png' }
      ]),
      specs: JSON.stringify({
        'Brand': 'Rein Oro',
        'Flavour': 'Natural Premium Almonds',
        'Net Weight': '250g',
        'Diet Type': 'Vegetarian',
        'Shelf Life': '9 Months from date of packaging',
        'Country of Origin': 'USA (California)'
      }),
      nutrition: JSON.stringify({
        'Calories': '579 Kcal',
        'Protein': '21.2g',
        'Total Carbohydrates': '21.6g',
        'Dietary Fiber': '12.5g',
        'Total Fat': '49.9g',
        'Trans Fat': '0g',
        'Sodium': '1mg'
      })
    },
    {
      id: 'cashews_roasted',
      name: 'California',
      flavor: 'Roasted & Salted Cashews',
      title: 'California Roasted & Salted Cashews',
      price: 749,
      image: 'images/cashews_roasted.png',
      description: 'Slightly sweet, creamy cashew nuts, roasted to a golden hue and sprinkled with pure sea salt. An exquisite and crunchy wellness snack.',
      weight: '200g',
      benefits: JSON.stringify(['Slow Roasted', 'Rich & Creamy', 'Lightly Salted', 'Healthy Monounsaturated Fats', 'Handpicked Quality']),
      benefits_image: 'images/makhana_bowl_love.png',
      ingredients: JSON.stringify([
        { name: 'Creamy Cashews', img: 'images/cashews_roasted.png' },
        { name: 'Rock Salt', img: 'images/ingredient_salt.png' }
      ]),
      specs: JSON.stringify({
        'Brand': 'Rein Oro',
        'Flavour': 'Roasted & Salted Cashews',
        'Net Weight': '200g',
        'Diet Type': 'Vegetarian',
        'Shelf Life': '6 Months from date of packaging',
        'Country of Origin': 'India'
      }),
      nutrition: JSON.stringify({
        'Calories': '553 Kcal',
        'Protein': '18.2g',
        'Total Carbohydrates': '30.2g',
        'Dietary Fiber': '3.3g',
        'Total Fat': '43.8g',
        'Trans Fat': '0g',
        'Sodium': '240mg'
      })
    },
    {
      id: 'pistachios_roasted',
      name: 'Pistachios',
      flavor: 'Roasted & Salted',
      title: 'Pistachios Roasted & Salted',
      price: 799,
      image: 'images/pistachios_roasted.png',
      description: 'In-shell premium Iranian pistachios, lightly roasted and seasoned with rock salt. Rich in fiber and highly nutritional.',
      weight: '200g',
      benefits: JSON.stringify(['Easy to Shell', 'Lightly Roasted', 'Rich in Antioxidants', 'Highly Nutritious', '100% Natural Processed']),
      benefits_image: 'images/makhana_bowl_love.png',
      ingredients: JSON.stringify([
        { name: 'Iranian Pistachios', img: 'images/pistachios_roasted.png' },
        { name: 'Rock Salt', img: 'images/ingredient_salt.png' }
      ]),
      specs: JSON.stringify({
        'Brand': 'Rein Oro',
        'Flavour': 'Roasted & Salted Pistachios',
        'Net Weight': '200g',
        'Diet Type': 'Vegetarian',
        'Shelf Life': '6 Months from date of packaging',
        'Country of Origin': 'Iran'
      }),
      nutrition: JSON.stringify({
        'Calories': '562 Kcal',
        'Protein': '20.3g',
        'Total Carbohydrates': '27.5g',
        'Dietary Fiber': '10.3g',
        'Total Fat': '45.3g',
        'Trans Fat': '0g',
        'Sodium': '290mg'
      })
    },
    {
      id: 'raisins_premium',
      name: 'Raisins',
      flavor: 'Premium Selection',
      title: 'Green Raisins Premium Selection',
      price: 399,
      image: 'images/raisins_premium.png',
      description: 'Naturally sweet, plump green raisins chosen from the finest vineyards. Soft, juicy, and perfect for natural sweetening or snacking.',
      weight: '250g',
      benefits: JSON.stringify(['Naturally Sun Dried', 'Zero Added Sugar', 'Rich in Iron & Fiber', 'Sweet & Juicy', 'Ideal Dessert Topping']),
      benefits_image: 'images/makhana_bowl_love.png',
      ingredients: JSON.stringify([
        { name: 'Green Raisins', img: 'images/raisins_premium.png' }
      ]),
      specs: JSON.stringify({
        'Brand': 'Rein Oro',
        'Flavour': 'Green Raisins',
        'Net Weight': '250g',
        'Diet Type': 'Vegetarian',
        'Shelf Life': '12 Months from date of packaging',
        'Country of Origin': 'India'
      }),
      nutrition: JSON.stringify({
        'Calories': '299 Kcal',
        'Protein': '3.1g',
        'Total Carbohydrates': '79.2g',
        'Dietary Fiber': '3.7g',
        'Total Fat': '0.5g',
        'Trans Fat': '0g',
        'Sodium': '11mg'
      })
    },
    {
      id: 'gift_box_premium',
      name: 'Gift Box',
      flavor: 'Premium Collection',
      title: 'Rein Oro Premium Gift Box Assortment',
      price: 1299,
      image: 'images/gift_box_premium.png',
      description: 'An elegant, gold-embossed gift collection containing a curated assortments of our signature makhanas, California almonds, and roasted cashews.',
      weight: 'Assorted (500g)',
      benefits: JSON.stringify(['Exquisite Festive Packaging', 'Gold Embossed Box', 'Curated Wellness Selection', 'Perfect for Corporate Gifting', 'Vacuum Packed Freshness']),
      benefits_image: 'images/gift_box.png',
      ingredients: JSON.stringify([
        { name: 'Makhana Classic', img: 'images/makhana_classic.png' },
        { name: 'Roasted Cashews', img: 'images/cashews_roasted.png' },
        { name: 'California Almonds', img: 'images/almonds_california.png' }
      ]),
      specs: JSON.stringify({
        'Brand': 'Rein Oro',
        'Flavour': 'Assorted Luxury Dry Fruits & Makhana',
        'Net Weight': '500g Assorted',
        'Diet Type': 'Vegetarian',
        'Shelf Life': '6 Months from date of packaging',
        'Country of Origin': 'India'
      }),
      nutrition: JSON.stringify({
        'Calories': '480 Kcal',
        'Protein': '14.5g',
        'Total Carbohydrates': '48.2g',
        'Dietary Fiber': '6.2g',
        'Total Fat': '28.5g',
        'Trans Fat': '0g',
        'Sodium': '190mg'
      })
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO products (id, name, flavor, title, price, image, description, weight, benefits, benefits_image, ingredients, specs, nutrition)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of defaultProducts) {
    stmt.run(p.id, p.name, p.flavor, p.title, p.price, p.image, p.description, p.weight, p.benefits, p.benefits_image, p.ingredients, p.specs, p.nutrition);
  }
}

// Helper to seed admin
function seedAdmin() {
  const check = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?').get('admin@reinoro.com');
  if (check.count === 0) {
    db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)')
      .run('admin@reinoro.com', 'goldstandard', 'admin');
  }
}

// Seed categories
function seedCategories() {
  const check = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (check.count === 0) {
    const stmt = db.prepare('INSERT INTO categories (name, description, image) VALUES (?, ?, ?)');
    stmt.run('Makhana', 'Slow-roasted premium lotus seeds flavored with exquisite spices.', 'images/makhana_classic.png');
    stmt.run('Premium Nuts', 'Gourmet handpicked almonds, cashews, and pistachios.', 'images/almonds_california.png');
    stmt.run('Gift Boxes', 'Gold-embossed royal gourmet assortments for special moments.', 'images/gift_box_premium.png');
  }
}

// Seed banners
function seedBanners() {
  const check = db.prepare('SELECT COUNT(*) as count FROM banners').get();
  if (check.count === 0) {
    const stmt = db.prepare('INSERT INTO banners (title, subtitle, image, link) VALUES (?, ?, ?, ?)');
    stmt.run('Purity Crowned in Gold', 'Experience the finest selection of handpicked makhanas and dry fruits.', 'images/login_bg.jpg', '/shop');
    stmt.run('Royal Corporate Hamper Gifting', 'Present your partners with bespoke gold-embossed collections.', 'images/gift_box.png', '/contact');
  }
}

// Seed media library
function seedMedia() {
  const check = db.prepare('SELECT COUNT(*) as count FROM media').get();
  if (check.count === 0) {
    const stmt = db.prepare('INSERT INTO media (name, url) VALUES (?, ?)');
    stmt.run('Makhana Classic', 'images/makhana_classic.png');
    stmt.run('Makhana Cheese Onion', 'images/makhana_cheese_onion.png');
    stmt.run('Almonds California', 'images/almonds_california.png');
    stmt.run('Cashews Roasted', 'images/cashews_roasted.png');
    stmt.run('Pistachios Roasted', 'images/pistachios_roasted.png');
    stmt.run('Raisins Premium', 'images/raisins_premium.png');
    stmt.run('Gift Box Premium', 'images/gift_box_premium.png');
  }
}

// Seed testimonials
function seedTestimonials() {
  const check = db.prepare('SELECT COUNT(*) as count FROM testimonials').get();
  if (check.count === 0) {
    const stmt = db.prepare('INSERT INTO testimonials (name, quote, rating, avatar) VALUES (?, ?, ?, ?)');
    stmt.run('Maharaja Raghuvendra', 'The saffron-infused almonds are a crowning achievement in taste. Truly fit for royalty.', 5, '');
    stmt.run('Aishwarya Sen', 'Double-sorted makhanas have a crisp density that I have never tasted elsewhere. Divine.', 5, '');
    stmt.run('Vikramaditya Rao', 'Exceptional corporate gifting service. The custom hampers projected unmatched prestige.', 5, '');
  }
}

// Seed blog
function seedBlog() {
  const check = db.prepare('SELECT COUNT(*) as count FROM blog').get();
  if (check.count === 0) {
    const stmt = db.prepare('INSERT INTO blog (title, content, image) VALUES (?, ?, ?)');
    stmt.run('The Ancient Wellness of Lotus Seeds', 'Lotus seeds (Makhana) have been an integral part of royal wellness diets for centuries. Packed with proteins, fiber, and dense antioxidants, they represent the ultimate natural snack...', 'images/makhana_bowl_love.png');
    stmt.run('Artisanal Roasting: Preserving Natural Purity', 'Unlike mass-produced snacks, the House of Rein Oro slow-roasts raw seeds in controlled dry pans. This oil-free prep ensures that mineral value is retained while delivering high crunch...', 'images/slow_roasted.png');
  }
}

// Seed FAQs
function seedFAQs() {
  const check = db.prepare('SELECT COUNT(*) as count FROM faqs').get();
  if (check.count === 0) {
    const stmt = db.prepare('INSERT INTO faqs (question, answer) VALUES (?, ?)');
    stmt.run('What makes Rein Oro products unique?', 'All our dry fruits and lotus seeds are double-sorted for uniform size and quality, then slow-roasted in small batches without oil to guarantee pure gourmet nourishment.');
    stmt.run('Do you offer corporate customization?', 'Yes, our concierge team works directly with corporations to curate gold-embossed hampers and personalized assortments.');
    stmt.run('What is the shipping turnaround?', 'We dispatch all royal collections within 24 hours of confirmation. Shipping is free on orders above ₹999.');
  }
}

// Seed coupons
function seedCoupons() {
  const check = db.prepare('SELECT COUNT(*) as count FROM coupons').get();
  if (check.count === 0) {
    const stmt = db.prepare('INSERT INTO coupons (code, discount_rate, active) VALUES (?, ?, ?)');
    stmt.run('GOLDEN', 0.10, 1);
    stmt.run('REIN10', 0.10, 1);
  }
}

// Seed enquiries
function seedEnquiries() {
  const check = db.prepare('SELECT COUNT(*) as count FROM enquiries').get();
  if (check.count === 0) {
    const stmt = db.prepare('INSERT INTO enquiries (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)');
    stmt.run('Aditya Pratap', 'aditya@pratapholdings.com', 'Corporate Gifting Hamper Quote', 'We require a quote for 250 bespoke gold-embossed gift hampers for our annual leadership meet.', 'New');
    stmt.run('Karan Johar', 'karan@dharmaprod.com', 'Custom Seasoning Request', 'Does the House offer custom black truffle seasoned cashews for events?', 'Resolved');
  }
}

// Seed newsletter
function seedNewsletter() {
  const check = db.prepare('SELECT COUNT(*) as count FROM newsletter').get();
  if (check.count === 0) {
    const stmt = db.prepare('INSERT INTO newsletter (email) VALUES (?)');
    stmt.run('vip-customer@royal.in');
    stmt.run('snack-lover@wellness.org');
  }
}

// Seed settings
function seedSettings() {
  // SEO
  const seoCheck = db.prepare('SELECT COUNT(*) as count FROM seo_settings').get();
  if (seoCheck.count === 0) {
    const stmt = db.prepare('INSERT INTO seo_settings (key, value) VALUES (?, ?)');
    stmt.run('titleTemplate', 'Rein Oro - Purity Crowned in Gold');
    stmt.run('metaDescription', 'Rein Oro Luxury Foods. Sourced from organic wetlands, handpicked and slow-roasted dry fruits and lotus seeds fit for royalty.');
  }

  // Payments
  const payCheck = db.prepare('SELECT COUNT(*) as count FROM payment_settings').get();
  if (payCheck.count === 0) {
    const stmt = db.prepare('INSERT INTO payment_settings (method, enabled) VALUES (?, ?)');
    stmt.run('Cash on Delivery (COD)', 1);
    stmt.run('UPI / NetBanking', 1);
    stmt.run('Credit / Debit Card', 1);
    stmt.run('Razorpay (Online Payment)', 1);
  }

  // Gateways
  const gatewayCheck = db.prepare('SELECT COUNT(*) as count FROM gateway_settings').get();
  if (gatewayCheck.count === 0) {
    const stmt = db.prepare('INSERT INTO gateway_settings (key, value) VALUES (?, ?)');
    stmt.run('razorpay_key_id', 'rzp_test_defaultKeyId');
    stmt.run('razorpay_key_secret', 'defaultKeySecret');
  }

  // Shipping
  const shipCheck = db.prepare('SELECT COUNT(*) as count FROM shipping_settings').get();
  if (shipCheck.count === 0) {
    const stmt = db.prepare('INSERT INTO shipping_settings (key, value) VALUES (?, ?)');
    stmt.run('freeShippingThreshold', '599');
    stmt.run('shippingFee', '99');
  }

  // Ensure any existing database settings are updated to 599
  try {
    db.prepare("UPDATE shipping_settings SET value = '599' WHERE key = 'freeShippingThreshold'").run();
  } catch (e) {
    // Fail silently
  }
}

// Seed Database
seedProducts();
seedAdmin();
seedCategories();
seedBanners();
seedMedia();
seedTestimonials();
seedBlog();
seedFAQs();
seedCoupons();
seedEnquiries();
seedNewsletter();
seedSettings();

// --- Auth Routes ---
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const stmt = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
    const result = stmt.run(email, password, 'user');
    res.json({ success: true, user: { email, role: 'user', id: result.lastInsertRowid } });
  } catch (err) {
    res.status(400).json({ error: 'Account already exists' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);
    if (user) {
      res.json({ success: true, user: { email: user.email, role: user.role, member_since: user.member_since } });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server authentication error' });
  }
});

// --- Products Routes ---
app.get('/api/products', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM products').all();
    const formatted = rows.map(r => ({
      ...r,
      benefits: JSON.parse(r.benefits),
      ingredients: JSON.parse(r.ingredients),
      specs: JSON.parse(r.specs),
      nutrition: JSON.parse(r.nutrition)
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  const { id, name, flavor, title, price, image, description, weight, benefits, benefits_image, ingredients, specs, nutrition, stock } = req.body;
  try {
    db.prepare(`
      INSERT INTO products (id, name, flavor, title, price, image, description, weight, benefits, benefits_image, ingredients, specs, nutrition, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, flavor, title, parseInt(price), image || 'images/makhana_classic.png', description, weight,
      JSON.stringify(benefits || []), benefits_image || 'images/makhana_bowl_love.png',
      JSON.stringify(ingredients || []), JSON.stringify(specs || {}), JSON.stringify(nutrition || {}),
      parseInt(stock !== undefined ? stock : 25)
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, flavor, title, price, image, description, weight, benefits, benefits_image, ingredients, specs, nutrition, stock } = req.body;
  try {
    db.prepare(`
      UPDATE products 
      SET name = ?, flavor = ?, title = ?, price = ?, image = ?, description = ?, weight = ?, 
          benefits = ?, benefits_image = ?, ingredients = ?, specs = ?, nutrition = ?, stock = ?
      WHERE id = ?
    `).run(
      name, flavor, title, parseInt(price), image, description, weight,
      JSON.stringify(benefits || []), benefits_image,
      JSON.stringify(ingredients || []), JSON.stringify(specs || {}), JSON.stringify(nutrition || {}),
      parseInt(stock !== undefined ? stock : 25),
      id
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Orders Routes ---
app.get('/api/orders', (req, res) => {
  const { email } = req.query;
  try {
    let ordersList;
    if (email) {
      ordersList = db.prepare('SELECT * FROM orders WHERE user_email = ? ORDER BY rowid DESC').all(email);
    } else {
      ordersList = db.prepare('SELECT * FROM orders ORDER BY rowid DESC').all();
    }
    
    // Attach items to each order
    const stmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    const enriched = ordersList.map(o => {
      const items = stmt.all(o.id);
      return { ...o, items };
    });
    
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', (req, res) => {
  const { id, user_email, date, est_delivery, payment_method, subtotal, discount, shipping, tax, cod_fee, total, items } = req.body;
  
  if (!id || !user_email || !items || items.length === 0) {
    return res.status(400).json({ error: 'Incomplete order payload' });
  }
  
  try {
    // Insert main order record
    db.prepare(`
      INSERT INTO orders (id, user_email, date, est_delivery, payment_method, subtotal, discount, shipping, tax, cod_fee, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, user_email, date, est_delivery, payment_method, subtotal, discount, shipping, tax, cod_fee, total);
    
    // Insert order items
    const itemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, name, flavor, weight, qty, price, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const item of items) {
      itemStmt.run(id, item.id, item.name, item.flavor, item.weight, item.qty, item.price, item.image);
    }
    
    res.json({ success: true, orderId: id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- CMS Content Routes ---
app.get('/api/cms/content', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM cms_content').all();
    const formatted = {};
    for (const row of rows) {
      if (!formatted[row.page_name]) formatted[row.page_name] = {};
      formatted[row.page_name][row.selector] = row.content_value;
    }
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/content', (req, res) => {
  const { page_name, selector, content_value } = req.body;
  try {
    db.prepare(`
      INSERT INTO cms_content (page_name, selector, content_value)
      VALUES (?, ?, ?)
      ON CONFLICT(page_name, selector) DO UPDATE SET content_value = excluded.content_value
    `).run(page_name, selector, content_value);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- CMS Styles Routes ---
app.get('/api/cms/styles', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM cms_styles').all();
    const styles = {};
    for (const row of rows) {
      styles[row.key] = row.value;
    }
    res.json(styles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/styles', (req, res) => {
  const styles = req.body; // Key-value object
  try {
    const stmt = db.prepare(`
      INSERT INTO cms_styles (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    
    for (const [key, value] of Object.entries(styles)) {
      stmt.run(key, value);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Factory Reset ---
app.post('/api/cms/reset', (req, res) => {
  try {
    db.exec(`
      DELETE FROM products;
      DELETE FROM cms_content;
      DELETE FROM cms_styles;
      DELETE FROM categories;
      DELETE FROM banners;
      DELETE FROM media;
      DELETE FROM testimonials;
      DELETE FROM blog;
      DELETE FROM faqs;
      DELETE FROM enquiries;
      DELETE FROM coupons;
      DELETE FROM newsletter;
      DELETE FROM seo_settings;
      DELETE FROM payment_settings;
      DELETE FROM shipping_settings;
      DELETE FROM gateway_settings;
    `);
    seedProducts();
    seedAdmin();
    seedCategories();
    seedBanners();
    seedMedia();
    seedTestimonials();
    seedBlog();
    seedFAQs();
    seedCoupons();
    seedEnquiries();
    seedNewsletter();
    seedSettings();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Categories Endpoints ---
app.get('/api/categories', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM categories').all();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/categories', (req, res) => {
  const { name, description, image } = req.body;
  try {
    const result = db.prepare('INSERT INTO categories (name, description, image) VALUES (?, ?, ?)')
      .run(name, description, image);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, image } = req.body;
  try {
    db.prepare('UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?')
      .run(name, description, image, id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Banners Endpoints ---
app.get('/api/banners', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM banners').all();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/banners', (req, res) => {
  const { title, subtitle, image, link } = req.body;
  try {
    const result = db.prepare('INSERT INTO banners (title, subtitle, image, link) VALUES (?, ?, ?, ?)')
      .run(title, subtitle, image, link);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/banners/:id', (req, res) => {
  const { id } = req.params;
  const { title, subtitle, image, link } = req.body;
  try {
    db.prepare('UPDATE banners SET title = ?, subtitle = ?, image = ?, link = ? WHERE id = ?')
      .run(title, subtitle, image, link, id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/banners/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM banners WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Media Endpoints ---
app.get('/api/media', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM media').all();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/media', (req, res) => {
  const { name, url } = req.body;
  try {
    const result = db.prepare('INSERT INTO media (name, url) VALUES (?, ?)')
      .run(name, url);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/media/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM media WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Testimonials Endpoints ---
app.get('/api/testimonials', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM testimonials').all();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/testimonials', (req, res) => {
  const { name, quote, rating, avatar } = req.body;
  try {
    const result = db.prepare('INSERT INTO testimonials (name, quote, rating, avatar) VALUES (?, ?, ?, ?)')
      .run(name, quote, parseInt(rating || 5), avatar);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/testimonials/:id', (req, res) => {
  const { id } = req.params;
  const { name, quote, rating, avatar } = req.body;
  try {
    db.prepare('UPDATE testimonials SET name = ?, quote = ?, rating = ?, avatar = ? WHERE id = ?')
      .run(name, quote, parseInt(rating || 5), avatar, id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/testimonials/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Blog Endpoints ---
app.get('/api/blog', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM blog ORDER BY id DESC').all();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/blog', (req, res) => {
  const { title, content, image } = req.body;
  try {
    const result = db.prepare('INSERT INTO blog (title, content, image) VALUES (?, ?, ?)')
      .run(title, content, image);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/blog/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, image } = req.body;
  try {
    db.prepare('UPDATE blog SET title = ?, content = ?, image = ? WHERE id = ?')
      .run(title, content, image, id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/blog/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM blog WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- FAQs Endpoints ---
app.get('/api/faqs', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM faqs').all();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/faqs', (req, res) => {
  const { question, answer } = req.body;
  try {
    const result = db.prepare('INSERT INTO faqs (question, answer) VALUES (?, ?)')
      .run(question, answer);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/faqs/:id', (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  try {
    db.prepare('UPDATE faqs SET question = ?, answer = ? WHERE id = ?')
      .run(question, answer, id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/faqs/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM faqs WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Enquiries Endpoints ---
app.get('/api/enquiries', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM enquiries ORDER BY id DESC').all();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/enquiries', (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    const result = db.prepare('INSERT INTO enquiries (name, email, subject, message) VALUES (?, ?, ?, ?)')
      .run(name, email, subject, message);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/enquiries/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/enquiries/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM enquiries WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Coupons Endpoints ---
app.get('/api/coupons', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM coupons').all();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/coupons', (req, res) => {
  const { code, discount_rate, active } = req.body;
  try {
    db.prepare('INSERT INTO coupons (code, discount_rate, active) VALUES (?, ?, ?)')
      .run(code.trim().toUpperCase(), parseFloat(discount_rate), active ? 1 : 0);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/coupons/:code', (req, res) => {
  const { code } = req.params;
  const { discount_rate, active } = req.body;
  try {
    db.prepare('UPDATE coupons SET discount_rate = ?, active = ? WHERE code = ?')
      .run(parseFloat(discount_rate), active ? 1 : 0, code);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/coupons/:code', (req, res) => {
  const { code } = req.params;
  try {
    db.prepare('DELETE FROM coupons WHERE code = ?').run(code);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Newsletter Endpoints ---
app.get('/api/newsletter', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM newsletter ORDER BY id DESC').all();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  try {
    const result = db.prepare('INSERT INTO newsletter (email) VALUES (?)').run(email.trim());
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(400).json({ error: 'Already subscribed' }); }
});
app.delete('/api/newsletter/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM newsletter WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Users & Roles Management ---
app.get('/api/users', (req, res) => {
  try {
    const list = db.prepare('SELECT id, email, role, member_since FROM users').all();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Settings Endpoints ---
app.get('/api/settings/seo', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM seo_settings').all();
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/settings/seo', (req, res) => {
  const settings = req.body;
  try {
    const stmt = db.prepare('INSERT INTO seo_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    for (const [k, v] of Object.entries(settings)) stmt.run(k, v);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/settings/payment', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM payment_settings').all();
    const settings = {};
    for (const r of rows) settings[r.method] = r.enabled;
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/settings/payment', (req, res) => {
  const settings = req.body; // { method: enabled }
  try {
    const stmt = db.prepare('INSERT INTO payment_settings (method, enabled) VALUES (?, ?) ON CONFLICT(method) DO UPDATE SET enabled = excluded.enabled');
    for (const [k, v] of Object.entries(settings)) stmt.run(k, v ? 1 : 0);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/settings/shipping', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM shipping_settings').all();
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/settings/shipping', (req, res) => {
  const settings = req.body;
  try {
    const stmt = db.prepare('INSERT INTO shipping_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    for (const [k, v] of Object.entries(settings)) stmt.run(k, v);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Razorpay / Gateway Settings ---
app.get('/api/settings/gateway', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM gateway_settings').all();
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/settings/gateway', (req, res) => {
  const settings = req.body;
  try {
    const stmt = db.prepare('INSERT INTO gateway_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    for (const [k, v] of Object.entries(settings)) {
      stmt.run(k, v);
    }
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/payments/razorpay/order', async (req, res) => {
  const { amount, receipt } = req.body;
  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  try {
    const keyIdRow = db.prepare('SELECT value FROM gateway_settings WHERE key = ?').get('razorpay_key_id');
    const keySecretRow = db.prepare('SELECT value FROM gateway_settings WHERE key = ?').get('razorpay_key_secret');
    const keyId = keyIdRow ? keyIdRow.value : 'rzp_test_defaultKeyId';
    const keySecret = keySecretRow ? keySecretRow.value : 'defaultKeySecret';

    if (keyId === 'rzp_test_defaultKeyId' || keySecret === 'defaultKeySecret' || !keyId || !keySecret) {
      const mockOrderId = `order_mock_${Math.floor(100000 + Math.random() * 900000)}`;
      return res.json({
        success: true,
        orderId: mockOrderId,
        keyId: 'rzp_test_defaultKeyId',
        amount: Math.round(amount * 100),
        currency: 'INR',
        isMock: true
      });
    }

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: receipt || `rec_${Date.now()}`
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ? data.error.description : 'Razorpay order creation failed');
    }

    res.json({
      success: true,
      orderId: data.id,
      keyId: keyId,
      amount: data.amount,
      currency: data.currency,
      isMock: false
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// sitemap.xml dynamic generation
app.get('/sitemap.xml', (req, res) => {
  try {
    const products = db.prepare('SELECT id FROM products').all();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    const staticUrls = [
      { loc: 'https://reinoro.com/#/', changefreq: 'daily', priority: '1.0' },
      { loc: 'https://reinoro.com/#/shop', changefreq: 'daily', priority: '0.8' },
      { loc: 'https://reinoro.com/#/about', changefreq: 'monthly', priority: '0.5' },
      { loc: 'https://reinoro.com/#/contact', changefreq: 'monthly', priority: '0.5' }
    ];
    
    for (const u of staticUrls) {
      xml += '  <url>\n';
      xml += `    <loc>${u.loc}</loc>\n`;
      xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
      xml += `    <priority>${u.priority}</priority>\n`;
      xml += '  </url>\n';
    }
    
    for (const p of products) {
      xml += '  <url>\n';
      xml += `    <loc>https://reinoro.com/#/product/${p.id}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    }
    
    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// robots.txt rule
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /admin/\nDisallow: /admin\nSitemap: https://reinoro.com/sitemap.xml\n");
});

// Serve built frontend assets in production
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use('/frames', express.static(path.join(__dirname, '../frontend/frames')));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback all other client requests to SPA index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/sitemap.xml' || req.path === '/robots.txt') {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Rein Oro Express backend listening on http://localhost:${PORT}`);
});
