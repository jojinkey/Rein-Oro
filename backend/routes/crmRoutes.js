import { Router } from "express";
import {
 getCrmCustomers,
 getCrmActivity,
 buildOwnerDashboard,
} from "../controller/apiController.js";

const router = Router();

let cachedDashboardData = null;
let lastDashboardFetchTime = 0;
const DASHBOARD_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export function invalidateDashboardCache() {
 cachedDashboardData = null;
 lastDashboardFetchTime = 0;
}

const getDashboardData = async () => {
 const now = Date.now();
 if (cachedDashboardData && (now - lastDashboardFetchTime < DASHBOARD_CACHE_TTL)) {
  return cachedDashboardData;
 }
 const data = await buildOwnerDashboard();
 cachedDashboardData = data;
 lastDashboardFetchTime = now;
 return data;
};

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
  const data = await getDashboardData();
  res.json(data);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

// legacy owner dashboard endpoint expected by frontend
router.get("/api/owner/dashboard", async (req, res) => {
 try {
  const data = await getDashboardData();
  res.json(data);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

export default router;
