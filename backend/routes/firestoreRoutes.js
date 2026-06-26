import { Router } from "express";
import {
 queryFirestoreCollection,
 syncCollectionsToFirestore,
 getFirestoreStatus,
} from "../util/firestore.js";
import { requireAdminSync } from "../controller/apiController.js";

const router = Router();

router.post("/api/firestore/sync", async (req, res) => {
 if (!requireAdminSync(req, res)) return;
 try {
  const snapshot = {};
  const tables = [
   "products",
   "orders",
   "order_items",
   "users",
   "categories",
   "banners",
   "media",
   "testimonials",
   "blog",
   "faqs",
   "enquiries",
   "coupons",
   "newsletter",
   "seo_settings",
   "payment_settings",
   "shipping_settings",
   "gateway_settings",
   "payments",
   "reviews",
   "website_visits",
  ];
  for (const t of tables) {
   try {
    snapshot[t] = await queryFirestoreCollection(t);
   } catch (e) {
    snapshot[t] = [];
   }
  }
  const result = await syncCollectionsToFirestore(snapshot);
  res.json(result);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

router.get("/api/firestore/status", (req, res) => {
 try {
  const status = getFirestoreStatus();
  res.json(status);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

export default router;
