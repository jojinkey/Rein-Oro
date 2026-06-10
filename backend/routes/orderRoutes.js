import { Router } from "express";
import { getOrders, createOrder } from "../controller/ordersController.js";

const router = Router();

router.get("/api/orders", getOrders);
router.post("/api/orders", createOrder);

export default router;
