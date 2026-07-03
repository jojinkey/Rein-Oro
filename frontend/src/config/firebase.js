import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
 apiKey: import.meta.env.FIREBASE_API_KEY,
 authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
 projectId: import.meta.env.FIREBASE_PROJECT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
 console.error("Firebase configuration values are missing in frontend environment variables.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
