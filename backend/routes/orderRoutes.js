import { Router } from "express";
import {
 getOrders,
 createOrder,
 updateOrderStatus,
 getShippingRegions,
 saveShippingRegion,
 deleteShippingRegion,
} from "../controller/ordersController.js";
import { protect, restrict2 } from "../controller/authController.js";

const router = Router();

router.get("/api/orders", getOrders);
router.post("/api/orders", createOrder);
router.put("/api/orders/:id/status", updateOrderStatus);

// Custom Shipping Region endpoints
router.get("/api/shipping-regions", getShippingRegions);
router.post(
 "/api/shipping-regions",
 protect,
 restrict2("admin"),
 saveShippingRegion,
);
router.delete(
 "/api/shipping-regions/:id",
 protect,
 restrict2("admin"),
 deleteShippingRegion,
);

export default router;
