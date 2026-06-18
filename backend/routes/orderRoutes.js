import { Router } from "express";
import { getOrders, createOrder, updateOrderStatus } from "../controller/ordersController.js";

const router = Router();

router.get("/api/orders", getOrders);
router.post("/api/orders", createOrder);
router.put("/api/orders/:id/status", updateOrderStatus);

export default router;
