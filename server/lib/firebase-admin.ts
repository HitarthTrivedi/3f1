import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseApp: admin.app.App | null = null;

export function initializeFirebaseAdmin(): admin.app.App {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Priority 1: Try to get service account from environment variable (JSON string)
        // This is the preferred method for Vercel and other cloud deployments
        const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (serviceAccountEnv) {
            try {
                const serviceAccount = JSON.parse(serviceAccountEnv);
                console.log("Attempting to initialize Firebase Admin with FIREBASE_SERVICE_ACCOUNT environment variable");
                firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                console.log("✓ Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT environment variable");
                return firebaseApp;
            } catch (error) {
                console.error("Failed to parse/use FIREBASE_SERVICE_ACCOUNT environment variable:", error);
                // Continue to other methods if parsing fails
            }
        } else {
            console.warn("⚠ FIREBASE_SERVICE_ACCOUNT environment variable not set");
        }

        // Priority 2: Try to get service account path from environment or use default filename
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "firebase-service-account.json";

        if (serviceAccountPath) {
            const absolutePath = path.isAbsolute(serviceAccountPath)
                ? serviceAccountPath
                : path.resolve(process.cwd(), serviceAccountPath);

            if (fs.existsSync(absolutePath)) {
                console.log("Attempting to initialize Firebase Admin with service account file:", absolutePath);
                const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, "utf8"));

                firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });

                console.log("✓ Firebase Admin initialized with service account file");
                return firebaseApp;
            } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
                console.warn(`⚠ Service account file not found at: ${absolutePath}`);
            }
        }

        // Fallback: Use project ID from environment variables (for development without service account)
        const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
        if (projectId) {
            console.log("Attempting to initialize Firebase Admin with project ID from environment");
            try {
                firebaseApp = admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                    projectId: projectId,
                });
                console.log("✓ Firebase Admin initialized with project ID:", projectId);
                return firebaseApp;
            } catch (error) {
                console.error("Failed to initialize with applicationDefault credentials:", error);
            }
        } else {
            console.warn("⚠ Neither VITE_FIREBASE_PROJECT_ID nor FIREBASE_PROJECT_ID environment variables found");
        }

        // Last resort: try default initialization
        console.warn("⚠ Attempting default Firebase Admin initialization (requires GOOGLE_APPLICATION_CREDENTIALS)");
        try {
            firebaseApp = admin.initializeApp();
            console.log("✓ Firebase Admin initialized with default credentials");
            return firebaseApp;
        } catch (error) {
            console.error("Default Firebase Admin initialization failed:", error);
            throw error;
        }

    } catch (error) {
        console.error("Failed to initialize Firebase Admin:", error);
        throw new Error("Firebase Admin initialization failed. Please check your configuration.");
    }
}

export function getFirebaseAdmin(): admin.app.App {
    if (!firebaseApp) {
        throw new Error("Firebase Admin not initialized. Call initializeFirebaseAdmin first.");
    }
    return firebaseApp;
}

export { admin };
