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
 const average = Number(averageRating.toFixed(2));
 return {
  total: totalReviews,
  totalReviews,
  average,
  averageRating: average,
  breakdown: ratingCounts,
  ratingCounts,
 };
}

function reviewProductId(review) {
 return cleanText(review.productId || review.product_id);
}

function reviewStatus(review) {
 return cleanText(review.status || "approved").toLowerCase();
}

function formatReview(review) {
 const productId = reviewProductId(review);
 const createdAt = review.createdAt || review.created_at || "";
 const userName = review.userName || review.name || "";
 return {
  ...review,
  productId,
  product_id: productId,
  userName,
  name: userName,
  createdAt,
  created_at: createdAt,
 };
}

function sortReviewsNewestFirst(reviews) {
 return [...reviews].sort((a, b) => {
  const aTime = new Date(a.createdAt || a.created_at || 0).getTime();
  const bTime = new Date(b.createdAt || b.created_at || 0).getTime();
  return bTime - aTime;
 });
}

export async function getReviews(req, res) {
 try {
  const productId = cleanText(req.query.productId || req.query.product_id);
  const status = cleanText(req.query.status);
  const where = [];
  if (status) where.push(["status", "==", status]);
  const reviews = await queryFirestoreCollection(REVIEW_COLLECTION, {
   where,
  });
  const filteredReviews = reviews
   .map(formatReview)
   .filter((review) => !productId || review.productId === productId);
  res.json(sortReviewsNewestFirst(filteredReviews));
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
 const productId = String(req.params.id || "").trim();
 if (!productId) {
  return res.status(400).json({ error: "Product id is required" });
 }
 try {
  const reviews = await queryFirestoreCollection(REVIEW_COLLECTION, {
   where: [["status", "==", "approved"]],
  });
  const sortedReviews = sortReviewsNewestFirst(
   reviews
    .map(formatReview)
    .filter(
     (review) =>
      review.productId === productId && reviewStatus(review) === "approved",
    ),
  );
  res.json({ summary: buildReviewSummary(sortedReviews), reviews: sortedReviews });
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
