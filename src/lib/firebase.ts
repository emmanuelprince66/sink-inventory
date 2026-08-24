// src/lib/firebase.ts
import { getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent multiple initialization)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Messaging is resolved asynchronously, because isSupported() is a promise.
 *
 * The exported `messaging` binding is therefore null for the first tick or two
 * of page life, and anything that read it during startup — getToken, onMessage —
 * silently did nothing and logged "not initialized". Callers must await
 * messagingReady() instead of reading the binding directly.
 */
let messaging: any = null;

const messagingPromise: Promise<any> =
  typeof window === "undefined"
    ? Promise.resolve(null)
    : isSupported()
        .then((supported) => {
          if (!supported) {
            console.log("Firebase messaging is not supported in this browser");
            return null;
          }
          messaging = getMessaging(app);
          return messaging;
        })
        .catch((error) => {
          console.error("Error checking Firebase messaging support:", error);
          return null;
        });

/** Resolves once support has been determined; null when unsupported. */
export const messagingReady = (): Promise<any> => messagingPromise;

export { messaging };
export default app;
