const DEFAULT_BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_CACHE_MS = 50 * 60 * 1000;

let cachedToken = "";
let cachedTokenExpiresAt = 0;

function readEnv(name) {
 const value = process.env[name];
 return value && String(value).trim() ? String(value).trim() : "";
}

function toNumber(value, fallback = 0) {
 const number = Number(value);
 return Number.isFinite(number) ? number : fallback;
}

function toMoney(value) {
 return Math.round(toNumber(value, 0) * 100) / 100;
}

function cleanString(value, fallback = "") {
 const text = String(value ?? "").trim();
 return text || fallback;
}

function parseJsonResponse(response) {
 return response
  .json()
  .catch(() => ({}));
}

function makeError(message, statusCode = 500, details = null) {
 const error = new Error(message);
 error.statusCode = statusCode;
 if (details) error.details = details;
 return error;
}

function buildShiprocketApiError(message, response, data) {
 const apiMessage =
  data?.message ||
  data?.error ||
  data?.errors?.[0]?.message ||
  data?.errors?.[0] ||
  message;
 return makeError(
  String(apiMessage || message),
  response?.status || 502,
  data && typeof data === "object" ? data : null,
 );
}

export function getShiprocketConfig() {
 const email = readEnv("SHIPROCKET_EMAIL");
 const password = readEnv("SHIPROCKET_PASSWORD");
 const pickupLocation = readEnv("SHIPROCKET_PICKUP_LOCATION") || "Primary";
 const pickupPostcode = readEnv("SHIPROCKET_PICKUP_POSTCODE");
 const baseUrl = readEnv("SHIPROCKET_BASE_URL") || DEFAULT_BASE_URL;
 const channelId = readEnv("SHIPROCKET_CHANNEL_ID");
 const missing = [
  !email ? "SHIPROCKET_EMAIL" : null,
  !password ? "SHIPROCKET_PASSWORD" : null,
  !pickupPostcode ? "SHIPROCKET_PICKUP_POSTCODE" : null,
 ].filter(Boolean);

 return {
  email,
  password,
  pickupLocation,
  pickupPostcode,
  baseUrl: baseUrl.replace(/\/+$/, ""),
  channelId,
  configured: missing.length === 0,
  missing,
 };
}

export function getShiprocketStatus() {
 const config = getShiprocketConfig();
 return {
  configured: config.configured,
  emailConfigured: Boolean(config.email),
  pickupLocationConfigured: Boolean(config.pickupLocation),
  pickupPostcodeConfigured: Boolean(config.pickupPostcode),
  channelIdConfigured: Boolean(config.channelId),
  baseUrl: config.baseUrl,
  missing: config.missing,
 };
}

function assertConfigured() {
 const config = getShiprocketConfig();
 if (!config.configured) {
  throw makeError(
   `Shiprocket API is not configured. Missing: ${config.missing.join(", ")}`,
   503,
   { missing: config.missing },
  );
 }
 return config;
}

export function clearShiprocketTokenCache() {
 cachedToken = "";
 cachedTokenExpiresAt = 0;
}

export async function getShiprocketToken({ forceRefresh = false } = {}) {
 const config = assertConfigured();
 if (!forceRefresh && cachedToken && Date.now() < cachedTokenExpiresAt) {
  return cachedToken;
 }

 const response = await fetch(`${config.baseUrl}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
   email: config.email,
   password: config.password,
  }),
 });
 const data = await parseJsonResponse(response);
 if (!response.ok || !data?.token) {
  throw buildShiprocketApiError("Shiprocket login failed", response, data);
 }

 cachedToken = data.token;
 cachedTokenExpiresAt = Date.now() + TOKEN_CACHE_MS;
 return cachedToken;
}

export async function shiprocketRequest(path, options = {}) {
 const config = assertConfigured();
 const normalizedPath = path.startsWith("/") ? path : `/${path}`;
 let token = await getShiprocketToken();

 for (let attempt = 0; attempt < 2; attempt += 1) {
  const response = await fetch(`${config.baseUrl}${normalizedPath}`, {
   ...options,
   headers: {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
   },
  });
  const data = await parseJsonResponse(response);

  if (response.status === 401 && attempt === 0) {
   token = await getShiprocketToken({ forceRefresh: true });
   continue;
  }

  if (!response.ok) {
   throw buildShiprocketApiError("Shiprocket request failed", response, data);
  }

  return data;
 }

 throw makeError("Shiprocket authentication failed", 502);
}

function formatShiprocketDate(value) {
 const parsed =
  value instanceof Date
   ? value
   : new Date(String(value || "").replace(" at ", " "));
 const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
 const pad = (part) => String(part).padStart(2, "0");
 return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function splitCustomerName(value, fallbackEmail = "") {
 const fallback = cleanString(fallbackEmail.split("@")[0], "Customer");
 const parts = cleanString(value, fallback).split(/\s+/).filter(Boolean);
 if (parts.length <= 1) {
  return { firstName: parts[0] || fallback, lastName: "" };
 }
 return {
  firstName: parts.slice(0, -1).join(" "),
  lastName: parts[parts.length - 1],
 };
}

function normalizePhone(value) {
 const digits = String(value || "").replace(/\D/g, "");
 if (digits.length >= 10) return digits.slice(-10);
 return digits;
}

function makeSku(item, index) {
 return cleanString(item.sku || item.id || item.cart_key || item.cartKey, `RO-${index + 1}`)
  .replace(/[^a-zA-Z0-9_-]/g, "-")
  .slice(0, 50);
}

function parseItemWeightKg(weight) {
 const text = String(weight || "").trim().toLowerCase();
 const number = Number.parseFloat(text.replace(/,/g, ""));
 if (!Number.isFinite(number) || number <= 0) return 0;
 if (text.includes("kg")) return number;
 if (text.includes("g")) return number / 1000;
 return number > 20 ? number / 1000 : number;
}

function estimateOrderWeightKg(items) {
 const total = (Array.isArray(items) ? items : []).reduce((sum, item) => {
  const units = Math.max(1, toNumber(item.qty ?? item.quantity, 1));
  return sum + parseItemWeightKg(item.weight || item.variant) * units;
 }, 0);
 return Math.max(0.1, Math.round(total * 1000) / 1000);
}

function getPackageDimension(name, fallback) {
 return Math.max(0.1, toNumber(readEnv(name), fallback));
}

function getPackageWeight(order) {
 const configured = toNumber(readEnv("SHIPROCKET_PACKAGE_WEIGHT_KG"), 0);
 if (configured > 0) return configured;
 return estimateOrderWeightKg(order.items);
}

function getBillingAddress(order) {
 const address = order.shipping_address || {};
 return {
  fullName: cleanString(address.fullName || address.name, order.customer_email || order.user_email),
  street: cleanString(address.street || address.address, "Address not provided"),
  apartment: cleanString(address.apartment || address.address_2),
  city: cleanString(address.city, "NA"),
  state: cleanString(address.state, "NA"),
  pincode: cleanString(address.pincode || address.pin_code || address.zip),
  country: cleanString(address.country, "India"),
  phone: normalizePhone(address.phone || order.customer_phone),
  email: cleanString(order.customer_email || order.user_email),
 };
}

export function buildShiprocketOrderPayload(order) {
 const config = assertConfigured();
 const address = getBillingAddress(order);
 const { firstName, lastName } = splitCustomerName(
  address.fullName,
  address.email,
 );
 const items = Array.isArray(order.items) ? order.items : [];
 if (!items.length) {
  throw makeError("Shiprocket shipment requires at least one order item.", 400);
 }
 if (!address.pincode || !/^\d{6}$/.test(address.pincode)) {
  throw makeError("Shiprocket shipment requires a valid 6-digit delivery PIN code.", 400);
 }
 if (!address.phone || address.phone.length !== 10) {
  throw makeError("Shiprocket shipment requires a valid 10-digit delivery phone number.", 400);
 }

 const itemTotal = items.reduce((sum, item) => {
  const units = Math.max(1, toNumber(item.qty ?? item.quantity, 1));
  return sum + toMoney(item.price) * units;
 }, 0);
 const subtotal = toMoney(order.subtotal || itemTotal);
 const isCod =
  String(order.payment_method || "").toLowerCase().includes("cod") ||
  String(order.payment_method || "").toLowerCase().includes("cash");

 return {
  order_id: cleanString(order.id),
  order_date: formatShiprocketDate(order.created_at || order.paid_at || order.date),
  pickup_location: config.pickupLocation,
  ...(config.channelId ? { channel_id: config.channelId } : {}),
  comment: cleanString(order.customer_gstin)
   ? `GSTIN: ${cleanString(order.customer_gstin)}`
   : "Rein Oro website order",
  billing_customer_name: firstName,
  billing_last_name: lastName,
  billing_address: address.street,
  billing_address_2: address.apartment,
  billing_city: address.city,
  billing_pincode: address.pincode,
  billing_state: address.state,
  billing_country: address.country,
  billing_email: address.email,
  billing_phone: address.phone,
  shipping_is_billing: true,
  order_items: items.map((item, index) => ({
   name: cleanString(item.name || item.title, `Rein Oro Item ${index + 1}`),
   sku: makeSku(item, index),
   units: Math.max(1, toNumber(item.qty ?? item.quantity, 1)),
   selling_price: toMoney(item.price),
   discount: toMoney(item.discount),
   tax: toMoney(item.tax),
   hsn: cleanString(item.hsn || process.env.GST_DEFAULT_HSN),
  })),
  payment_method: isCod ? "COD" : "Prepaid",
  shipping_charges: toMoney(order.shipping),
  giftwrap_charges: 0,
  transaction_charges: 0,
  total_discount: toMoney(order.discount),
  sub_total: subtotal,
  length: getPackageDimension("SHIPROCKET_PACKAGE_LENGTH_CM", 10),
  breadth: getPackageDimension("SHIPROCKET_PACKAGE_BREADTH_CM", 10),
  height: getPackageDimension("SHIPROCKET_PACKAGE_HEIGHT_CM", 10),
  weight: getPackageWeight(order),
 };
}

function normalizeShiprocketShipment(data) {
 const source = data?.data && typeof data.data === "object" ? data.data : data;
 return {
  order_id: source.order_id || data?.order_id || null,
  shipment_id: source.shipment_id || data?.shipment_id || null,
  status: source.status || data?.status || null,
  status_code: source.status_code || data?.status_code || null,
  awb_code: source.awb_code || data?.awb_code || null,
  courier_company_id: source.courier_company_id || data?.courier_company_id || null,
  courier_name: source.courier_name || data?.courier_name || null,
  raw: data,
 };
}

export async function createShiprocketOrder(order) {
 const payload = buildShiprocketOrderPayload(order);
 const data = await shiprocketRequest("/orders/create/adhoc", {
  method: "POST",
  body: JSON.stringify(payload),
 });
 return normalizeShiprocketShipment(data);
}

export async function getShiprocketBillingServiceability(deliveryPostcode, items) {
 try {
  const config = assertConfigured();
  const weight = estimateOrderWeightKg(items);
  const path = `/courier/serviceability/?pickup_postcode=${config.pickupPostcode}&delivery_postcode=${deliveryPostcode}&weight=${weight}&cod=0`;

  const response = await shiprocketRequest(path, {
   method: "GET",
  });

  const couriers = response?.data?.available_courier_companies || [];
  if (!couriers.length) {
   return { serviceable: false };
  }

  // Find the cheapest courier
  let cheapestCourier = null;
  for (const courier of couriers) {
   const rate = toNumber(courier.rate || courier.freight_charge, -1);
   if (rate >= 0) {
    if (!cheapestCourier || rate < cheapestCourier.rate) {
     cheapestCourier = {
      rate,
      etd: courier.etd || "",
      courier_name: courier.courier_name || "",
     };
    }
   }
  }

  if (!cheapestCourier) {
   return { serviceable: false };
  }

  return {
   serviceable: true,
   rate: cheapestCourier.rate,
   etd: cheapestCourier.etd,
   courier_name: cheapestCourier.courier_name,
  };
 } catch (err) {
  console.error("getShiprocketBillingServiceability error:", err);
  return {
   serviceable: true,
   is_fallback: true,
   error: err.message || "Failed to query serviceability",
  };
 }
}

export async function assignShiprocketAwb(shipmentId) {
 const data = await shiprocketRequest("/courier/assign/awb", {
  method: "POST",
  body: JSON.stringify({ shipment_id: Number(shipmentId) }),
 });
 return {
  awb_code: data?.response?.data?.awb_code || data?.awb_code || null,
  courier_name: data?.response?.data?.courier_name || data?.courier_name || null,
  raw: data,
 };
}

export async function generateShiprocketLabel(shipmentId) {
 const data = await shiprocketRequest("/courier/generate/label", {
  method: "POST",
  body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
 });
 return {
  label_created: data?.label_created || 0,
  label_url: data?.label_url || null,
  raw: data,
 };
}
