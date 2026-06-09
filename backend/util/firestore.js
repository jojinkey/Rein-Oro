let cachedDb = null;
let cachedFieldValue = null;
let cachedStatus = null;

function cleanPrivateKey(value) {
  return value ? value.replace(/\\n/g, '\n') : '';
}

export function getFirestoreStatus() {
  const enabled = process.env.FIRESTORE_ENABLED === 'true';
  const projectId = process.env.FIREBASE_PROJECT_ID || '';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
  const privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY || '');
  const configured = Boolean(projectId && clientEmail && privateKey);

  return {
    enabled,
    configured,
    ready: Boolean(cachedDb),
    projectId: projectId || null,
    mode: enabled && configured ? 'firestore' : 'sqlite-local',
    message: enabled
      ? (configured ? 'Firestore sync is configured.' : 'Firestore is enabled but credentials are missing.')
      : 'Firestore sync is off. SQLite is the active local database.'
  };
}

async function getFirestoreDb() {
  const status = getFirestoreStatus();
  cachedStatus = status;

  if (!status.enabled || !status.configured) {
    return null;
  }

  if (cachedDb) {
    return cachedDb;
  }

  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore, FieldValue } = await import('firebase-admin/firestore');

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY || '')
      })
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
  await firestore.collection(collectionName).doc(String(documentId)).set({
    ...cleanData,
    firestore_updated_at: cachedFieldValue.serverTimestamp()
  }, { merge: true });

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
      await firestore.collection(collectionName).doc(String(id)).set({
        ...JSON.parse(JSON.stringify(row)),
        firestore_updated_at: cachedFieldValue.serverTimestamp()
      }, { merge: true });
      counts[collectionName] += 1;
    }
  }

  return { synced: true, counts };
}
