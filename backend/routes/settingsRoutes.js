import { Router } from "express";
import * as settings from "../controller/settingsController.js";
import { protect, restrict2 } from "../controller/authController.js";

const router = Router();

router.get("/api/settings/seo", settings.getSeoSettings);
router.post("/api/settings/seo", settings.postSeoSettings);

router.get("/api/settings/payment", settings.getPaymentSettings);
router.post("/api/settings/payment", settings.postPaymentSettings);

router.get("/api/settings/shipping", settings.getShippingSettings);
router.post("/api/settings/shipping", settings.postShippingSettings);

router.get(
 "/api/settings/gateway",
 protect,
 restrict2("admin"),
 settings.getGatewaySettings,
);
router.post(
 "/api/settings/gateway",
 protect,
 restrict2("admin"),
 settings.postGatewaySettings,
);

export default router;
