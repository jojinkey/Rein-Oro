import { Router } from "express";
import {
 createRazorpayOrder,
 verifyRazorpayPayment,
} from "../controller/ordersController.js";

const router = Router();

router.post("/api/payments/razorpay/order", createRazorpayOrder);
router.post("/api/payments/razorpay/verify", verifyRazorpayPayment);

export default router;
