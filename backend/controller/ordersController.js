import {
 mirrorPaymentRecord,
 getRazorpayCredentials,
 toPaise,
 verifyRazorpaySignature,
} from "./apiController.js";
import {
 mirrorToFirestore,
 queryFirestoreCollection,
 getFirestoreDocument,
 deleteFromFirestore,
} from "../util/firestore.js";
import { invalidateDashboardCache } from "../routes/crmRoutes.js";

const RAZORPAY_BUSINESS_NAME = "Rein Oro Foods";
const GST_RATE_PERCENT = 18;
const DEFAULT_GST_BUSINESS_PROFILE = Object.freeze({
 name: "REIN ORO FOODS",
 legal_name: "VAIBHAV SINGH PANWAR",
 trade_name: "REIN ORO FOODS",
 constitution: "Proprietorship",
 gstin: "05GMOPP5339F1ZN",
 registration_no: "05GMOPP5339F1ZN",
 building_no: "499/3",
 street: "Street Number 11",
 landmark: "Vashu Electricals & All Dish Services",
 locality: "Rajender Nagar",
 city: "Roorkee",
 district: "Haridwar",
 state: "Uttarakhand",
 pin_code: "247667",
 address:
  "499/3, Street Number 11, Rajender Nagar, Near Vashu Electricals & All Dish Services, Roorkee, Haridwar, Uttarakhand - 247667",
 address_lines: [
  "Building No./Flat No.: 499/3",
  "Street Number 11, Rajender Nagar",
  "Near Vashu Electricals & All Dish Services",
  "Roorkee, Haridwar, Uttarakhand - 247667",
 ],
});

function readEnv(name) {
 const value = process.env[name];
 return value && String(value).trim() ? String(value).trim() : "";
}

function getGstBusinessProfile() {
 const address = readEnv("GST_BUSINESS_ADDRESS");
 const addressLines = address
  ? address
    .split("|")
    .map((line) => line.trim())
    .filter(Boolean)
  : DEFAULT_GST_BUSINESS_PROFILE.address_lines;

 return {
  ...DEFAULT_GST_BUSINESS_PROFILE,
  name: readEnv("GST_BUSINESS_NAME") || DEFAULT_GST_BUSINESS_PROFILE.name,
  legal_name:
   readEnv("GST_BUSINESS_LEGAL_NAME") ||
   DEFAULT_GST_BUSINESS_PROFILE.legal_name,
  trade_name:
   readEnv("GST_BUSINESS_TRADE_NAME") ||
   DEFAULT_GST_BUSINESS_PROFILE.trade_name,
  constitution:
   readEnv("GST_BUSINESS_CONSTITUTION") ||
   DEFAULT_GST_BUSINESS_PROFILE.constitution,
  gstin: readEnv("GST_BUSINESS_GSTIN") || DEFAULT_GST_BUSINESS_PROFILE.gstin,
  registration_no:
   readEnv("GST_BUSINESS_REGISTRATION_NO") ||
   DEFAULT_GST_BUSINESS_PROFILE.registration_no,
  address: address || DEFAULT_GST_BUSINESS_PROFILE.address,
  address_lines: addressLines.length
   ? addressLines
   : DEFAULT_GST_BUSINESS_PROFILE.address_lines,
  city: readEnv("GST_BUSINESS_CITY") || DEFAULT_GST_BUSINESS_PROFILE.city,
  district:
   readEnv("GST_BUSINESS_DISTRICT") || DEFAULT_GST_BUSINESS_PROFILE.district,
  state: readEnv("GST_BUSINESS_STATE") || DEFAULT_GST_BUSINESS_PROFILE.state,
  pin_code:
   readEnv("GST_BUSINESS_PIN_CODE") || DEFAULT_GST_BUSINESS_PROFILE.pin_code,
 };
}

function toMoney(value) {
 const amount = Number(value);
 if (!Number.isFinite(amount)) return 0;
 return Math.round(amount * 100) / 100;
}

function normalizeState(value) {
 return String(value || "")
  .trim()
  .toLowerCase()
  .replace(/\s+/g, " ");
}

function buildInvoiceNumber(orderId, dateValue = new Date()) {
 const date = new Date(dateValue);
 const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
 const yyyymmdd = safeDate.toISOString().slice(0, 10).replace(/-/g, "");
 const safeOrderId = String(orderId || Date.now())
  .replace(/[^a-zA-Z0-9]/g, "")
  .slice(-10)
  .toUpperCase();
 return `RO-GST-${yyyymmdd}-${safeOrderId}`;
}

function buildGstInvoice({
 id,
 date,
 user_email,
 customer_email,
 customer_phone,
 customer_gstin,
 subtotal,
 discount,
 shipping,
 tax,
 total,
 items,
 shipping_address,
 payment_id,
}) {
 const seller = getGstBusinessProfile();
 const sellerState = seller.state;
 const buyerState = shipping_address?.state || "";
 const isIntraState =
  normalizeState(sellerState) &&
  normalizeState(sellerState) === normalizeState(buyerState);
 const gstAmount = toMoney(tax);
 const taxableValue = toMoney(Math.max(0, Number(total || 0) - gstAmount));
 const cgst = isIntraState ? toMoney(gstAmount / 2) : 0;
 const sgst = isIntraState ? toMoney(gstAmount / 2) : 0;
 const igst = isIntraState ? 0 : gstAmount;

 return {
  invoice_no: buildInvoiceNumber(id, new Date()),
  order_id: id,
  invoice_date: new Date().toISOString(),
  seller,
  buyer: {
   name: shipping_address?.fullName || customer_email || user_email,
   email: customer_email || user_email,
   phone: customer_phone || shipping_address?.phone || "",
   gstin: customer_gstin || "",
   address: shipping_address || null,
   state: buyerState,
  },
  place_of_supply: buyerState || "India",
  tax_type: isIntraState ? "CGST_SGST" : "IGST",
  gst_rate_percent: GST_RATE_PERCENT,
  taxable_value: taxableValue,
  cgst,
  sgst,
  igst,
  total_gst: gstAmount,
  subtotal: toMoney(subtotal),
  discount: toMoney(discount),
  shipping: toMoney(shipping),
  total: toMoney(total),
  payment_id: payment_id || "",
  items: (Array.isArray(items) ? items : []).map((item) => {
   const qty = Number(item.qty || item.quantity || 0);
   const price = Number(item.price || 0);
   return {
    name: item.name || item.title || "Item",
    flavor: item.flavor || "",
    weight: item.weight || "",
    hsn: item.hsn || process.env.GST_DEFAULT_HSN || "",
    qty,
    unit_price: toMoney(price),
    taxable_value: toMoney(qty * price),
    gst_rate_percent: GST_RATE_PERCENT,
    line_total: toMoney(qty * price),
   };
  }),
 };
}

function cleanRazorpayNote(value) {
 return String(value || "")
  .trim()
  .slice(0, 256);
}

function buildRazorpayNotes(receipt, customer = {}) {
 return Object.fromEntries(
  Object.entries({
   merchant: RAZORPAY_BUSINESS_NAME,
   local_order_id: receipt,
   customer_name: customer.name,
   customer_email: customer.email,
   customer_phone: customer.contact,
  })
   .map(([key, value]) => [key, cleanRazorpayNote(value)])
   .filter(([, value]) => value),
 );
}

async function validatePaidRazorpayPayload({
 local_order_id,
 total,
 payment_id,
 razorpay_order_id,
 razorpay_signature,
}) {
 if (!payment_id || !razorpay_order_id || !razorpay_signature) {
  const err = new Error("Only paid Razorpay orders are accepted.");
  err.statusCode = 400;
  throw err;
 }

 const { keySecret, isConfigured } = await getRazorpayCredentials();
 if (!isConfigured) {
  const err = new Error("Razorpay live credentials are not configured.");
  err.statusCode = 503;
  throw err;
 }

 const createdPaymentOrder = await getFirestoreDocument(
  "payments",
  razorpay_order_id,
 );
 if (!createdPaymentOrder) {
  const err = new Error("Razorpay order was not created by this checkout.");
  err.statusCode = 400;
  throw err;
 }

 if (
  createdPaymentOrder.local_order_id &&
  createdPaymentOrder.local_order_id !== local_order_id
 ) {
  const err = new Error("Razorpay order does not match this checkout.");
  err.statusCode = 400;
  throw err;
 }

 const expectedAmount = toPaise(total);
 if (
  expectedAmount <= 0 ||
  Number(createdPaymentOrder.amount || 0) !== expectedAmount
 ) {
  const err = new Error("Razorpay payment amount does not match this order.");
  err.statusCode = 400;
  throw err;
 }

 const existingPayment = await getFirestoreDocument("payments", payment_id);
 if (
  existingPayment?.local_order_id &&
  existingPayment.local_order_id !== local_order_id
 ) {
  const err = new Error("Razorpay payment was already used for another order.");
  err.statusCode = 400;
  throw err;
 }

 const valid = verifyRazorpaySignature({
  orderId: razorpay_order_id,
  paymentId: payment_id,
  signature: razorpay_signature,
  keySecret,
 });

 if (!valid) {
  const err = new Error("Invalid Razorpay payment signature.");
  err.statusCode = 400;
  throw err;
 }
}

export async function getOrders(req, res) {
 const { email } = req.query;
 try {
  const opts = {};
  if (email) {
   opts.where = [["user_email", "==", email]];
  } else {
   opts.orderBy = [["date", "desc"]];
  }
  const ordersList = await queryFirestoreCollection("orders", opts);
  if (email && ordersList.length > 1) {
   ordersList.sort((a, b) => {
    const aTime = Date.parse(a.date || "") || 0;
    const bTime = Date.parse(b.date || "") || 0;
    return bTime - aTime;
   });
  }
  res.json(ordersList);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function createOrder(req, res) {
 const {
  id,
  user_email,
  customer_email,
  customer_phone,
  customer_gstin,
  date,
  est_delivery,
  subtotal,
  discount,
  shipping,
  tax,
  cod_fee,
  total,
  items,
  shipping_address,
  payment_id,
  razorpay_order_id,
  razorpay_signature,
 } = req.body;
 if (!id || !user_email || !items || items.length === 0) {
  return res.status(400).json({ error: "Incomplete order payload" });
 }
 try {
  await validatePaidRazorpayPayload({
   local_order_id: id,
   total,
   payment_id,
   razorpay_order_id,
   razorpay_signature,
  });

  const paidAt = new Date().toISOString();
  const gstInvoice = buildGstInvoice({
   id,
   date,
   user_email,
   customer_email,
   customer_phone,
   customer_gstin,
   subtotal,
   discount,
   shipping,
   tax,
   total,
   items,
   shipping_address,
   payment_id,
  });

  const orderRecord = {
   id,
   user_email,
   customer_email: customer_email || user_email,
   customer_phone: customer_phone || shipping_address?.phone || "",
   customer_gstin: customer_gstin || "",
   date,
   est_delivery,
   payment_method: "Paid via Razorpay Online",
   subtotal,
   discount,
   shipping,
   tax,
   cod_fee: 0,
   total,
   items,
   shipping_address,
   payment_provider: "razorpay",
   payment_status: "Paid",
   payment_id,
   razorpay_order_id,
   razorpay_signature,
   paid_at: paidAt,
   status: "Processing",
   created_at: paidAt,
   invoice_no: gstInvoice.invoice_no,
   gst_invoice: gstInvoice,
  };

  await mirrorPaymentRecord({
   local_order_id: id,
   provider_order_id: razorpay_order_id,
   provider_payment_id: payment_id,
   provider_signature: razorpay_signature,
   amount: total,
   currency: "INR",
   status: "Paid",
   method: "Razorpay",
   is_mock: 0,
   raw_payload: {
    order_id: id,
    razorpay_order_id,
    payment_id,
   },
  });

  // Store order as a single document in Firestore
  await mirrorToFirestore("orders", id, orderRecord);

  try {
   invalidateDashboardCache();
  } catch (cacheErr) {
   console.error("Failed to invalidate dashboard cache:", cacheErr);
  }

  res.json({
   success: true,
   orderId: id,
   invoice: gstInvoice,
   order: orderRecord,
  });
 } catch (err) {
  res.status(err.statusCode || 400).json({ error: err.message });
 }
}

export async function createRazorpayOrder(req, res) {
 const { amount, receipt, customer = {} } = req.body;
 if (!amount) return res.status(400).json({ error: "Amount is required" });
 try {
  const { keyId, keySecret, isConfigured } = await getRazorpayCredentials();
  if (!isConfigured) {
   return res
    .status(503)
    .json({ error: "Razorpay live credentials are not configured." });
  }

  const authHeader =
   "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
   method: "POST",
   headers: { "Content-Type": "application/json", Authorization: authHeader },
   body: JSON.stringify({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: receipt || `rec_${Date.now()}`,
    notes: buildRazorpayNotes(receipt, customer),
   }),
  });
  const data = await response.json();
  if (!response.ok)
   throw new Error(
    data.error ? data.error.description : "Razorpay order creation failed",
   );
  await mirrorPaymentRecord({
   local_order_id: receipt || null,
   provider_order_id: data.id,
   amount: Number(data.amount) / 100,
   currency: data.currency,
   status: "created",
   is_mock: 0,
   raw_payload: data,
  });
  res.json({
   success: true,
   orderId: data.id,
   keyId,
   amount: data.amount,
   currency: data.currency,
   isMock: false,
  });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function verifyRazorpayPayment(req, res) {
 const {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  order_id,
  amount,
 } = req.body;
 if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
  return res
   .status(400)
   .json({ error: "Missing payment verification details" });
 }

 try {
  const { keySecret, isConfigured } = await getRazorpayCredentials();
  if (!isConfigured) {
   return res
    .status(503)
    .json({ error: "Razorpay live credentials are not configured." });
  }

  const valid = verifyRazorpaySignature({
   orderId: razorpay_order_id,
   paymentId: razorpay_payment_id,
   signature: razorpay_signature,
   keySecret,
  });
  if (!valid) {
   return res.status(400).json({ error: "Invalid payment signature" });
  }

  const record = await mirrorPaymentRecord({
   local_order_id: order_id || null,
   provider_order_id: razorpay_order_id,
   provider_payment_id: razorpay_payment_id,
   provider_signature: razorpay_signature,
   amount,
   currency: "INR",
   status: "Paid",
   method: "Razorpay",
   is_mock: 0,
   raw_payload: req.body,
  });

  res.json({ success: true, payment: record });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

function getOrderCreationTime(order) {
 if (order.created_at) {
  return new Date(order.created_at).getTime();
 }
 if (order.date) {
  const cleanDate = order.date.replace(" at ", " ");
  const parsed = Date.parse(cleanDate);
  if (!isNaN(parsed)) {
   return parsed;
  }
 }
 if (order.firestore_updated_at) {
  if (typeof order.firestore_updated_at.toDate === "function") {
   return order.firestore_updated_at.toDate().getTime();
  }
  if (order.firestore_updated_at._seconds) {
   return order.firestore_updated_at._seconds * 1000;
  }
 }
 return Date.now();
}

export async function updateOrderStatus(req, res) {
 const orderId = String(req.params.id || "").trim();
 if (!orderId) {
  return res.status(400).json({ error: "Order id is required" });
 }
 const status = String(req.body.status || "").trim();
 if (!status) {
  return res.status(400).json({ error: "status is required" });
 }
 try {
  const existing = await getFirestoreDocument("orders", orderId);
  if (!existing) {
   return res.status(404).json({ error: "Order not found" });
  }

  if (status === "Cancelled") {
   const creationTime = getOrderCreationTime(existing);
   const sixHoursInMs = 6 * 60 * 60 * 1000;
   if (Date.now() - creationTime > sixHoursInMs) {
    return res.status(400).json({ error: "the order can't be cancelled after 6 hours of placing the order." });
   }
  }

  await mirrorToFirestore("orders", orderId, { status });
  res.json({ success: true, status });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function getShippingRegions(req, res) {
 try {
  const list = await queryFirestoreCollection("shipping_regions");
  res.json(list);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function saveShippingRegion(req, res) {
 const { id, name, states, price } = req.body;
 if (!name || !Array.isArray(states) || typeof price !== "number") {
  return res.status(400).json({ error: "Invalid payload. Name, states (array), and price (number) are required." });
 }

 const safeId = id || `region_${Date.now()}`;
 const data = {
  id: safeId,
  name: name.trim(),
  states: states.map((s) => String(s).trim()),
  price: Number(price) || 0,
 };

 try {
  await mirrorToFirestore("shipping_regions", safeId, data);
  res.json({ success: true, region: data });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function deleteShippingRegion(req, res) {
 const { id } = req.params;
 if (!id) {
  return res.status(400).json({ error: "Region ID is required." });
 }

 try {
  await deleteFromFirestore("shipping_regions", id);
  res.json({ success: true });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
