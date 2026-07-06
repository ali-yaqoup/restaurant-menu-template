/**
 * Firebase initialization — modular SDK v10 (CDN)
 * Single source of truth for all Firebase services in this project.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

/** Pin SDK version for any file that imports Firestore/Auth modules directly */
export const FIREBASE_SDK_VERSION = "10.8.0";

const firebaseConfig = {
    apiKey: "AIzaSyB9L1qQkIGwbAbiT8wOcjtIG6y1TezidOo",
    authDomain: "menutest-78a3e.firebaseapp.com",
    projectId: "menutest-78a3e",
    storageBucket: "menutest-78a3e.firebasestorage.app",
    messagingSenderId: "386045461019",
    appId: "1:386045461019:web:2d8bccbabc976e3d3beebe",
    measurementId: "G-H4LWE65HY8"
};

let app = null;
let auth = null;
let db = null;
let storage = null;
let initError = null;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
} catch (error) {
    initError = error;
    console.error("Firebase initialization failed:", error);
}

/** True when all core services initialized without error */
export const isFirebaseReady = Boolean(app && auth && db && storage && !initError);

export { app, auth, db, storage, initError, firebaseConfig };
