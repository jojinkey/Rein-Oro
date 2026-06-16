import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestoreDb } from "../util/firestore.js";
import { FieldValue } from "firebase-admin/firestore";

const FIREBASE_API_KEY =
 process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

function getFirebaseConfig() {
 const projectId = process.env.FIREBASE_PROJECT_ID;
 const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
 const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

 return { projectId, clientEmail, privateKey };
}

async function ensureFirebaseApp() {
 const apps = getApps();
 if (apps.length > 0) {
  return;
 }

 const config = getFirebaseConfig();
 if (!config.projectId || !config.clientEmail || !config.privateKey) {
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
 await getFirestoreDb();
 return getAuth();
}

function normalizeCode(value) {
 return String(value || "")
  .trim()
  .toUpperCase();
}

function normalizeBoolean(value) {
 return value === true || value === "true" || value === 1 || value === "1";
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
 const emailValue = String(body.email || "")
  .trim()
  .toLowerCase();
 const defaultName = createDefaultNameFromEmail(emailValue);
 return {
  email: emailValue,
  password: String(body.password || ""),
  name: String(body.name || body.fullName || defaultName).trim() || defaultName,
  phone: String(body.phone || "").trim() || null,
  photoURL: body.photoURL ? String(body.photoURL).trim() : null,
  role: String(body.role || "user").trim() || "user",
  addresses: Array.isArray(body.addresses) ? body.addresses : [],
  wishlist: Array.isArray(body.wishlist) ? body.wishlist : [],
 };
}

function validateRegistrationPayload(payload) {
 const errors = [];
 if (!payload.email) errors.push("email is required");
 if (!payload.password || payload.password.length < 6)
  errors.push("password is required and must be at least 6 characters");
 return errors;
}

function getFormattedDate(date = new Date()) {
 const pad = (n) => String(n).padStart(2, "0");
 return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function sanitizeUserProfile(profile) {
 return {
  uid: profile.uid,
  name: profile.name || profile.displayName || "",
  email: profile.email || "",
  phone: profile.phone || null,
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

async function writeUserProfile(uid, payload) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  throw new Error("Firestore is not available");
 }

 const docRef = firestore.collection("users").doc(uid);
 const doc = await docRef.get();
 let member_since = payload.member_since;
 let createdAt = FieldValue.serverTimestamp();

 if (doc.exists) {
  const data = doc.data();
  if (data.member_since) {
   member_since = data.member_since;
  }
  if (data.createdAt) {
   createdAt = data.createdAt;
  }
 }

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
   addresses: payload.addresses,
   wishlist: payload.wishlist,
   totalOrders: 0,
   totalSpent: 0,
   role: payload.role || "user",
   createdAt,
   member_since,
   lastLoginAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
 );
}

async function getUserProfileByUid(uid) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  return null;
 }
 const doc = await firestore.collection("users").doc(uid).get();
 return doc.exists ? sanitizeUserProfile({ uid: doc.id, ...doc.data() }) : null;
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

export async function register(req, res) {
 const payload = normalizeRegistrationPayload(req.body);
 const errors = validateRegistrationPayload(payload);
 if (errors.length) {
  return res.status(400).json({ error: "Validation failed", details: errors });
 }

 try {
  const auth = await getAuthClient();
  const userRecord = await auth.createUser({
   email: payload.email,
   password: payload.password,
   displayName: payload.name,
   phoneNumber: payload.phone || undefined,
   photoURL: payload.photoURL || undefined,
  });

  await writeUserProfile(userRecord.uid, payload);

  res.status(201).json({
   success: true,
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
  res.status(400).json({ error: message });
 }
}

export async function login(req, res) {
 const email = String(req.body.email || "")
  .trim()
  .toLowerCase();
 const password = String(req.body.password || "");

 if (!email || !password) {
  return res.status(400).json({ error: "Email and password are required" });
 }
 if (!FIREBASE_API_KEY) {
  return res.status(500).json({ error: "Firebase API key is not configured" });
 }

 try {
  const response = await fetch(
   `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
   {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     email,
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

  let profile = await getUserProfileByUid(data.localId);
  if (!profile) {
   const authClient = await getAuthClient();
   const userRecord = await authClient.getUser(data.localId);
   const fallbackRole = String(
    userRecord.customClaims?.role ||
     (userRecord.customClaims?.admin ? "admin" : "user"),
   )
    .trim()
    .toLowerCase();
   const fallbackProfilePayload = {
    email: userRecord.email || email,
    name: userRecord.displayName || createDefaultNameFromEmail(email),
    phone: userRecord.phoneNumber || null,
    photoURL: userRecord.photoURL || null,
    role: fallbackRole,
    addresses: [],
    wishlist: [],
   };
   await writeUserProfile(data.localId, fallbackProfilePayload);
   profile = await getUserProfileByUid(data.localId);
  }

  if (!profile) {
   return res.status(404).json({ error: "User profile not found" });
  }

  await updateLastLogin(data.localId);
  res.json({
   success: true,
   token: data.idToken,
   refreshToken: data.refreshToken,
   expiresIn: data.expiresIn,
   user: profile,
  });
 } catch (err) {
  res
   .status(500)
   .json({ error: err?.message || "Server authentication error" });
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
