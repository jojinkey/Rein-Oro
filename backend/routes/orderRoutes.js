import { Router } from "express";
import {
 getOrders,
 createOrder,
 updateOrderStatus,
 getShiprocketConfigStatus,
 createOrderShiprocketShipment,
} from "../controller/ordersController.js";
import { protect, restrict2 } from "../controller/authController.js";

const router = Router();

router.get("/api/orders", getOrders);
router.post("/api/orders", createOrder);
router.put("/api/orders/:id/status", updateOrderStatus);
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

export default router;
