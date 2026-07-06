import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseClientConfig = {
 apiKey: import.meta.env.FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY || "",
 authDomain:
  import.meta.env.FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "reinoro.firebaseapp.com",
 projectId: import.meta.env.FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID || "reinoro",
 storageBucket:
  import.meta.env.FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "reinoro.appspot.com",
 messagingSenderId:
  import.meta.env.FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
 appId: import.meta.env.FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export const isFirebaseClientConfigured = Boolean(
 firebaseClientConfig.apiKey &&
  firebaseClientConfig.authDomain &&
  firebaseClientConfig.projectId,
);

let app = null;
let auth = null;
let db = null;

if (isFirebaseClientConfigured) {
 app = getApps()[0] || initializeApp(firebaseClientConfig);
 auth = getAuth(app);
 db = getFirestore(app);
}

export { app, auth, db };

export async function getFirebaseClient() {
 return { app, auth, db };
}
