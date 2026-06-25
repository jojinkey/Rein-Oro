import crypto from "crypto";
import {
 deleteFromFirestore,
 getFirestoreDocument,
 getFirestoreStatus,
 mirrorToFirestore,
 queryFirestoreCollection,
 syncCollectionsToFirestore,
} from "../util/firestore.js";
import {
 register as authRegister,
 login as authLogin,
 protect as authProtect,
 restrict2,
} from "./authController.js";
import {
 getEnvValue,
 resolveRazorpayCredentials,
} from "../util/razorpayCredentials.js";

function mirrorRecord(collectionName, documentId, data) {
 mirrorToFirestore(collectionName, documentId, data).catch((err) => {
  console.error(
   `Firestore mirror failed for ${collectionName}/${documentId}:`,
   err.message,
  );
 });
}

function deleteMirrorRecord(collectionName, documentId) {
 deleteFromFirestore(collectionName, documentId).catch((err) => {
  console.error(
   `Firestore delete failed for ${collectionName}/${documentId}:`,
   err.message,
  );
 });
}

function requireAdminSync(req, res) {
 const secret = process.env.ADMIN_API_SECRET;
 if (!secret) return true;
 if (req.headers["x-admin-secret"] === secret) return true;
 res.status(403).json({ error: "Admin sync secret is required" });
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

async function getGatewaySetting(key, fallback = "") {
 const doc = await getFirestoreDocument("gateway_settings", key);
 return doc?.value || fallback;
}

async function getRazorpayCredentials() {
 return resolveRazorpayCredentials({ getGatewaySetting });
}

function verifyRazorpaySignature({ orderId, paymentId, signature, keySecret }) {
 const expected = crypto
  .createHmac("sha256", keySecret)
  .update(`${orderId}|${paymentId}`)
  .digest("hex");

 const expectedBuffer = Buffer.from(expected);
 const signatureBuffer = Buffer.from(signature);
 return (
  expectedBuffer.length === signatureBuffer.length &&
  crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
 );
}

function buildOrderPaymentMeta({
 payment_method,
 payment_id,
 razorpay_order_id,
}) {
 const method = String(payment_method || "").toLowerCase();

 if (method.includes("razorpay") || payment_id || razorpay_order_id) {
  return {
   provider: "razorpay",
   status: payment_id ? "Paid" : "Pending",
  };
 }

 if (method.includes("cash on delivery") || method.includes("cod")) {
  return {
   provider: "cod",
   status: "COD Pending",
  };
 }

 if (
  method.includes("paid") ||
  method.includes("upi") ||
  method.includes("card") ||
  method.includes("net banking")
 ) {
  return {
   provider: "manual_online",
   status: "Paid",
  };
 }

 return {
  provider: null,
  status: "Pending",
 };
}

async function mirrorPaymentRecord({
 local_order_id,
 provider_order_id,
 provider_payment_id,
 provider_signature,
 amount,
 currency = "INR",
 status = "created",
 method = "Razorpay",
 is_mock = 0,
 raw_payload = {},
}) {
 const amountValue =
  Number(amount) > 1000 ? parseInteger(amount) : toPaise(amount);
 const paymentDocId =
  provider_payment_id || provider_order_id || local_order_id;
 const record = {
  local_order_id: local_order_id || null,
  provider: "razorpay",
  provider_order_id: provider_order_id || null,
  provider_payment_id: provider_payment_id || null,
  provider_signature: provider_signature || null,
  amount: amountValue,
  currency,
  status,
  method,
  is_mock: is_mock ? 1 : 0,
  raw_payload: JSON.parse(JSON.stringify(raw_payload || {})),
 };

 await mirrorToFirestore("payments", paymentDocId, record);
 return record;
}

function formatPayment(payment) {
 return {
  ...payment,
  amount_rupees: Math.round((Number(payment.amount || 0) / 100) * 100) / 100,
 };
}

function formatProductRow(row) {
 return {
  ...row,
  benefits: JSON.parse(row.benefits),
  ingredients: JSON.parse(row.ingredients),
  specs: JSON.parse(row.specs),
  nutrition: JSON.parse(row.nutrition),
 };
}

async function getProductById(id) {
 const prod = await getFirestoreDocument("products", id);
 return prod || null;
}

async function getOrderWithItems(id) {
 return getFirestoreDocument("orders", id);
}

function formatReview(row) {
 return {
  ...row,
  rating: parseInteger(row.rating, 5),
 };
}

async function getReviewSummary(productId) {
 const rows = await queryFirestoreCollection("reviews", {
  where: [
   ["product_id", "==", productId],
   ["status", "==", "approved"],
  ],
 });
 const counts = {};
 let total = 0;
 let ratingTotal = 0;
 for (const r of rows) {
  const rating = Number(r.rating || 5);
  counts[rating] = (counts[rating] || 0) + 1;
  total += 1;
  ratingTotal += rating;
 }
 const average = total ? Math.round((ratingTotal / total) * 10) / 10 : 0;
 const breakdown = {};
 for (let i = 1; i <= 5; i += 1) breakdown[i] = counts[i] || 0;
 return { total, average, breakdown };
}

function formatMemberSince(u) {
 if (u.member_since) {
  return u.member_since;
 }
 const dateVal = u.createdAt;
 if (!dateVal) {
  return "N/A";
 }
 let dateObj = null;
 if (typeof dateVal.toDate === "function") {
  dateObj = dateVal.toDate();
 } else if (typeof dateVal === "object" && (dateVal._seconds || dateVal.seconds)) {
  const secs = dateVal._seconds || dateVal.seconds;
  dateObj = new Date(secs * 1000);
 } else {
  dateObj = new Date(dateVal);
 }
 if (!dateObj || isNaN(dateObj.getTime())) {
  return "N/A";
 }
 const pad = (n) => String(n).padStart(2, "0");
 return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
}

async function getCrmCustomers() {
 const users = await queryFirestoreCollection("users");
 const orders = await queryFirestoreCollection("orders");
 return users
  .map((user) => {
   const customerOrders = orders.filter(
    (order) => order.user_email === user.email,
   );
   const total_spent = customerOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0,
   );
   const last_order_date = customerOrders.reduce((latest, order) => {
    if (!order.date) return latest;
    return !latest || String(order.date) > String(latest) ? order.date : latest;
   }, null);
   return {
    id: user.id || user.email,
    email: user.email,
    role: user.role,
    member_since: formatMemberSince(user),
    order_count: customerOrders.length,
    total_spent,
    last_order_date,
   };
  })
  .sort((a, b) => {
   if (b.total_spent !== a.total_spent) return b.total_spent - a.total_spent;
   if (b.order_count !== a.order_count) return b.order_count - a.order_count;
   return (b.id || 0) - (a.id || 0);
  });
}

async function getCrmActivity() {
 const orders = (await queryFirestoreCollection("orders")).map((order) => ({
  type: "order",
  id: order.id,
  actor: order.user_email,
  created_at: order.date,
  value: order.total,
  status: order.status,
 }));
 const enquiriesRows = await queryFirestoreCollection("enquiries", {
  orderBy: [["date", "desc"]],
  limit: 8,
 });
 const enquiries = enquiriesRows.map((r) => ({
  type: "enquiry",
  id: r.id,
  actor: r.email,
  created_at: r.date,
  value: r.subject,
  status: r.status,
 }));
 const subscriptionsRows = await queryFirestoreCollection("newsletter", {
  orderBy: [["subscribed_at", "desc"]],
  limit: 8,
 });
 const subscriptions = subscriptionsRows.map((r) => ({
  type: "newsletter",
  id: r.id,
  actor: r.email,
  created_at: r.subscribed_at,
  value: "Newsletter signup",
  status: "Subscribed",
 }));
 return [...orders, ...enquiries, ...subscriptions]
  .sort((a, b) =>
   String(b.created_at || "").localeCompare(String(a.created_at || "")),
  )
  .slice(0, 15);
}

async function buildOwnerDashboard() {
 const orders = await queryFirestoreCollection("orders");
 const sales = {
  total_orders: orders.length,
  revenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
  average_order_value: orders.length
   ? orders.reduce((sum, order) => sum + Number(order.total || 0), 0) /
     orders.length
   : 0,
 };

 const usersRows = await queryFirestoreCollection("users");
 const customerCount = {
  count: usersRows.filter((u) => (u.role || "") !== "admin").length,
 };
 const enquiriesRows = await queryFirestoreCollection("enquiries");
 const leadCount = { count: enquiriesRows.length };
 const openLeadCount = {
  count: enquiriesRows.filter((e) =>
   ["New", "Open", "Pending"].includes(e.status),
  ).length,
 };
 const newsletterRows = await queryFirestoreCollection("newsletter");
 const newsletterCount = { count: newsletterRows.length };
 const reviewRows = await queryFirestoreCollection("reviews");
 const reviewCount = { count: reviewRows.length };
 const pendingReviewCount = {
  count: reviewRows.filter((r) => (r.status || "") !== "approved").length,
 };

 const paymentRows = orders.reduce((acc, order) => {
  const provider = order.payment_provider || "unknown";
  const status = order.payment_status || "unknown";
  const key = `${provider}::${status}`;
  if (!acc[key]) {
   acc[key] = {
    payment_provider: provider,
    payment_status: status,
    count: 0,
    revenue: 0,
   };
  }
  acc[key].count += 1;
  acc[key].revenue += Number(order.total || 0);
  return acc;
 }, {});

 const recentOrders = orders
  .slice()
  .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
  .slice(0, 8);

 const lowStockProducts = await queryFirestoreCollection("products", {
  where: [["stock", "<=", 15]],
  orderBy: [["stock", "asc"]],
  limit: 8,
 });

 const productMap = orders.reduce((map, order) => {
  const items = Array.isArray(order.items) ? order.items : [];
  for (const item of items) {
   const key = item.product_id || item.id || `${item.name}:${item.flavor}`;
   if (!map[key]) {
    map[key] = {
     product_id: item.product_id || item.id,
     name: item.name,
     flavor: item.flavor,
     image: item.image,
     units_sold: 0,
     revenue: 0,
    };
   }
   map[key].units_sold += Number(item.qty || 0);
   map[key].revenue += Number(item.qty || 0) * Number(item.price || 0);
  }
  return map;
 }, {});

 const topProducts = Object.values(productMap)
  .sort((a, b) => b.units_sold - a.units_sold || b.revenue - a.revenue)
  .slice(0, 8);

 return {
  kpis: {
   total_orders: sales.total_orders,
   revenue: sales.revenue,
   average_order_value: Math.round(sales.average_order_value || 0),
   customers: customerCount.count || 0,
   leads: leadCount.count || 0,
   open_leads: openLeadCount.count || 0,
   newsletter_subscribers: newsletterCount.count || 0,
   reviews: reviewCount.count || 0,
   pending_reviews: pendingReviewCount.count || 0,
  },
  firestore: getFirestoreStatus(),
  payment_breakdown: Object.values(paymentRows),
  recent_orders: recentOrders,
  top_products: topProducts,
  low_stock_products: lowStockProducts,
  customers: (await getCrmCustomers()).slice(0, 8),
  activity: await getCrmActivity(),
 };
}

export function registerApiRoutes(router) {
 // --- Auth Routes ---
 router.post("/api/auth/register", authRegister);
 router.post("/api/auth/login", authLogin);
}

export {
 deleteMirrorRecord,
 buildOrderPaymentMeta,
 formatPayment,
 formatProductRow,
 getOrderWithItems,
 formatReview,
 getReviewSummary,
 getCrmCustomers,
 getCrmActivity,
 buildOwnerDashboard,
 requireAdminSync,
 parseInteger,
 toPaise,
 getGatewaySetting,
 getEnvValue,
 getRazorpayCredentials,
 verifyRazorpaySignature,
 mirrorPaymentRecord,
};
