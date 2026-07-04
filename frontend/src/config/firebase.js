export const firebaseClientConfig = {
 apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
 authDomain:
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "reinoro.firebaseapp.com",
 projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "reinoro",
 storageBucket:
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "reinoro.appspot.com",
 messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
 appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export const isFirebaseClientConfigured = Boolean(
 firebaseClientConfig.apiKey &&
  firebaseClientConfig.authDomain &&
  firebaseClientConfig.projectId,
);

let cachedClient = null;

export async function getFirebaseClient() {
 if (!isFirebaseClientConfigured) {
  return { app: null, auth: null, db: null };
 }
 if (cachedClient) return cachedClient;

 const [{ initializeApp, getApps }, { getAuth }, { getFirestore }] =
  await Promise.all([
   import("firebase/app"),
   import("firebase/auth"),
   import("firebase/firestore"),
  ]);

 const app = getApps()[0] || initializeApp(firebaseClientConfig);
 cachedClient = {
  app,
  auth: getAuth(app),
  db: getFirestore(app),
 };
 return cachedClient;
}
