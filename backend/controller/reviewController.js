import crypto from "crypto";
import {
 deleteFromFirestore,
 getFirestoreDocument,
 mirrorToFirestore,
 queryFirestoreCollection,
} from "../util/firestore.js";

const REVIEW_COLLECTION = "reviews";

function cleanText(value) {
 return value === undefined || value === null ? "" : String(value).trim();
}

function normalizeTimestamp(value) {
 if (value === undefined || value === null || value === "") {
  return new Date().toISOString();
 }
 const date = new Date(value);
 return Number.isFinite(date.getTime())
  ? date.toISOString()
  : new Date().toISOString();
}

function normalizeReviewPayload(body) {
 return {
  productId: cleanText(body.productId || body.product_id),
  userId: cleanText(body.userId || body.user_uid),
  userName: cleanText(body.userName || body.name),
  rating: Number.isFinite(Number(body.rating)) ? Number(body.rating) : 0,
  title: cleanText(body.title),
  comment: cleanText(body.comment),
  isVerifiedPurchase: Boolean(
   body.isVerifiedPurchase ?? body.is_verified_purchase ?? false,
  ),
  status: cleanText(body.status) || "pending",
  createdAt: normalizeTimestamp(body.createdAt || body.created_at),
 };
}

function validateReviewPayload(payload, options = {}) {
 const errors = [];
 if (!payload.productId) {
  errors.push("productId is required");
 }
 if (!payload.userId) {
  errors.push("userId is required");
 }
 if (!payload.userName) {
  errors.push("userName is required");
 }
 if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
  errors.push("rating must be an integer between 1 and 5");
 }
 if (!payload.title) {
  errors.push("title is required");
 }
 if (!payload.comment) {
  errors.push("comment is required");
 }
 if (typeof payload.isVerifiedPurchase !== "boolean") {
  errors.push("isVerifiedPurchase must be a boolean");
 }
 if (!payload.createdAt) {
  errors.push("createdAt is required");
 }
 return errors;
}

function buildReviewSummary(reviews) {
 const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
 let totalRating = 0;
 for (const review of reviews) {
  const rating = Number(review.rating) || 0;
  if (rating >= 1 && rating <= 5) {
   ratingCounts[rating] += 1;
   totalRating += rating;
  }
 }
 const totalReviews = reviews.length;
 const averageRating = totalReviews ? totalRating / totalReviews : 0;
 return {
  totalReviews,
  averageRating: Number(averageRating.toFixed(2)),
  ratingCounts,
 };
}

export async function getReviews(req, res) {
 try {
  const queryId = cleanText(req.query.productId || req.query.product_id);
  const status = cleanText(req.query.status);
  
  let reviews = await queryFirestoreCollection(REVIEW_COLLECTION);
  
  if (queryId) {
   const products = await queryFirestoreCollection("products");
   const product = products.find(p => p.id === queryId || p.slug === queryId || p.title === queryId);
   const productIds = new Set([queryId]);
   if (product) {
    if (product.id) productIds.add(product.id);
    if (product.slug) productIds.add(product.slug);
   }
   reviews = reviews.filter((r) => productIds.has(r.productId || r.product_id));
  }
  
  if (status) {
   reviews = reviews.filter((r) => r.status === status);
  }
  
  reviews.sort((a, b) => {
   const tA = new Date(a.createdAt || a.created_at || 0).getTime();
   const tB = new Date(b.createdAt || b.created_at || 0).getTime();
   return tB - tA;
  });
  res.json(reviews);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function getReviewById(req, res) {
 const reviewId = String(req.params.id || "").trim();
 if (!reviewId) {
  return res.status(400).json({ error: "Review id is required" });
 }
 try {
  const review = await getFirestoreDocument(REVIEW_COLLECTION, reviewId);
  if (!review) {
   return res.status(404).json({ error: "Review not found" });
  }
  res.json(review);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function getProductReviews(req, res) {
 const paramId = String(req.params.id || "").trim();
 if (!paramId) {
  return res.status(400).json({ error: "Product id is required" });
 }
 try {
  const products = await queryFirestoreCollection("products");
  const product = products.find(p => p.id === paramId || p.slug === paramId || p.title === paramId);
  const productIds = new Set([paramId]);
  if (product) {
   if (product.id) productIds.add(product.id);
   if (product.slug) productIds.add(product.slug);
  }

  const reviews = await queryFirestoreCollection(REVIEW_COLLECTION);
  const approvedReviews = reviews
   .filter((r) => {
    const rId = String(r.productId || r.product_id || "").trim();
    const status = String(r.status || "").trim();
    return productIds.has(rId) && status === "approved";
   })
   .sort((a, b) => {
    const tA = new Date(a.createdAt || a.created_at || 0).getTime();
    const tB = new Date(b.createdAt || b.created_at || 0).getTime();
    return tB - tA;
   });
  res.json({ summary: buildReviewSummary(approvedReviews), reviews: approvedReviews });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function addReview(req, res) {
 try {
  const payload = normalizeReviewPayload(req.body);
  const errors = validateReviewPayload(payload);
  if (errors.length) {
   return res.status(400).json({ error: "Validation failed", details: errors });
  }
  const reviewId = String(req.body.id || crypto.randomUUID());
  const existing = await getFirestoreDocument(REVIEW_COLLECTION, reviewId);
  if (existing) {
   return res.status(409).json({ error: "Review already exists" });
  }
  await mirrorToFirestore(REVIEW_COLLECTION, reviewId, {
   id: reviewId,
   ...payload,
  });
  res.status(201).json({ success: true, review: { id: reviewId, ...payload } });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function updateReviewStatus(req, res) {
 const reviewId = String(req.params.id || "").trim();
 if (!reviewId) {
  return res.status(400).json({ error: "Review id is required" });
 }
 const status = cleanText(req.body.status || "approved");
 if (!status) {
  return res.status(400).json({ error: "status is required" });
 }
 try {
  const existing = await getFirestoreDocument(REVIEW_COLLECTION, reviewId);
  if (!existing) {
   return res.status(404).json({ error: "Review not found" });
  }
  await mirrorToFirestore(REVIEW_COLLECTION, reviewId, { status });
  res.json({ success: true, status });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function deleteReview(req, res) {
 const reviewId = String(req.params.id || "").trim();
 if (!reviewId) {
  return res.status(400).json({ error: "Review id is required" });
 }
 try {
  const existing = await getFirestoreDocument(REVIEW_COLLECTION, reviewId);
  if (!existing) {
   return res.status(404).json({ error: "Review not found" });
  }
  await deleteFromFirestore(REVIEW_COLLECTION, reviewId);
  res.json({ success: true });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
