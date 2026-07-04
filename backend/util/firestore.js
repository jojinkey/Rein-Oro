import fs from "fs";

let cachedDb = null;
let cachedFieldValue = null;
let cachedStatus = null;

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
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
 );
 const fileCredential =
  readJsonCredentialFile(process.env.FIREBASE_SERVICE_ACCOUNT_PATH) ||
  readJsonCredentialFile(process.env.GOOGLE_APPLICATION_CREDENTIALS);

 const credential = inlineCredential || fileCredential;
 const projectId =
  process.env.FIREBASE_PROJECT_ID || credential?.project_id || "";
 const clientEmail =
  process.env.FIREBASE_CLIENT_EMAIL || credential?.client_email || "";
 const privateKey = cleanPrivateKey(
  process.env.FIREBASE_PRIVATE_KEY || credential?.private_key || "",
 );

 return {
  projectId,
  clientEmail,
  privateKey,
  configured: Boolean(projectId && clientEmail && privateKey),
  source: inlineCredential
   ? "FIREBASE_SERVICE_ACCOUNT_JSON"
   : fileCredential
     ? process.env.FIREBASE_SERVICE_ACCOUNT_PATH
       ? "FIREBASE_SERVICE_ACCOUNT_PATH"
       : "GOOGLE_APPLICATION_CREDENTIALS"
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
  mode: enabled && configured ? "firestore" : "sqlite-local",
  message: enabled
   ? configured
     ? "Firestore sync is configured."
     : "Firestore is enabled but credentials are missing."
   : configured
     ? "Firestore credentials are available but FIRESTORE_ENABLED is disabled."
     : "Firestore sync is off. SQLite is the active local database.",
 };
}

export async function getFirestoreDb() {
 const status = getFirestoreStatus();
 cachedStatus = status;

 if (!status.enabled || !status.configured) {
  return null;
 }

 if (cachedDb) {
  return cachedDb;
 }

 const { initializeApp, cert, getApps } = await import("firebase-admin/app");
 const { getFirestore, FieldValue } = await import("firebase-admin/firestore");
 const config = getFirebaseAdminConfig();

 if (getApps().length === 0) {
  initializeApp({
   credential: cert({
    projectId: config.projectId,
    clientEmail: config.clientEmail,
    privateKey: config.privateKey,
   }),
  });
 }

 cachedDb = getFirestore();
 cachedFieldValue = FieldValue;
 return cachedDb;
}

export async function mirrorToFirestore(collectionName, documentId, data) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  return { skipped: true, status: cachedStatus || getFirestoreStatus() };
 }

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

 return { synced: true };
}

export async function deleteFromFirestore(collectionName, documentId) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  return { skipped: true, status: cachedStatus || getFirestoreStatus() };
 }

 await firestore.collection(collectionName).doc(String(documentId)).delete();
 return { deleted: true };
}

export async function getFirestoreDocument(collectionName, documentId) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  return null;
 }

 const doc = await firestore
  .collection(collectionName)
  .doc(String(documentId))
  .get();
 return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function queryFirestoreCollection(collectionName, options = {}) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  return [];
 }

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
 return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function syncCollectionsToFirestore(snapshot) {
 const firestore = await getFirestoreDb();
 if (!firestore) {
  return { skipped: true, status: cachedStatus || getFirestoreStatus() };
 }

 const counts = {};
 for (const [collectionName, rows] of Object.entries(snapshot)) {
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
}
