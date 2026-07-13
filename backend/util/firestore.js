import fs from "fs";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

let cachedDb = null;
let cachedFieldValue = null;

// Server-side in-memory cache for static/frequently-read collections
const memoryCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes TTL

function isCacheableCollection(collectionName) {
 return [
  "products",
  "categories",
  "cms_content",
  "cms_styles",
  "coupons",
  "reviews"
 ].includes(collectionName);
}

function clearCacheForCollection(collectionName) {
 for (const key of memoryCache.keys()) {
  if (key === collectionName || key.startsWith(`${collectionName}:`)) {
   memoryCache.delete(key);
  }
 }
}

function cleanPrivateKey(value) {
 return value ? value.replace(/\\n/g, "\n") : "";
}

function parseJsonCredential(value) {
 if (!value) return null;
 const raw = String(value).trim();
 if (!raw) return null;

 const candidates = [raw];
 try {
  candidates.push(Buffer.from(raw, "base64").toString("utf8"));
 } catch {
  // Ignore invalid base64 input and try the raw value only.
 }

 for (const candidate of candidates) {
  try {
   const parsed = JSON.parse(candidate);
   if (parsed && typeof parsed === "object") {
    return parsed;
   }
  } catch {
   // Continue trying other candidate formats.
  }
 }

 return null;
}

function readJsonCredentialFile(filePath) {
 const cleanPath = String(filePath || "").trim();
 if (!cleanPath) return null;
 try {
  return parseJsonCredential(fs.readFileSync(cleanPath, "utf8"));
 } catch {
  return null;
 }
}

export function getFirebaseAdminConfig() {
 const inlineCredential = parseJsonCredential(
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.VITE_FIREBASE_SERVICE_ACCOUNT_JSON,
 );
 const fileCredential =
  readJsonCredentialFile(process.env.FIREBASE_SERVICE_ACCOUNT_PATH) ||
  readJsonCredentialFile(process.env.VITE_FIREBASE_SERVICE_ACCOUNT_PATH) ||
  readJsonCredentialFile(process.env.GOOGLE_APPLICATION_CREDENTIALS);

 const credential = inlineCredential || fileCredential;
 const projectId =
  process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || credential?.project_id || "";
 const clientEmail =
  process.env.FIREBASE_CLIENT_EMAIL || process.env.VITE_FIREBASE_CLIENT_EMAIL || credential?.client_email || "";
 const privateKey = cleanPrivateKey(
  process.env.FIREBASE_PRIVATE_KEY || process.env.VITE_FIREBASE_PRIVATE_KEY || credential?.private_key || "",
 );

 return {
  projectId,
  clientEmail,
  privateKey,
  configured: Boolean(projectId && clientEmail && privateKey),
  source: inlineCredential
   ? "FIREBASE_SERVICE_ACCOUNT_JSON"
   : fileCredential
     ? (process.env.FIREBASE_SERVICE_ACCOUNT_PATH ? "FIREBASE_SERVICE_ACCOUNT_PATH" : "VITE_FIREBASE_SERVICE_ACCOUNT_PATH")
     : "split_env",
 };
}

export function getFirestoreStatus() {
 const config = getFirebaseAdminConfig();
 const configured = config.configured;

 const firestoreEnabledEnv =
  typeof process.env.FIRESTORE_ENABLED === "string"
   ? process.env.FIRESTORE_ENABLED.trim().toLowerCase()
   : "";
 const enabled =
  firestoreEnabledEnv === "true" || (firestoreEnabledEnv === "" && configured);

 return {
  enabled,
  configured,
  ready: Boolean(cachedDb),
  projectId: config.projectId || null,
  credentialSource: configured ? config.source : null,
  missing: configured
   ? []
   : [
      !config.projectId ? "FIREBASE_PROJECT_ID" : null,
      !config.clientEmail ? "FIREBASE_CLIENT_EMAIL" : null,
      !config.privateKey ? "FIREBASE_PRIVATE_KEY" : null,
     ].filter(Boolean),
  mode: "firestore",
  message: enabled
   ? configured
     ? "Firestore sync is configured."
     : "Firestore is enabled but credentials are missing."
   : "Firestore sync is off.",
 };
}

export async function getFirestoreDb() {
 const status = getFirestoreStatus();

 if (!status.enabled || !status.configured) {
  throw new Error("Firestore is not enabled or not configured.");
 }

 if (cachedDb) {
  return cachedDb;
 }

 try {
  if (getApps().length === 0) {
   initializeApp({
    credential: cert({
     projectId: status.projectId || getFirebaseAdminConfig().projectId,
     clientEmail: getFirebaseAdminConfig().clientEmail,
     privateKey: getFirebaseAdminConfig().privateKey,
    }),
   });
  }

  cachedDb = getFirestore();
  cachedFieldValue = FieldValue;
  return cachedDb;
 } catch (err) {
  console.error("Firestore initialization error:", err);
  throw err;
 }
}

export async function mirrorToFirestore(collectionName, documentId, data) {
 try {
  const firestore = await getFirestoreDb();
  const cleanData = JSON.parse(JSON.stringify(data ?? {}));
  
  await firestore
   .collection(collectionName)
   .doc(String(documentId))
   .set(
    {
     ...cleanData,
     firestore_updated_at: cachedFieldValue.serverTimestamp(),
    },
    { merge: true },
   );

  if (isCacheableCollection(collectionName)) {
   clearCacheForCollection(collectionName);
  }
  return { synced: true };
 } catch (err) {
  console.error(`Error mirroring to Firestore (${collectionName}):`, err);
  throw err;
 }
}

export async function deleteFromFirestore(collectionName, documentId) {
 try {
  const firestore = await getFirestoreDb();
  await firestore.collection(collectionName).doc(String(documentId)).delete();
  
  if (isCacheableCollection(collectionName)) {
   clearCacheForCollection(collectionName);
  }
  return { deleted: true };
 } catch (err) {
  console.error(`Error deleting from Firestore (${collectionName}):`, err);
  throw err;
 }
}

export async function getFirestoreDocument(collectionName, documentId) {
 if (isCacheableCollection(collectionName)) {
  const cacheKey = `${collectionName}:doc:${documentId}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
   return JSON.parse(JSON.stringify(cached.data));
  }
 }

 try {
  const firestore = await getFirestoreDb();
  const doc = await firestore
   .collection(collectionName)
   .doc(String(documentId))
   .get();
  const res = doc.exists ? { id: doc.id, ...doc.data() } : null;

  if (res && isCacheableCollection(collectionName)) {
   const cacheKey = `${collectionName}:doc:${documentId}`;
   memoryCache.set(cacheKey, { data: res, timestamp: Date.now() });
  }
  return res;
 } catch (err) {
  console.error(`Error getting document from Firestore (${collectionName}/${documentId}):`, err);
  throw err;
 }
}

export async function queryFirestoreCollection(collectionName, options = {}) {
 if (isCacheableCollection(collectionName)) {
  const cacheKey = `${collectionName}:${JSON.stringify(options)}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
   return JSON.parse(JSON.stringify(cached.data));
  }
 }

 try {
  const firestore = await getFirestoreDb();
  let ref = firestore.collection(collectionName);
  const where = Array.isArray(options.where) ? options.where : [];
  const orderBy = Array.isArray(options.orderBy) ? options.orderBy : [];
  const limit = options.limit;

  for (const clause of where) {
   if (Array.isArray(clause) && clause.length === 3) {
    ref = ref.where(clause[0], clause[1], clause[2]);
   }
  }

  for (const clause of orderBy) {
   if (Array.isArray(clause) && clause.length === 2) {
    ref = ref.orderBy(clause[0], clause[1]);
   }
  }

  if (limit && Number.isFinite(limit)) {
   ref = ref.limit(limit);
  }

  const snapshot = await ref.get();
  const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (isCacheableCollection(collectionName)) {
   const cacheKey = `${collectionName}:${JSON.stringify(options)}`;
   memoryCache.set(cacheKey, { data: results, timestamp: Date.now() });
  }

  return results;
 } catch (err) {
  console.error(`Error querying Firestore collection (${collectionName}):`, err);
  throw err;
 }
}

export async function syncCollectionsToFirestore(snapshot) {
 try {
  const firestore = await getFirestoreDb();
  const counts = {};
  
  for (const [collectionName, rows] of Object.entries(snapshot)) {
   if (isCacheableCollection(collectionName)) {
    clearCacheForCollection(collectionName);
   }
   counts[collectionName] = 0;
   for (const row of rows) {
    const id = row.id || row.code || row.email || row.local_order_id;
    if (!id) continue;
    await firestore
     .collection(collectionName)
     .doc(String(id))
     .set(
      {
       ...JSON.parse(JSON.stringify(row)),
       firestore_updated_at: cachedFieldValue.serverTimestamp(),
      },
      { merge: true },
     );
    counts[collectionName] += 1;
   }
  }

  return { synced: true, counts };
 } catch (err) {
  console.error("Error syncing collections to Firestore:", err);
  throw err;
 }
}
