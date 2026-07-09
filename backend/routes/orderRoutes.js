import { Router } from "express";
import {
 getOrders,
 createOrder,
 updateOrderStatus,
 getShiprocketConfigStatus,
 createOrderShiprocketShipment,
 estimateShippingPrice,
 assignOrderShiprocketAwb,
 generateOrderShiprocketLabel,
 receiveShippingWebhook,
} from "../controller/ordersController.js";
import { protect, restrict2 } from "../controller/authController.js";

const router = Router();

router.get("/api/orders", getOrders);
router.post("/api/orders", createOrder);
router.put("/api/orders/:id/status", updateOrderStatus);
router.post("/api/shipping/estimate", estimateShippingPrice);
router.post("/api/shipping/update", receiveShippingWebhook);

router.get(
 "/api/shiprocket/status",
 protect,
 restrict2("admin"),
 getShiprocketConfigStatus,
);
router.post(
 "/api/orders/:id/shiprocket",
 protect,
 restrict2("admin"),
 createOrderShiprocketShipment,
);
router.post(
 "/api/orders/:id/awb",
 protect,
 restrict2("admin"),
 assignOrderShiprocketAwb,
);
router.post(
 "/api/orders/:id/label",
 protect,
 restrict2("admin"),
 generateOrderShiprocketLabel,
);

export default router;
