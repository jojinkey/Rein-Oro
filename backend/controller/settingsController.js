import {
 queryFirestoreCollection,
 mirrorToFirestore,
} from "../util/firestore.js";

export async function getSeoSettings(req, res) {
 try {
  const rows = await queryFirestoreCollection("seo_settings");
  const settings = {};
  for (const r of rows) settings[r.id || r.key] = r.value;
  res.json(settings);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function postSeoSettings(req, res) {
 const settings = req.body;
 try {
  for (const [k, v] of Object.entries(settings)) {
   await mirrorToFirestore("seo_settings", k, { key: k, value: v });
  }
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

export async function getPaymentSettings(req, res) {
 try {
  const rows = await queryFirestoreCollection("payment_settings");
  const settings = {};
  for (const r of rows) settings[r.id || r.method] = r.enabled;
  res.json(settings);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function postPaymentSettings(req, res) {
 const settings = req.body;
 try {
  for (const [k, v] of Object.entries(settings)) {
   await mirrorToFirestore("payment_settings", k, {
    method: k,
    enabled: v ? 1 : 0,
   });
  }
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

export async function getShippingSettings(req, res) {
 try {
  const rows = await queryFirestoreCollection("shipping_settings");
  const settings = {};
  for (const r of rows) settings[r.id || r.key] = r.value;
  res.json(settings);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function postShippingSettings(req, res) {
 const settings = req.body;
 try {
  for (const [k, v] of Object.entries(settings))
   await mirrorToFirestore("shipping_settings", k, { key: k, value: v });
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

export async function getGatewaySettings(req, res) {
 try {
  const rows = await queryFirestoreCollection("gateway_settings");
  const settings = {};
  for (const r of rows) settings[r.id || r.key] = r.value;
  res.json(settings);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function postGatewaySettings(req, res) {
 const settings = req.body;
 try {
  for (const [k, v] of Object.entries(settings))
   await mirrorToFirestore("gateway_settings", k, { key: k, value: v });
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
