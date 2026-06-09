import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const db = new DatabaseSync(path.join(__dirname, '..', 'rein_oro.db'));

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
    status TEXT DEFAULT 'Processing',
    payment_status TEXT DEFAULT 'Pending',
    payment_provider TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT
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

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    local_order_id TEXT,
    provider TEXT DEFAULT 'razorpay',
    provider_order_id TEXT,
    provider_payment_id TEXT,
    provider_signature TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'created',
    method TEXT,
    is_mock INTEGER DEFAULT 0,
    raw_payload TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS crm_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_email TEXT NOT NULL,
    note TEXT NOT NULL,
    owner TEXT DEFAULT 'owner',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
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

const orderColumnMigrations = [
  "ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'Pending'",
  "ALTER TABLE orders ADD COLUMN payment_provider TEXT",
  "ALTER TABLE orders ADD COLUMN razorpay_order_id TEXT",
  "ALTER TABLE orders ADD COLUMN razorpay_payment_id TEXT",
  "ALTER TABLE orders ADD COLUMN razorpay_signature TEXT"
];

for (const migration of orderColumnMigrations) {
  try {
    db.exec(migration);
  } catch (e) {
    // Column already exists
  }
}


export function seedDatabase() {
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
}
