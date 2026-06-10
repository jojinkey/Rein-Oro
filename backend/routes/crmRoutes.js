import { Router } from "express";
import {
 getCrmCustomers,
 getCrmActivity,
 buildOwnerDashboard,
} from "../controller/apiController.js";

const router = Router();

router.get("/api/crm/customers", async (req, res) => {
 try {
  const data = await getCrmCustomers();
  res.json(data);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});
router.get("/api/crm/activity", async (req, res) => {
 try {
  const data = await getCrmActivity();
  res.json(data);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});
router.get("/api/crm/dashboard", async (req, res) => {
 try {
  const data = await buildOwnerDashboard();
  res.json(data);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

// legacy owner dashboard endpoint expected by frontend
router.get("/api/owner/dashboard", async (req, res) => {
 try {
  const data = await buildOwnerDashboard();
  res.json(data);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

export default router;
