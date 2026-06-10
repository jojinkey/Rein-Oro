import { Router } from "express";
import * as settings from "../controller/settingsController.js";

const router = Router();

router.get("/api/settings/seo", settings.getSeoSettings);
router.post("/api/settings/seo", settings.postSeoSettings);

router.get("/api/settings/payment", settings.getPaymentSettings);
router.post("/api/settings/payment", settings.postPaymentSettings);

router.get("/api/settings/shipping", settings.getShippingSettings);
router.post("/api/settings/shipping", settings.postShippingSettings);

router.get("/api/settings/gateway", settings.getGatewaySettings);
router.post("/api/settings/gateway", settings.postGatewaySettings);

export default router;
