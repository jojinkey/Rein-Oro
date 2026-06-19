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
} from "../util/firestore.js";

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
  shipping_address,
 } = req.body;
 if (!id || !user_email || !items || items.length === 0) {
  return res.status(400).json({ error: "Incomplete order payload" });
 }
 try {
  // Store order as a single document in Firestore
  await mirrorToFirestore("orders", id, {
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
   shipping_address,
   status: "Processing",
   created_at: new Date().toISOString(),
  });
  res.json({ success: true, orderId: id });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

export async function createRazorpayOrder(req, res) {
 const { amount, receipt } = req.body;
 if (!amount) return res.status(400).json({ error: "Amount is required" });
 try {
  const { keyId, keySecret, isConfigured } = await getRazorpayCredentials();
  if (!isConfigured) {
   const mockOrderId = `order_mock_${Math.floor(100000 + Math.random() * 900000)}`;
   const record = {
    local_order_id: receipt || null,
    provider: "razorpay",
    provider_order_id: mockOrderId,
    amount: toPaise(amount),
    currency: "INR",
    status: "created",
    is_mock: 1,
   };
   await mirrorPaymentRecord(record);
   return res.json({
    success: true,
    orderId: mockOrderId,
    keyId: keyId || "rzp_test_defaultKeyId",
    amount: Math.round(amount * 100),
    currency: "INR",
    isMock: true,
   });
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
   amount: data.amount,
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
  if (isConfigured) {
   const valid = verifyRazorpaySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    keySecret,
   });
   if (!valid) {
    return res.status(400).json({ error: "Invalid payment signature" });
   }
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
   is_mock: isConfigured ? 0 : 1,
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

