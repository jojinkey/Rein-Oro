import crypto from 'crypto';
import { db } from '../util/database.js';
import { deleteFromFirestore, getFirestoreStatus, mirrorToFirestore, syncCollectionsToFirestore } from '../util/firestore.js';

const DEFAULT_RAZORPAY_KEY_ID = 'rzp_test_defaultKeyId';
const DEFAULT_RAZORPAY_KEY_SECRET = 'defaultKeySecret';

function mirrorRecord(collectionName, documentId, data) {
  mirrorToFirestore(collectionName, documentId, data).catch(err => {
    console.error(`Firestore mirror failed for ${collectionName}/${documentId}:`, err.message);
  });
}

function deleteMirrorRecord(collectionName, documentId) {
  deleteFromFirestore(collectionName, documentId).catch(err => {
    console.error(`Firestore delete failed for ${collectionName}/${documentId}:`, err.message);
  });
}

function requireAdminSync(req, res) {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) return true;
  if (req.headers['x-admin-secret'] === secret) return true;
  res.status(403).json({ error: 'Admin sync secret is required' });
  return false;
}

function parseInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toPaise(amount) {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}

function getGatewaySetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM gateway_settings WHERE key = ?').get(key);
  return row?.value || fallback;
}

function getEnvValue(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function getRazorpayCredentials() {
  const envKeyId = getEnvValue('RAZORPAY_KEY_ID', 'NEXT_PUBLIC_RAZORPAY_KEY_ID');
  const envKeySecret = getEnvValue('RAZORPAY_KEY_SECRET', 'RAZORPAY_SECRET');
  const envConfigured = Boolean(envKeyId && envKeySecret);
  const keyId = envKeyId || getGatewaySetting('razorpay_key_id', DEFAULT_RAZORPAY_KEY_ID);
  const keySecret = envKeySecret || getGatewaySetting('razorpay_key_secret', DEFAULT_RAZORPAY_KEY_SECRET);
  const isConfigured = Boolean(
    keyId &&
    keySecret &&
    keyId !== DEFAULT_RAZORPAY_KEY_ID &&
    keySecret !== DEFAULT_RAZORPAY_KEY_SECRET
  );

  return { keyId, keySecret, isConfigured, source: envConfigured ? 'env' : 'database' };
}

function verifyRazorpaySignature({ orderId, paymentId, signature, keySecret }) {
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

function buildOrderPaymentMeta({ payment_method, payment_id, razorpay_order_id }) {
  const method = String(payment_method || '').toLowerCase();

  if (method.includes('razorpay') || payment_id || razorpay_order_id) {
    return {
      provider: 'razorpay',
      status: payment_id ? 'Paid' : 'Pending'
    };
  }

  if (method.includes('cash on delivery') || method.includes('cod')) {
    return {
      provider: 'cod',
      status: 'COD Pending'
    };
  }

  if (method.includes('paid') || method.includes('upi') || method.includes('card') || method.includes('net banking')) {
    return {
      provider: 'manual_online',
      status: 'Paid'
    };
  }

  return {
    provider: null,
    status: 'Pending'
  };
}

function upsertPaymentRecord({
  local_order_id,
  provider_order_id,
  provider_payment_id,
  provider_signature,
  amount,
  currency = 'INR',
  status = 'created',
  method = 'Razorpay',
  is_mock = 0,
  raw_payload = {}
}) {
  const existing = provider_order_id
    ? db.prepare('SELECT id FROM payments WHERE provider_order_id = ? ORDER BY id DESC LIMIT 1').get(provider_order_id)
    : null;

  const amountValue = Number(amount) > 1000 ? parseInteger(amount) : toPaise(amount);
  const rawPayload = JSON.stringify(raw_payload || {});

  if (existing) {
    db.prepare(`
      UPDATE payments
      SET local_order_id = COALESCE(?, local_order_id),
          provider_payment_id = COALESCE(?, provider_payment_id),
          provider_signature = COALESCE(?, provider_signature),
          amount = COALESCE(?, amount),
          currency = COALESCE(?, currency),
          status = ?,
          method = COALESCE(?, method),
          is_mock = ?,
          raw_payload = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      local_order_id || null,
      provider_payment_id || null,
      provider_signature || null,
      amountValue || null,
      currency || 'INR',
      status,
      method || null,
      is_mock ? 1 : 0,
      rawPayload,
      existing.id
    );
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO payments (
      local_order_id, provider, provider_order_id, provider_payment_id, provider_signature,
      amount, currency, status, method, is_mock, raw_payload
    )
    VALUES (?, 'razorpay', ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    local_order_id || null,
    provider_order_id || null,
    provider_payment_id || null,
    provider_signature || null,
    amountValue,
    currency,
    status,
    method,
    is_mock ? 1 : 0,
    rawPayload
  );

  return result.lastInsertRowid;
}

function formatPayment(payment) {
  return {
    ...payment,
    amount_rupees: Math.round((Number(payment.amount || 0) / 100) * 100) / 100
  };
}

function formatProductRow(row) {
  return {
    ...row,
    benefits: JSON.parse(row.benefits),
    ingredients: JSON.parse(row.ingredients),
    specs: JSON.parse(row.specs),
    nutrition: JSON.parse(row.nutrition)
  };
}

function getProductById(id) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return row ? formatProductRow(row) : null;
}

function getOrderWithItems(id) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
  return { ...order, items };
}

function formatReview(row) {
  return {
    ...row,
    rating: parseInteger(row.rating, 5)
  };
}

function getReviewSummary(productId) {
  const rows = db.prepare('SELECT rating, COUNT(*) as count FROM reviews WHERE product_id = ? AND status = ? GROUP BY rating').all(productId, 'approved');
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const ratingTotal = rows.reduce((sum, row) => sum + (row.rating * row.count), 0);
  const average = total ? Math.round((ratingTotal / total) * 10) / 10 : 0;
  const breakdown = {};
  for (let i = 1; i <= 5; i += 1) {
    const found = rows.find(row => row.rating === i);
    breakdown[i] = found ? found.count : 0;
  }
  return { total, average, breakdown };
}

function getCrmCustomers() {
  return db.prepare(`
    SELECT
      u.id,
      u.email,
      u.role,
      u.member_since,
      COUNT(o.id) AS order_count,
      COALESCE(SUM(o.total), 0) AS total_spent,
      MAX(o.date) AS last_order_date
    FROM users u
    LEFT JOIN orders o ON o.user_email = u.email
    GROUP BY u.id, u.email, u.role, u.member_since
    ORDER BY total_spent DESC, order_count DESC, u.id DESC
  `).all();
}

function getCrmActivity() {
  const orders = db.prepare(`
    SELECT id, user_email AS actor, date AS created_at, total AS value, status
    FROM orders
    ORDER BY rowid DESC
    LIMIT 8
  `).all().map(row => ({ type: 'order', ...row }));

  const enquiries = db.prepare(`
    SELECT id, email AS actor, date AS created_at, subject AS value, status
    FROM enquiries
    ORDER BY id DESC
    LIMIT 8
  `).all().map(row => ({ type: 'enquiry', ...row }));

  const subscriptions = db.prepare(`
    SELECT id, email AS actor, subscribed_at AS created_at, 'Newsletter signup' AS value, 'Subscribed' AS status
    FROM newsletter
    ORDER BY id DESC
    LIMIT 8
  `).all().map(row => ({ type: 'newsletter', ...row }));

  return [...orders, ...enquiries, ...subscriptions]
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    .slice(0, 15);
}

function buildOwnerDashboard() {
  const sales = db.prepare(`
    SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(total), 0) AS revenue,
      COALESCE(AVG(total), 0) AS average_order_value
    FROM orders
  `).get();

  const customerCount = db.prepare('SELECT COUNT(*) AS count FROM users WHERE role != ?').get('admin');
  const leadCount = db.prepare('SELECT COUNT(*) AS count FROM enquiries').get();
  const openLeadCount = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status IN ('New', 'Open', 'Pending')").get();
  const newsletterCount = db.prepare('SELECT COUNT(*) AS count FROM newsletter').get();
  const reviewCount = db.prepare('SELECT COUNT(*) AS count FROM reviews').get();
  const pendingReviewCount = db.prepare("SELECT COUNT(*) AS count FROM reviews WHERE status != 'approved'").get();
  const paymentRows = db.prepare(`
    SELECT payment_provider, payment_status, COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue
    FROM orders
    GROUP BY payment_provider, payment_status
    ORDER BY count DESC
  `).all();
  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY rowid DESC LIMIT 8').all();
  const lowStockProducts = db.prepare('SELECT id, name, flavor, stock, image FROM products WHERE stock <= 15 ORDER BY stock ASC LIMIT 8').all();
  const topProducts = db.prepare(`
    SELECT product_id, name, flavor, image, SUM(qty) AS units_sold, SUM(qty * price) AS revenue
    FROM order_items
    GROUP BY product_id, name, flavor, image
    ORDER BY units_sold DESC, revenue DESC
    LIMIT 8
  `).all();

  return {
    kpis: {
      total_orders: sales.total_orders || 0,
      revenue: sales.revenue || 0,
      average_order_value: Math.round(sales.average_order_value || 0),
      customers: customerCount.count || 0,
      leads: leadCount.count || 0,
      open_leads: openLeadCount.count || 0,
      newsletter_subscribers: newsletterCount.count || 0,
      reviews: reviewCount.count || 0,
      pending_reviews: pendingReviewCount.count || 0
    },
    firestore: getFirestoreStatus(),
    payment_breakdown: paymentRows,
    recent_orders: recentOrders,
    top_products: topProducts,
    low_stock_products: lowStockProducts,
    customers: getCrmCustomers().slice(0, 8),
    activity: getCrmActivity()
  };
}

export function registerApiRoutes(router) {
  // --- Auth Routes ---
  router.post('/api/auth/register', (req, res) => {
    const { email, password, firebase_uid } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
      const stmt = db.prepare('INSERT INTO users (email, password, role, firebase_uid) VALUES (?, ?, ?, ?)');
      const result = stmt.run(email, password, 'user', firebase_uid || null);
      const newUser = { id: result.lastInsertRowid, email, role: 'user', firebase_uid: firebase_uid || null };
      mirrorRecord('users', firebase_uid || email, newUser);
      res.json({ success: true, user: newUser });
    } catch (err) {
      res.status(400).json({ error: 'Account already exists' });
    }
  });
  
  router.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);
      if (user) {
        res.json({ success: true, user: { id: user.id, email: user.email, role: user.role, member_since: user.member_since, firebase_uid: user.firebase_uid } });
      } else {
        res.status(401).json({ error: 'Invalid email or password' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Server authentication error' });
    }
  });
  
  // --- Products Routes ---
  router.get('/api/products', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM products').all();
      res.json(rows.map(formatProductRow));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.post('/api/products', (req, res) => {
    const { id, name, flavor, title, price, image, description, weight, benefits, benefits_image, ingredients, specs, nutrition, stock } = req.body;
    try {
      db.prepare(`
        INSERT INTO products (id, name, flavor, title, price, image, description, weight, benefits, benefits_image, ingredients, specs, nutrition, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, name, flavor, title, parseInteger(price), image || 'images/makhana_classic.png', description, weight,
        JSON.stringify(benefits || []), benefits_image || 'images/makhana_bowl_love.png',
        JSON.stringify(ingredients || []), JSON.stringify(specs || {}), JSON.stringify(nutrition || {}),
        parseInteger(stock !== undefined ? stock : 25)
      );
      const savedProduct = getProductById(id);
      if (savedProduct) mirrorRecord('products', id, savedProduct);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  router.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, flavor, title, price, image, description, weight, benefits, benefits_image, ingredients, specs, nutrition, stock } = req.body;
    try {
      db.prepare(`
        UPDATE products 
        SET name = ?, flavor = ?, title = ?, price = ?, image = ?, description = ?, weight = ?, 
            benefits = ?, benefits_image = ?, ingredients = ?, specs = ?, nutrition = ?, stock = ?
        WHERE id = ?
      `).run(
        name, flavor, title, parseInteger(price), image, description, weight,
        JSON.stringify(benefits || []), benefits_image,
        JSON.stringify(ingredients || []), JSON.stringify(specs || {}), JSON.stringify(nutrition || {}),
        parseInteger(stock !== undefined ? stock : 25),
        id
      );
      const savedProduct = getProductById(id);
      if (savedProduct) mirrorRecord('products', id, savedProduct);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  router.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM products WHERE id = ?').run(id);
      deleteMirrorRecord('products', id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // --- Orders Routes ---
  router.get('/api/orders', (req, res) => {
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
  
  router.post('/api/orders', (req, res) => {
    const {
      id,
      user_email,
      date,
      est_delivery,
      payment_method,
      subtotal,
      discount,
      shipping,
      tax,
      cod_fee,
      total,
      items,
      status,
      payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;
  
    if (!id || !user_email || !items || items.length === 0) {
      return res.status(400).json({ error: 'Incomplete order payload' });
    }
  
    try {
      const paymentMeta = buildOrderPaymentMeta({
        payment_method,
        payment_id,
        razorpay_order_id,
        razorpay_signature
      });
  
      db.prepare(`
        INSERT INTO orders (
          id, user_email, date, est_delivery, payment_method, subtotal, discount, shipping,
          tax, cod_fee, total, status, payment_status, payment_provider, razorpay_order_id,
          razorpay_payment_id, razorpay_signature
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        user_email,
        date,
        est_delivery,
        payment_method,
        parseInteger(subtotal),
        parseInteger(discount),
        parseInteger(shipping),
        parseInteger(tax),
        parseInteger(cod_fee),
        parseInteger(total),
        status || 'Processing',
        paymentMeta.status,
        paymentMeta.provider,
        razorpay_order_id || null,
        payment_id || null,
        razorpay_signature || null
      );
  
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, name, flavor, weight, qty, price, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
  
      for (const item of items) {
        itemStmt.run(id, item.id, item.name, item.flavor, item.weight, item.qty, item.price, item.image);
      }
  
      if (paymentMeta.provider === 'razorpay' && (payment_id || razorpay_order_id)) {
        upsertPaymentRecord({
          local_order_id: id,
          provider_order_id: razorpay_order_id,
          provider_payment_id: payment_id,
          provider_signature: razorpay_signature,
          amount: total,
          currency: 'INR',
          status: payment_id ? 'captured_unverified' : 'created',
          method: payment_method,
          is_mock: payment_method?.toLowerCase().includes('simulated') ? 1 : 0,
          raw_payload: req.body
        });
      }
  
      const savedOrder = getOrderWithItems(id);
      if (savedOrder) mirrorRecord('orders', id, savedOrder);
  
      res.json({
        success: true,
        orderId: id,
        payment_status: paymentMeta.status,
        payment_provider: paymentMeta.provider
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  router.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, payment_status } = req.body;
  
    try {
      const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      db.prepare('UPDATE orders SET status = COALESCE(?, status), payment_status = COALESCE(?, payment_status) WHERE id = ?')
        .run(status || null, payment_status || null, id);
      const savedOrder = getOrderWithItems(id);
      if (savedOrder) mirrorRecord('orders', id, savedOrder);
  
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // --- CMS Content Routes ---
  router.get('/api/cms/content', (req, res) => {
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
  
  router.post('/api/cms/content', (req, res) => {
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
  router.get('/api/cms/styles', (req, res) => {
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
  
  router.post('/api/cms/styles', (req, res) => {
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
  router.post('/api/cms/reset', (req, res) => {
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
  router.get('/api/categories', (req, res) => {
    try {
      const list = db.prepare('SELECT * FROM categories').all();
      res.json(list);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/categories', (req, res) => {
    const { name, description, image } = req.body;
    try {
      const result = db.prepare('INSERT INTO categories (name, description, image) VALUES (?, ?, ?)')
        .run(name, description, image);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.put('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, image } = req.body;
    try {
      db.prepare('UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?')
        .run(name, description, image, id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM categories WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  // --- Banners Endpoints ---
  router.get('/api/banners', (req, res) => {
    try {
      const list = db.prepare('SELECT * FROM banners').all();
      res.json(list);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/banners', (req, res) => {
    const { title, subtitle, image, link } = req.body;
    try {
      const result = db.prepare('INSERT INTO banners (title, subtitle, image, link) VALUES (?, ?, ?, ?)')
        .run(title, subtitle, image, link);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.put('/api/banners/:id', (req, res) => {
    const { id } = req.params;
    const { title, subtitle, image, link } = req.body;
    try {
      db.prepare('UPDATE banners SET title = ?, subtitle = ?, image = ?, link = ? WHERE id = ?')
        .run(title, subtitle, image, link, id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.delete('/api/banners/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM banners WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  // --- Media Endpoints ---
  router.get('/api/media', (req, res) => {
    try {
      const list = db.prepare('SELECT * FROM media').all();
      res.json(list);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/media', (req, res) => {
    const { name, url } = req.body;
    try {
      const result = db.prepare('INSERT INTO media (name, url) VALUES (?, ?)')
        .run(name, url);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.delete('/api/media/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM media WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  // --- Product Reviews ---
  router.get('/api/reviews', (req, res) => {
    const { product_id, status } = req.query;
    try {
      let rows;
      if (product_id && status) {
        rows = db.prepare('SELECT * FROM reviews WHERE product_id = ? AND status = ? ORDER BY id DESC').all(product_id, status);
      } else if (product_id) {
        rows = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC').all(product_id);
      } else if (status) {
        rows = db.prepare('SELECT * FROM reviews WHERE status = ? ORDER BY id DESC').all(status);
      } else {
        rows = db.prepare('SELECT * FROM reviews ORDER BY id DESC').all();
      }
      res.json(rows.map(formatReview));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/api/products/:id/reviews', (req, res) => {
    const { id } = req.params;
    try {
      const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? AND status = ? ORDER BY id DESC').all(id, 'approved').map(formatReview);
      res.json({ summary: getReviewSummary(id), reviews });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/api/reviews', (req, res) => {
    const { product_id, user_email, user_uid, name, rating, title, comment, status } = req.body;
    if (!product_id || !name || !rating || !comment) {
      return res.status(400).json({ error: 'Product, name, rating, and comment are required' });
    }

    try {
      const result = db.prepare(`
        INSERT INTO reviews (product_id, user_email, user_uid, name, rating, title, comment, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(product_id, user_email || null, user_uid || null, name, parseInteger(rating, 5), title || null, comment, status || 'pending');
      const saved = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
      mirrorRecord('reviews', result.lastInsertRowid, saved);
      res.json({ success: true, id: result.lastInsertRowid, review: formatReview(saved) });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/api/reviews/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status || 'approved', id);
      const saved = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
      if (saved) mirrorRecord('reviews', id, saved);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/api/reviews/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
      deleteMirrorRecord('reviews', id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Testimonials Endpoints ---
  router.get('/api/testimonials', (req, res) => {
    try {
      const list = db.prepare('SELECT * FROM testimonials').all();
      res.json(list);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/testimonials', (req, res) => {
    const { name, quote, rating, avatar } = req.body;
    try {
      const result = db.prepare('INSERT INTO testimonials (name, quote, rating, avatar) VALUES (?, ?, ?, ?)')
        .run(name, quote, parseInt(rating || 5), avatar);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.put('/api/testimonials/:id', (req, res) => {
    const { id } = req.params;
    const { name, quote, rating, avatar } = req.body;
    try {
      db.prepare('UPDATE testimonials SET name = ?, quote = ?, rating = ?, avatar = ? WHERE id = ?')
        .run(name, quote, parseInt(rating || 5), avatar, id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.delete('/api/testimonials/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  // --- Blog Endpoints ---
  router.get('/api/blog', (req, res) => {
    try {
      const list = db.prepare('SELECT * FROM blog ORDER BY id DESC').all();
      res.json(list);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/blog', (req, res) => {
    const { title, content, image } = req.body;
    try {
      const result = db.prepare('INSERT INTO blog (title, content, image) VALUES (?, ?, ?)')
        .run(title, content, image);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.put('/api/blog/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, image } = req.body;
    try {
      db.prepare('UPDATE blog SET title = ?, content = ?, image = ? WHERE id = ?')
        .run(title, content, image, id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.delete('/api/blog/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM blog WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  // --- FAQs Endpoints ---
  router.get('/api/faqs', (req, res) => {
    try {
      const list = db.prepare('SELECT * FROM faqs').all();
      res.json(list);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/faqs', (req, res) => {
    const { question, answer } = req.body;
    try {
      const result = db.prepare('INSERT INTO faqs (question, answer) VALUES (?, ?)')
        .run(question, answer);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.put('/api/faqs/:id', (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;
    try {
      db.prepare('UPDATE faqs SET question = ?, answer = ? WHERE id = ?')
        .run(question, answer, id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.delete('/api/faqs/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM faqs WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  // --- Enquiries Endpoints ---
  router.get('/api/enquiries', (req, res) => {
    try {
      const list = db.prepare('SELECT * FROM enquiries ORDER BY id DESC').all();
      res.json(list);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/enquiries', (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
      const result = db.prepare('INSERT INTO enquiries (name, email, subject, message) VALUES (?, ?, ?, ?)')
        .run(name, email, subject, message);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.put('/api/enquiries/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(status, id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.delete('/api/enquiries/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM enquiries WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  // --- Coupons Endpoints ---
  router.get('/api/coupons', (req, res) => {
    try {
      const list = db.prepare('SELECT * FROM coupons').all();
      res.json(list);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/coupons', (req, res) => {
    const { code, discount_rate, active } = req.body;
    try {
      db.prepare('INSERT INTO coupons (code, discount_rate, active) VALUES (?, ?, ?)')
        .run(code.trim().toUpperCase(), parseFloat(discount_rate), active ? 1 : 0);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.put('/api/coupons/:code', (req, res) => {
    const { code } = req.params;
    const { discount_rate, active } = req.body;
    try {
      db.prepare('UPDATE coupons SET discount_rate = ?, active = ? WHERE code = ?')
        .run(parseFloat(discount_rate), active ? 1 : 0, code);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.delete('/api/coupons/:code', (req, res) => {
    const { code } = req.params;
    try {
      db.prepare('DELETE FROM coupons WHERE code = ?').run(code);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  // --- Newsletter Endpoints ---
  router.get('/api/newsletter', (req, res) => {
    try {
      const list = db.prepare('SELECT * FROM newsletter ORDER BY id DESC').all();
      res.json(list);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    try {
      const result = db.prepare('INSERT INTO newsletter (email) VALUES (?)').run(email.trim());
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: 'Already subscribed' }); }
  });
  router.delete('/api/newsletter/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM newsletter WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  // --- Users & Roles Management ---
  router.get('/api/users', (req, res) => {
    try {
      const list = db.prepare('SELECT id, email, role, member_since FROM users').all();
      res.json(list);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.put('/api/users/:id/role', (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  router.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  // --- Settings Endpoints ---
  router.get('/api/settings/seo', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM seo_settings').all();
      const settings = {};
      for (const r of rows) settings[r.key] = r.value;
      res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/settings/seo', (req, res) => {
    const settings = req.body;
    try {
      const stmt = db.prepare('INSERT INTO seo_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
      for (const [k, v] of Object.entries(settings)) stmt.run(k, v);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  router.get('/api/settings/payment', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM payment_settings').all();
      const settings = {};
      for (const r of rows) settings[r.method] = r.enabled;
      res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/settings/payment', (req, res) => {
    const settings = req.body; // { method: enabled }
    try {
      const stmt = db.prepare('INSERT INTO payment_settings (method, enabled) VALUES (?, ?) ON CONFLICT(method) DO UPDATE SET enabled = excluded.enabled');
      for (const [k, v] of Object.entries(settings)) stmt.run(k, v ? 1 : 0);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  router.get('/api/settings/shipping', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM shipping_settings').all();
      const settings = {};
      for (const r of rows) settings[r.key] = r.value;
      res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/api/settings/shipping', (req, res) => {
    const settings = req.body;
    try {
      const stmt = db.prepare('INSERT INTO shipping_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
      for (const [k, v] of Object.entries(settings)) stmt.run(k, v);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  // --- Razorpay / Gateway Settings ---
  router.get('/api/settings/gateway', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM gateway_settings').all();
      const settings = {};
      for (const r of rows) settings[r.key] = r.value;
      const { keyId, isConfigured, source } = getRazorpayCredentials();
      settings.razorpay_configured = isConfigured;
      settings.razorpay_source = source;
      settings.razorpay_mode = keyId?.startsWith('rzp_live_') ? 'live' : 'test';
      if (source === 'env') {
        settings.razorpay_key_id = keyId;
        settings.razorpay_key_secret = 'Configured in backend .env';
      }
      res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  
  router.post('/api/settings/gateway', (req, res) => {
    const settings = req.body;
    try {
      const stmt = db.prepare('INSERT INTO gateway_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
      for (const [k, v] of Object.entries(settings)) {
        if (['razorpay_configured', 'razorpay_source', 'razorpay_mode'].includes(k)) continue;
        if (k === 'razorpay_key_secret' && v === 'Configured in backend .env') continue;
        stmt.run(k, v);
      }
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });
  
  router.post('/api/payments/razorpay/order', async (req, res) => {
    const { amount, receipt } = req.body;
    const amountInPaise = toPaise(amount);
  
    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
  
    try {
      const { keyId, keySecret, isConfigured } = getRazorpayCredentials();
      const localOrderId = receipt || `rec_${Date.now()}`;
  
      if (!isConfigured) {
        const mockOrderId = `order_mock_${Math.floor(100000 + Math.random() * 900000)}`;
        upsertPaymentRecord({
          local_order_id: localOrderId,
          provider_order_id: mockOrderId,
          amount: amountInPaise,
          currency: 'INR',
          status: 'mock_created',
          method: 'Razorpay',
          is_mock: 1,
          raw_payload: { amount, receipt, mockOrderId }
        });
  
        return res.json({
          success: true,
          orderId: mockOrderId,
          keyId: DEFAULT_RAZORPAY_KEY_ID,
          amount: amountInPaise,
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
          amount: amountInPaise,
          currency: 'INR',
          receipt: localOrderId,
          payment_capture: 1
        })
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ? data.error.description : 'Razorpay order creation failed');
      }
  
      upsertPaymentRecord({
        local_order_id: localOrderId,
        provider_order_id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: data.status || 'created',
        method: 'Razorpay',
        is_mock: 0,
        raw_payload: data
      });
  
      res.json({
        success: true,
        orderId: data.id,
        keyId,
        amount: data.amount,
        currency: data.currency,
        isMock: false
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.post('/api/payments/razorpay/verify', (req, res) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      amount
    } = req.body;
  
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Razorpay order and payment ids are required' });
    }
  
    try {
      const { keySecret, isConfigured } = getRazorpayCredentials();
      const isMock = razorpay_order_id.startsWith('order_mock_');
      let verified = isMock;
  
      if (isConfigured && !isMock) {
        if (!razorpay_signature) {
          return res.status(400).json({ error: 'Razorpay signature is required for live verification' });
        }
  
        verified = verifyRazorpaySignature({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          keySecret
        });
      }
  
      if (!verified) {
        upsertPaymentRecord({
          local_order_id: order_id,
          provider_order_id: razorpay_order_id,
          provider_payment_id: razorpay_payment_id,
          provider_signature: razorpay_signature,
          amount,
          currency: 'INR',
          status: 'verification_failed',
          method: 'Razorpay',
          is_mock: isMock ? 1 : 0,
          raw_payload: req.body
        });
  
        return res.status(400).json({ error: 'Invalid Razorpay signature' });
      }
  
      upsertPaymentRecord({
        local_order_id: order_id,
        provider_order_id: razorpay_order_id,
        provider_payment_id: razorpay_payment_id,
        provider_signature: razorpay_signature,
        amount,
        currency: 'INR',
        status: 'captured',
        method: 'Razorpay',
        is_mock: isMock ? 1 : 0,
        raw_payload: req.body
      });
  
      if (order_id) {
        db.prepare(`
          UPDATE orders
          SET payment_status = 'Paid',
              payment_provider = 'razorpay',
              razorpay_order_id = ?,
              razorpay_payment_id = ?,
              razorpay_signature = ?
          WHERE id = ?
        `).run(razorpay_order_id, razorpay_payment_id, razorpay_signature || null, order_id);
        const savedOrder = getOrderWithItems(order_id);
        if (savedOrder) mirrorRecord('orders', order_id, savedOrder);
      }
  
      mirrorRecord('payments', razorpay_payment_id, {
        local_order_id: order_id,
        provider: 'razorpay',
        provider_order_id: razorpay_order_id,
        provider_payment_id: razorpay_payment_id,
        amount,
        currency: 'INR',
        status: 'captured',
        is_mock: isMock ? 1 : 0
      });
  
      res.json({
        success: true,
        verified: true,
        isMock,
        paymentId: razorpay_payment_id
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get('/api/payments', (req, res) => {
    const { order_id } = req.query;
  
    try {
      const rows = order_id
        ? db.prepare('SELECT * FROM payments WHERE local_order_id = ? ORDER BY id DESC').all(order_id)
        : db.prepare('SELECT * FROM payments ORDER BY id DESC').all();
  
      res.json(rows.map(formatPayment));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // --- Firestore Sync / Status ---
  router.get('/api/firestore/status', (req, res) => {
    res.json(getFirestoreStatus());
  });

  router.post('/api/firestore/sync', async (req, res) => {
    if (!requireAdminSync(req, res)) return;
    try {
      const snapshot = {
        products: db.prepare('SELECT * FROM products').all().map(formatProductRow),
        users: db.prepare('SELECT id, email, role, member_since, firebase_uid FROM users').all(),
        orders: db.prepare('SELECT * FROM orders ORDER BY rowid DESC').all().map(order => getOrderWithItems(order.id)),
        payments: db.prepare('SELECT * FROM payments ORDER BY id DESC').all().map(formatPayment),
        reviews: db.prepare('SELECT * FROM reviews ORDER BY id DESC').all().map(formatReview),
        crmNotes: db.prepare('SELECT * FROM crm_notes ORDER BY id DESC').all()
      };
      const result = await syncCollectionsToFirestore(snapshot);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message, status: getFirestoreStatus() });
    }
  });

  // sitemap.xml dynamic generation
  router.get('/sitemap.xml', (req, res) => {
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
  router.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: /admin/\nDisallow: /admin\nSitemap: https://reinoro.com/sitemap.xml\n");
  });
  
  // --- Owner CRM Dashboard Endpoints ---
  router.get('/api/owner/dashboard', (req, res) => {
    try {
      res.json(buildOwnerDashboard());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get('/api/crm/dashboard', (req, res) => {
    try {
      res.json(buildOwnerDashboard());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get('/api/owner/crm/customers', (req, res) => {
    try {
      res.json(getCrmCustomers());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get('/api/owner/crm/leads', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM enquiries ORDER BY id DESC').all());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get('/api/owner/crm/activity', (req, res) => {
    try {
      res.json(getCrmActivity());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get('/api/owner/crm/notes', (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Customer email is required' });
    }
  
    try {
      const notes = db.prepare('SELECT * FROM crm_notes WHERE customer_email = ? ORDER BY id DESC').all(email);
      res.json(notes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.post('/api/owner/crm/notes', (req, res) => {
    const { customer_email, note, owner } = req.body;
    if (!customer_email || !note) {
      return res.status(400).json({ error: 'Customer email and note are required' });
    }
  
    try {
      const result = db.prepare('INSERT INTO crm_notes (customer_email, note, owner) VALUES (?, ?, ?)')
        .run(customer_email, note, owner || 'owner');
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
}
