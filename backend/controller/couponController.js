import {
 deleteFromFirestore,
 getFirestoreDocument,
 mirrorToFirestore,
 queryFirestoreCollection,
} from "../util/firestore.js";

const COUPON_COLLECTION = "coupons";

function normalizeCode(value) {
 return String(value || "")
  .trim()
  .toUpperCase();
}

function normalizeBoolean(value) {
 return value === true || value === "true" || value === 1 || value === "1";
}

function normalizeCouponPayload(body, keepCode = true) {
 return {
  code: keepCode ? normalizeCode(body.code || body.code) : undefined,
  discount_rate: Number.isFinite(Number(body.discount_rate))
   ? Number(body.discount_rate)
   : 0,
  active: normalizeBoolean(body.active) || false,
 };
}

function validateCouponPayload(payload, isUpdate = false) {
 const errors = [];
 if (!isUpdate && !payload.code) {
  errors.push("code is required");
 }
 if (!Number.isFinite(payload.discount_rate)) {
  errors.push("discount_rate is required and must be a number");
 } else if (payload.discount_rate < 0 || payload.discount_rate > 1) {
  errors.push("discount_rate must be between 0 and 1");
 }
 return errors;
}

export async function getCoupons(req, res) {
 try {
  const activeFilter =
   req.query.active !== undefined ? normalizeBoolean(req.query.active) : null;
  const coupons = await queryFirestoreCollection(COUPON_COLLECTION, {
   orderBy: [["code", "asc"]],
  });
  const filteredCoupons =
   activeFilter === null
    ? coupons
    : coupons.filter((coupon) => normalizeBoolean(coupon.active) === activeFilter);
  res.json(filteredCoupons);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function getCouponByCode(req, res) {
 const code = normalizeCode(req.params.code);
 if (!code) {
  return res.status(400).json({ error: "Coupon code is required" });
 }
 try {
  const coupon = await getFirestoreDocument(COUPON_COLLECTION, code);
  if (!coupon) {
   return res.status(404).json({ error: "Coupon not found" });
  }
  res.json(coupon);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function addCoupon(req, res) {
 try {
  const payload = normalizeCouponPayload(req.body);
  const errors = validateCouponPayload(payload);
  if (errors.length) {
   return res.status(400).json({ error: "Validation failed", details: errors });
  }
  const existing = await getFirestoreDocument(COUPON_COLLECTION, payload.code);
  if (existing) {
   return res.status(409).json({ error: "Coupon already exists" });
  }
  await mirrorToFirestore(COUPON_COLLECTION, payload.code, payload);
  res.status(201).json({ success: true, coupon: payload });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function updateCoupon(req, res) {
 const code = normalizeCode(req.params.code);
 if (!code) {
  return res.status(400).json({ error: "Coupon code is required" });
 }
 try {
  const existing = await getFirestoreDocument(COUPON_COLLECTION, code);
  if (!existing) {
   return res.status(404).json({ error: "Coupon not found" });
  }
  const payload = normalizeCouponPayload({ ...existing, ...req.body }, false);
  payload.code = code;
  const errors = validateCouponPayload(payload, true);
  if (errors.length) {
   return res.status(400).json({ error: "Validation failed", details: errors });
  }
  await mirrorToFirestore(COUPON_COLLECTION, code, payload);
  res.json({ success: true, coupon: payload });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function deleteCoupon(req, res) {
 const code = normalizeCode(req.params.code);
 if (!code) {
  return res.status(400).json({ error: "Coupon code is required" });
 }
 try {
  const existing = await getFirestoreDocument(COUPON_COLLECTION, code);
  if (!existing) {
   return res.status(404).json({ error: "Coupon not found" });
  }
  await deleteFromFirestore(COUPON_COLLECTION, code);
  res.json({ success: true });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function applyCoupon(req, res) {
 const code = normalizeCode(req.body.code || req.query.code);
 const orderTotal = Number(
  req.body.orderTotal ?? req.body.total ?? req.query.orderTotal,
 );
 if (!code) {
  return res.status(400).json({ error: "Coupon code is required" });
 }
 if (!Number.isFinite(orderTotal) || orderTotal < 0) {
  return res
   .status(400)
   .json({ error: "orderTotal is required and must be a non-negative number" });
 }
 try {
  const coupon = await getFirestoreDocument(COUPON_COLLECTION, code);
  if (!coupon || !coupon.active) {
   return res.status(404).json({ error: "Coupon not found or inactive" });
  }
  const discountRate = Number(coupon.discount_rate) || 0;
  const discountAmount = Number((orderTotal * discountRate).toFixed(2));
  const totalAfterDiscount = Number((orderTotal - discountAmount).toFixed(2));
  res.json({
   success: true,
   code,
   discountRate,
   discountAmount,
   orderTotal,
   totalAfterDiscount,
  });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
