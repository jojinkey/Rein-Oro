import crypto from "crypto";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdminConfig, getFirestoreDb } from "../util/firestore.js";
import { FieldValue } from "firebase-admin/firestore";

const FIREBASE_API_KEY =
 process.env.FIREBASE_API_KEY ||
 process.env.VITE_FIREBASE_API_KEY ||
 process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
 "";

const OTP_COLLECTION = "auth_login_otps";
const OTP_LENGTH = 6;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const DEFAULT_OTP_TTL_MINUTES = 10;

async function ensureFirebaseApp() {
 const apps = getApps();
 if (apps.length > 0) {
  return;
 }

 const config = getFirebaseAdminConfig();
 if (!config.configured) {
  throw new Error("Firebase admin credentials are not configured.");
 }

 initializeApp({
  credential: cert({
   projectId: config.projectId,
   clientEmail: config.clientEmail,
   privateKey: config.privateKey,
  }),
 });
}

async function getAuthClient() {
 await ensureFirebaseApp();
 return getAuth();
}

function getOtpTtlMs() {
 const configuredMinutes = Number(process.env.OTP_TTL_MINUTES);
 const minutes =
  Number.isFinite(configuredMinutes) && configuredMinutes > 0
   ? configuredMinutes
   : DEFAULT_OTP_TTL_MINUTES;
 return minutes * 60 * 1000;
}

function getOtpHashSecret() {
 return (
  process.env.OTP_SECRET ||
  process.env.FIREBASE_PRIVATE_KEY ||
  process.env.FIREBASE_CLIENT_EMAIL ||
  "rein-oro-local-otp-secret"
 );
}

function normalizeEmail(value) {
 return String(value || "")
  .trim()
  .toLowerCase();
}

function normalizePhoneNumber(value) {
 const raw = String(value || "").trim();
 if (!raw) return "";

 const digits = raw.replace(/\D/g, "");
 if (raw.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
  return `+${digits}`;
 }
 if (digits.length === 10) {
  return `+91${digits}`;
 }
 if (digits.length === 11 && digits.startsWith("0")) {
  return `+91${digits.slice(1)}`;
 }
 if (digits.length === 12 && digits.startsWith("91")) {
  return `+${digits}`;
 }
 if (digits.length >= 11 && digits.length <= 15) {
  return `+${digits}`;
 }
 return "";
}

function looksLikeEmail(value) {
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function looksLikePhoneIdentifier(value) {
 const text = String(value || "").trim();
 return Boolean(text && !text.includes("@") && /\d/.test(text));
}

function createHttpError(message, statusCode = 400) {
 const err = new Error(message);
 err.statusCode = statusCode;
 return err;
}

function createDefaultNameFromEmail(email) {
 const candidate =
  String(email || "")
   .trim()
   .split("@")[0] || "user";
 return candidate
  .replace(/[._\-+]+/g, " ")
  .replace(/\b\w/g, (ch) => ch.toUpperCase())
  .trim();
}

function normalizeRegistrationPayload(body) {
 const emailValue = normalizeEmail(body.email);
 const defaultName = createDefaultNameFromEmail(emailValue);
 const requestedRole = String(body.role || "user")
  .trim()
  .toLowerCase();
 return {
  email: emailValue,
  password: String(body.password || ""),
  name: String(body.name || body.fullName || defaultName).trim() || defaultName,
  phone: normalizePhoneNumber(body.phone || body.mobile || body.mobileNumber),
  photoURL: body.photoURL ? String(body.photoURL).trim() : null,
  role:
   process.env.ALLOW_PUBLIC_ROLE_REGISTRATION === "true"
    ? requestedRole
    : "user",
  addresses: Array.isArray(body.addresses) ? body.addresses : [],
  wishlist: Array.isArray(body.wishlist) ? body.wishlist : [],
 };
}

function validateRegistrationPayload(payload) {
 const errors = [];
 if (!payload.email || !looksLikeEmail(payload.email)) {
  errors.push("a valid email is required");
 }
 if (!payload.password || payload.password.length < 6) {
  errors.push("password is required and must be at least 6 characters");
 }
 return errors;
}

function getFormattedDate(date = new Date()) {
 const pad = (n) => String(n).padStart(2, "0");
 return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getPhoneLookupKey(phone) {
 return normalizePhoneNumber(phone).replace(/\D/g, "");
}

function sanitizeUserProfile(profile) {
 return {
  uid: profile.uid,
  name: profile.name || profile.displayName || "",
  email: profile.email || "",
  phone: profile.phone || profile.phoneNumber || null,
  photoURL: profile.photoURL || null,
  addresses: Array.isArray(profile.addresses) ? profile.addresses : [],
  wishlist: Array.isArray(profile.wishlist) ? profile.wishlist : [],
  totalOrders: Number.isFinite(Number(profile.totalOrders))
   ? Number(profile.totalOrders)
   : 0,
  totalSpent: Number.isFinite(Number(profile.totalSpent))
   ? Number(profile.totalSpent)
   : 0,
  role: String(profile.role || "user")
   .trim()
   .toLowerCase(),
  createdAt: profile.createdAt || null,
  member_since: profile.member_since || null,
  lastLoginAt: profile.lastLoginAt || null,
 };
}

async function getPhoneLoginRecord(phone) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  return null;
 }

 const phoneKey = getPhoneLookupKey(phone);
 const normalizedPhone = normalizePhoneNumber(phone);
 if (!phoneKey) {
  return null;
 }

 const doc = await firestore.collection("phone_login").doc(phoneKey).get();
 if (doc.exists) {
  return { id: doc.id, ...doc.data() };
 }

 const profileSnapshot = await firestore
  .collection("users")
  .where("phone", "==", normalizedPhone)
  .limit(1)
  .get();
 if (profileSnapshot.empty) {
  return null;
 }

 const profileDoc = profileSnapshot.docs[0];
 const profile = profileDoc.data();
 const record = {
  id: phoneKey,
  uid: profile.uid || profileDoc.id,
  email: normalizeEmail(profile.email),
  phone: normalizedPhone,
 };

 if (record.uid && record.email) {
  await firestore.collection("phone_login").doc(phoneKey).set(
   {
    uid: record.uid,
    email: record.email,
    phone: normalizedPhone,
    updatedAt: FieldValue.serverTimestamp(),
   },
   { merge: true },
  );
 }

 return record;
}

async function writeUserProfile(uid, payload) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  throw new Error("Firestore is not available");
 }

 const docRef = firestore.collection("users").doc(uid);
 const doc = await docRef.get();
 const existing = doc.exists ? doc.data() : {};
 let member_since = payload.member_since || existing.member_since;
 let createdAt = existing.createdAt || FieldValue.serverTimestamp();

 if (!member_since) {
  member_since = getFormattedDate();
 }

 await docRef.set(
  {
   uid,
   name: payload.name,
   email: payload.email,
   phone: payload.phone,
   photoURL: payload.photoURL || null,
   addresses: Array.isArray(payload.addresses)
    ? payload.addresses
    : existing.addresses || [],
   wishlist: Array.isArray(payload.wishlist)
    ? payload.wishlist
    : existing.wishlist || [],
   totalOrders: Number.isFinite(Number(existing.totalOrders))
    ? Number(existing.totalOrders)
    : 0,
   totalSpent: Number.isFinite(Number(existing.totalSpent))
    ? Number(existing.totalSpent)
    : 0,
   role: payload.role || existing.role || "user",
   createdAt,
   member_since,
   lastLoginAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
 );

 const phoneKey = getPhoneLookupKey(payload.phone);
 const email = normalizeEmail(payload.email || existing.email);
 if (phoneKey && email) {
  await firestore.collection("phone_login").doc(phoneKey).set(
   {
    uid,
    email,
    phone: normalizePhoneNumber(payload.phone),
    updatedAt: FieldValue.serverTimestamp(),
   },
   { merge: true },
  );
 }
}

async function getUserProfileByUid(uid) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  return null;
 }
 const doc = await firestore.collection("users").doc(uid).get();
 return doc.exists ? sanitizeUserProfile({ uid: doc.id, ...doc.data() }) : null;
}

async function ensureUserProfileFromRecord(userRecord, fallbackEmail = "") {
 let profile = await getUserProfileByUid(userRecord.uid);
 if (profile) {
  return profile;
 }

 const fallbackRole = String(
  userRecord.customClaims?.role ||
   (userRecord.customClaims?.admin ? "admin" : "user"),
 )
  .trim()
  .toLowerCase();
 const email = normalizeEmail(userRecord.email || fallbackEmail);
 const fallbackProfilePayload = {
  email,
  name: userRecord.displayName || createDefaultNameFromEmail(email),
  phone: userRecord.phoneNumber || null,
  photoURL: userRecord.photoURL || null,
  role: fallbackRole,
  addresses: [],
  wishlist: [],
 };
 await writeUserProfile(userRecord.uid, fallbackProfilePayload);
 return getUserProfileByUid(userRecord.uid);
}

async function updateLastLogin(uid) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  return;
 }
 await firestore
  .collection("users")
  .doc(uid)
  .set({ lastLoginAt: FieldValue.serverTimestamp() }, { merge: true });
}

async function resolvePasswordLoginIdentifier(identifier) {
 const value = String(identifier || "").trim();
 if (!value) {
  throw createHttpError("Email or mobile number is required", 400);
 }

 if (looksLikeEmail(value)) {
  return { email: normalizeEmail(value), phone: null };
 }

 if (!looksLikePhoneIdentifier(value)) {
  throw createHttpError("Enter a valid email or mobile number", 400);
 }

 const phone = normalizePhoneNumber(value);
 if (!phone) {
  throw createHttpError("Enter a valid mobile number", 400);
 }

 const auth = await getAuthClient();
 try {
  const userRecord = await auth.getUserByPhoneNumber(phone);
  if (!userRecord.email) {
   throw createHttpError(
    "This mobile number is not linked with an email/password account",
    400,
   );
  }
  return { email: normalizeEmail(userRecord.email), phone };
 } catch (err) {
  if (err.statusCode) throw err;
  const phoneLogin = await getPhoneLoginRecord(phone);
  const email = normalizeEmail(phoneLogin?.email);
  if (email) {
   return { email, phone };
  }
  throw createHttpError("Invalid mobile number or password", 401);
 }
}

async function resolveUserRecordByPhone(phone) {
 const auth = await getAuthClient();
 try {
  return await auth.getUserByPhoneNumber(phone);
 } catch {
  const phoneLogin = await getPhoneLoginRecord(phone);
  const uid = String(phoneLogin?.uid || "").trim();
  const email = normalizeEmail(phoneLogin?.email);

  if (uid) {
   try {
    return await auth.getUser(uid);
   } catch {
    // Try email below for accounts created before the Auth phone field existed.
   }
  }

  if (email) {
   try {
    return await auth.getUserByEmail(email);
   } catch {
    return null;
   }
  }

  return null;
 }
}

async function exchangeCustomTokenForIdToken(uid) {
 if (!FIREBASE_API_KEY) {
  throw createHttpError("Firebase API key is not configured", 500);
 }

 const auth = await getAuthClient();
 const customToken = await auth.createCustomToken(uid);
 const response = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
  {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({
    token: customToken,
    returnSecureToken: true,
   }),
  },
 );
 const data = await response.json();
 if (!response.ok) {
  throw createHttpError(
   data.error?.message || "Unable to create login session",
   401,
  );
 }
 return data;
}

function hashOtp(phone, otp) {
 return crypto
  .createHmac("sha256", getOtpHashSecret())
  .update(`${phone}:${otp}`)
  .digest("hex");
}

function getOtpDocumentId(phone) {
 return crypto.createHash("sha256").update(phone).digest("hex");
}

function timingSafeStringEqual(a, b) {
 const aBuffer = Buffer.from(String(a || ""));
 const bBuffer = Buffer.from(String(b || ""));
 return (
  aBuffer.length === bBuffer.length &&
  crypto.timingSafeEqual(aBuffer, bBuffer)
 );
}

async function getOtpDocRef(phone) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  throw createHttpError("OTP service is not configured", 503);
 }
 return firestore.collection(OTP_COLLECTION).doc(getOtpDocumentId(phone));
}

function generateOtp() {
 const min = 10 ** (OTP_LENGTH - 1);
 const max = 10 ** OTP_LENGTH;
 return String(crypto.randomInt(min, max));
}

function replaceTemplate(value, variables, encodeValues = false) {
 return String(value || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
  if (!Object.prototype.hasOwnProperty.call(variables, key)) {
   return match;
  }
  const replacement = String(variables[key] ?? "");
  return encodeValues ? encodeURIComponent(replacement) : replacement;
 });
}

function parseJsonObjectEnv(name) {
 const raw = String(process.env[name] || "").trim();
 if (!raw) return {};

 try {
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
   throw new Error("not an object");
  }
  return parsed;
 } catch {
  throw createHttpError(`${name} must be a valid JSON object`, 500);
 }
}

function buildSmsWebhookHeaders() {
 const headers = {
  "User-Agent": "Rein-Oro-OTP",
  ...parseJsonObjectEnv("OTP_SMS_WEBHOOK_HEADERS_JSON"),
 };

 const token = String(process.env.OTP_SMS_WEBHOOK_TOKEN || "").trim();
 if (token) {
  const headerName =
   String(process.env.OTP_SMS_WEBHOOK_AUTH_HEADER || "").trim() ||
   "Authorization";
  const scheme =
   process.env.OTP_SMS_WEBHOOK_AUTH_SCHEME === undefined
    ? "Bearer"
    : String(process.env.OTP_SMS_WEBHOOK_AUTH_SCHEME || "").trim();
  headers[headerName] = scheme ? `${scheme} ${token}` : token;
 }

 return headers;
}

function buildSmsWebhookBody(variables) {
 const template = String(
  process.env.OTP_SMS_WEBHOOK_BODY_TEMPLATE ||
   process.env.SMS_WEBHOOK_BODY_TEMPLATE ||
   "",
 ).trim();

 if (!template) {
  return {
   to: variables.phone,
   mobile: variables.phone,
   phone: variables.phone,
   otp: variables.otp,
   message: variables.message,
   purpose: variables.purpose,
  };
 }

 const rendered = replaceTemplate(template, variables);
 const trimmed = rendered.trim();
 if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
  try {
   return JSON.parse(rendered);
  } catch {
   throw createHttpError(
    "OTP_SMS_WEBHOOK_BODY_TEMPLATE must render valid JSON",
    500,
   );
  }
 }

 return rendered;
}

async function deliverOtp(phone, otp) {
 const webhookUrl =
  process.env.OTP_SMS_WEBHOOK_URL || process.env.SMS_WEBHOOK_URL || "";
 const debugDelivery = process.env.OTP_DEBUG_DELIVERY === "true";

 if (debugDelivery) {
  return { status: "debug", devOtp: otp };
 }

 if (!webhookUrl) {
  return { status: "not_configured" };
 }

 const ttlMinutes = Math.round(getOtpTtlMs() / 60000);
 const message = `Your Rein Oro login OTP is ${otp}. It expires in ${ttlMinutes} minutes.`;
 const variables = {
  phone,
  phoneDigits: phone.replace(/\D/g, ""),
  otp,
  message,
  purpose: "login",
  ttlMinutes,
 };
 const method = String(process.env.OTP_SMS_WEBHOOK_METHOD || "POST")
  .trim()
  .toUpperCase();
 const url = replaceTemplate(webhookUrl, variables, true);
 const headers = buildSmsWebhookHeaders();
 const requestOptions = { method, headers };

 if (method !== "GET" && method !== "HEAD") {
  const body = buildSmsWebhookBody(variables);
  if (
   !Object.keys(headers).some(
    (key) => key.toLowerCase() === "content-type",
   )
  ) {
   headers["Content-Type"] =
    typeof body === "string" ? "text/plain" : "application/json";
  }
  requestOptions.body = typeof body === "string" ? body : JSON.stringify(body);
 }

 const response = await fetch(url, requestOptions);

 if (!response.ok) {
  const text = await response.text().catch(() => "");
  throw createHttpError(
   text || "OTP SMS provider rejected the request",
   response.status || 502,
  );
 }

 return { status: "sent" };
}

export async function register(req, res) {
 const payload = normalizeRegistrationPayload(req.body);
 const errors = validateRegistrationPayload(payload);
 if (errors.length) {
  return res.status(400).json({ error: "Validation failed", details: errors });
 }

 try {
  const auth = await getAuthClient();
  const createPayload = {
   email: payload.email,
   password: payload.password,
   displayName: payload.name,
   photoURL: payload.photoURL || undefined,
  };
  if (payload.phone) {
   createPayload.phoneNumber = payload.phone;
  }
  const userRecord = await auth.createUser(createPayload);

  await writeUserProfile(userRecord.uid, payload);
  const customToken = await auth.createCustomToken(userRecord.uid);

  const tokenData = await exchangeCustomTokenForIdToken(userRecord.uid);
  const profile = await getUserProfileByUid(userRecord.uid);

  res.status(201).json({
   success: true,
   customToken,
   user: {
    uid: userRecord.uid,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    photoURL: payload.photoURL || null,
    role: payload.role || "user",
   },
  });
 } catch (err) {
  const message = err?.message || "Unable to register user";
  res.status(err.statusCode || 400).json({ error: message });
 }
}

export async function login(req, res) {
 const identifier =
  req.body.identifier || req.body.login || req.body.email || req.body.phone || "";
 const password = String(req.body.password || "");

 if (!identifier || !password) {
  return res
   .status(400)
   .json({ error: "Email/mobile number and password are required" });
 }
 if (!FIREBASE_API_KEY) {
  return res.status(500).json({ error: "Firebase API key is not configured" });
 }

 try {
  const resolved = await resolvePasswordLoginIdentifier(identifier);
  const response = await fetch(
   `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
   {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     email: resolved.email,
     password,
     returnSecureToken: true,
    }),
   },
  );

  const data = await response.json();
  if (!response.ok) {
   const errorMessage = data.error?.message || "Authentication failed";
   return res.status(401).json({ error: errorMessage });
  }

  const authClient = await getAuthClient();
  const userRecord = await authClient.getUser(data.localId);
  const profile = await ensureUserProfileFromRecord(userRecord, resolved.email);

  if (!profile) {
   return res.status(404).json({ error: "User profile not found" });
  }

  const authClient = await getAuthClient();
  const customToken = await authClient.createCustomToken(data.localId);

  await updateLastLogin(data.localId);
  res.json({
   success: true,
   token: data.idToken,
   customToken,
   refreshToken: data.refreshToken,
   expiresIn: data.expiresIn,
   user: profile,
  });
 } catch (err) {
  res
   .status(err.statusCode || 500)
   .json({ error: err?.message || "Server authentication error" });
 }
}

export async function requestLoginOtp(req, res) {
 const phone = normalizePhoneNumber(
  req.body.phone || req.body.mobile || req.body.identifier,
 );
 if (!phone) {
  return res.status(400).json({ error: "A valid mobile number is required" });
 }

 try {
  const userRecord = await resolveUserRecordByPhone(phone);
  if (!userRecord) {
   return res.json({
    success: true,
    message: "If this mobile number is registered, an OTP will be sent.",
   });
  }

  const docRef = await getOtpDocRef(phone);
  const existing = await docRef.get();
  if (existing.exists) {
   const data = existing.data();
   const createdAt = Date.parse(data.createdAt || "");
   const expiresAt = Date.parse(data.expiresAt || "");
   if (
    !data.consumed &&
    Number.isFinite(createdAt) &&
    Number.isFinite(expiresAt) &&
    expiresAt > Date.now() &&
    Date.now() - createdAt < OTP_RESEND_COOLDOWN_MS
   ) {
    return res.status(429).json({
     error: "OTP already sent. Please wait before requesting another code.",
    });
   }
  }

  const otp = generateOtp();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + getOtpTtlMs());
  const delivery = await deliverOtp(phone, otp);

  if (delivery.status === "not_configured") {
   return res.status(503).json({
    error: "OTP SMS delivery is not configured. Please use password login.",
   });
  }

  await docRef.set({
   uid: userRecord.uid,
   phone,
   otpHash: hashOtp(phone, otp),
   attempts: 0,
   consumed: false,
   createdAt: now.toISOString(),
   expiresAt: expiresAt.toISOString(),
   lastSentAt: now.toISOString(),
   purpose: "login",
  });

  res.json({
   success: true,
   message: "OTP sent successfully.",
   delivery: delivery.status,
   ...(delivery.devOtp ? { devOtp: delivery.devOtp } : {}),
  });
 } catch (err) {
  res
   .status(err.statusCode || 500)
   .json({ error: err?.message || "Unable to send OTP" });
 }
}

export async function verifyLoginOtp(req, res) {
 const phone = normalizePhoneNumber(
  req.body.phone || req.body.mobile || req.body.identifier,
 );
 const otp = String(req.body.otp || req.body.code || "").trim();

 if (!phone) {
  return res.status(400).json({ error: "A valid mobile number is required" });
 }
 if (!/^\d{6}$/.test(otp)) {
  return res.status(400).json({ error: "Enter a valid 6-digit OTP" });
 }

 try {
  const docRef = await getOtpDocRef(phone);
  const doc = await docRef.get();
  if (!doc.exists) {
   return res.status(401).json({ error: "OTP is invalid or expired" });
  }

  const data = doc.data();
  if (data.consumed || Date.parse(data.expiresAt || "") <= Date.now()) {
   return res.status(401).json({ error: "OTP is invalid or expired" });
  }
  if (Number(data.attempts || 0) >= OTP_MAX_ATTEMPTS) {
   return res.status(429).json({
    error: "Too many incorrect OTP attempts. Please request a new OTP.",
   });
  }

  const valid = timingSafeStringEqual(data.otpHash, hashOtp(phone, otp));
  if (!valid) {
   await docRef.set(
    {
     attempts: FieldValue.increment(1),
     lastFailedAt: new Date().toISOString(),
    },
    { merge: true },
   );
   return res.status(401).json({ error: "OTP is invalid or expired" });
  }

  await docRef.set(
   {
    consumed: true,
    consumedAt: new Date().toISOString(),
   },
   { merge: true },
  );

  const auth = await getAuthClient();
  const otpUid = String(data.uid || "").trim();
  const userRecord = otpUid
   ? await auth.getUser(otpUid)
   : await resolveUserRecordByPhone(phone);
  if (!userRecord) {
   return res.status(404).json({ error: "User profile not found" });
  }
  const profile = await ensureUserProfileFromRecord(
   userRecord,
   userRecord.email,
  );
  if (!profile) {
   return res.status(404).json({ error: "User profile not found" });
  }

  const tokenData = await exchangeCustomTokenForIdToken(userRecord.uid);
  await updateLastLogin(userRecord.uid);

  res.json({
   success: true,
   token: tokenData.idToken,
   refreshToken: tokenData.refreshToken,
   expiresIn: tokenData.expiresIn,
   user: profile,
  });
 } catch (err) {
  res
   .status(err.statusCode || 500)
   .json({ error: err?.message || "OTP verification failed" });
 }
}

export async function forgotPassword(req, res) {
 const identifier =
  req.body.identifier || req.body.email || req.body.phone || req.body.mobile || "";
 const value = String(identifier || "").trim();
 if (!value) {
  return res.status(400).json({ error: "Email or mobile number is required" });
 }
 if (!FIREBASE_API_KEY) {
  return res.status(500).json({ error: "Firebase API key is not configured" });
 }

 try {
  let email = "";
  if (looksLikeEmail(value)) {
   email = normalizeEmail(value);
  } else {
   const phone = normalizePhoneNumber(value);
   if (phone) {
    try {
     const auth = await getAuthClient();
     const userRecord = await auth.getUserByPhoneNumber(phone);
     email = normalizeEmail(userRecord.email || "");
    } catch {
     email = "";
    }
   }
  }

  if (email) {
   const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
    {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
      requestType: "PASSWORD_RESET",
      email,
     }),
    },
   );
   const data = await response.json();
   if (!response.ok && data.error?.message !== "EMAIL_NOT_FOUND") {
    throw createHttpError(
     data.error?.message || "Unable to send password reset email",
     400,
    );
   }
  }

  res.json({
   success: true,
   message:
    "If an account exists for this email or mobile number, a password reset email has been sent.",
  });
 } catch (err) {
  res
   .status(err.statusCode || 500)
   .json({ error: err?.message || "Unable to process password reset" });
 }
}

export async function createSessionFromFirebaseToken(req, res) {
 const idToken = String(req.body.idToken || "").trim();
 if (!idToken) {
  return res.status(400).json({ error: "Firebase ID token is required" });
 }

 try {
  const auth = await getAuthClient();
  const decoded = await auth.verifyIdToken(idToken);
  const userRecord = await auth.getUser(decoded.uid);

  let profile = await getUserProfileByUid(decoded.uid);
  if (!profile) {
   if (!userRecord.email) {
    return res.status(403).json({
     error:
      "This mobile number is not registered. Please sign up with email and mobile first.",
    });
   }
   profile = await ensureUserProfileFromRecord(userRecord, userRecord.email);
  }

  if (!profile) {
   return res.status(404).json({ error: "User profile not found" });
  }

  await updateLastLogin(decoded.uid);
  res.json({
   success: true,
   token: idToken,
   user: profile,
  });
 } catch (err) {
  res
   .status(401)
   .json({ error: err?.message || "Firebase session verification failed" });
 }
}

export async function protect(req, res, next) {
 const authHeader = String(req.headers.authorization || "");
 const token = authHeader.startsWith("Bearer ")
  ? authHeader.slice(7)
  : authHeader;

 if (!token) {
  return res.status(401).json({ error: "Authentication token is required" });
 }

 try {
  const auth = await getAuthClient();
  const decoded = await auth.verifyIdToken(token);
  const profile = await getUserProfileByUid(decoded.uid);
  if (!profile) {
   return res.status(401).json({ error: "User profile not found" });
  }
  req.user = profile;
  req.auth = decoded;
  next();
 } catch (err) {
  res.status(401).json({ error: "Invalid or expired authentication token" });
 }
}

export async function getProfile(req, res) {
 try {
  const authClient = await getAuthClient();
  const customToken = await authClient.createCustomToken(req.user.uid);
  res.json({
   ...req.user,
   customToken,
  });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export function restrict2(...allowedRoles) {
 return (req, res, next) => {
  if (!req.user) {
   return res.status(401).json({ error: "Authentication required" });
  }
  if (!allowedRoles.includes(req.user.role)) {
   return res
    .status(403)
    .json({ error: "You do not have permission to access this resource" });
  }
  next();
 };
}

export async function syncUserProfile(req, res) {
 try {
  const auth = await getAuthClient();
  const userRecord = await auth.getUser(req.user.uid);
  const updatedProfilePayload = {
   email: userRecord.email,
   name: userRecord.displayName || req.user.name,
   phone: userRecord.phoneNumber || req.user.phone || null,
  };
  await writeUserProfile(req.user.uid, {
   ...req.user,
   ...updatedProfilePayload
  });
  res.json({ success: true, user: { ...req.user, ...updatedProfilePayload } });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}


