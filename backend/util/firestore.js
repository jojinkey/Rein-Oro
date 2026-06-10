let cachedDb = null;
let cachedFieldValue = null;
let cachedStatus = null;

function cleanPrivateKey(value) {
 return value ? value.replace(/\\n/g, "\n") : "";
}

export function getFirestoreStatus() {
 const projectId = process.env.FIREBASE_PROJECT_ID || "";
 const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
 const privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY || "");
 const configured = Boolean(projectId && clientEmail && privateKey);

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
  projectId: projectId || null,
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

 if (getApps().length === 0) {
  initializeApp({
   credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY || ""),
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
