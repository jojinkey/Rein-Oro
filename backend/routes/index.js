import { Router } from "express";
import { registerApiRoutes } from "../controller/apiController.js";
import orderRoutes from "./orderRoutes.js";
import cmsRoutes from "./cmsRoutes.js";
import userRoutes from "./userRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import firestoreRoutes from "./firestoreRoutes.js";
import crmRoutes from "./crmRoutes.js";
import siteRoutes from "./siteRoutes.js";
import {
 getProducts,
 getProductById,
 addProduct,
 updateProduct,
 deleteProduct,
} from "../controller/productController.js";
import {
 getReviews,
 getReviewById,
 getProductReviews,
 addReview,
 updateReviewStatus,
 deleteReview,
} from "../controller/reviewController.js";
import {
 getCoupons,
 getCouponByCode,
 addCoupon,
 updateCoupon,
 deleteCoupon,
 applyCoupon,
} from "../controller/couponController.js";

const router = Router();

registerApiRoutes(router);
router.use(orderRoutes);
router.use(cmsRoutes);
router.use(userRoutes);
router.use(settingsRoutes);
router.use(paymentRoutes);
router.use(firestoreRoutes);
router.use(crmRoutes);
router.use(siteRoutes);

router.get("/api/products", getProducts);
router.get("/api/products/:id", getProductById);
router.post("/api/products", addProduct);
router.put("/api/products/:id", updateProduct);
router.delete("/api/products/:id", deleteProduct);

router.get("/api/reviews", getReviews);
router.get("/api/reviews/:id", getReviewById);
router.get("/api/products/:id/reviews", getProductReviews);
router.post("/api/reviews", addReview);
router.put("/api/reviews/:id/status", updateReviewStatus);
router.delete("/api/reviews/:id", deleteReview);

router.post("/api/coupons/apply", applyCoupon);
router.get("/api/coupons", getCoupons);
router.get("/api/coupons/:code", getCouponByCode);
router.post("/api/coupons", addCoupon);
router.put("/api/coupons/:code", updateCoupon);
router.delete("/api/coupons/:code", deleteCoupon);

export default router;
