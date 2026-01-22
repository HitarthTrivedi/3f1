import type { Request, Response, NextFunction } from "express";
import { admin, getFirebaseAdmin } from "./firebase-admin";

// Extend Express Request to include Firebase user
declare global {
    namespace Express {
        interface Request {
            firebaseUser?: admin.auth.DecodedIdToken;
        }
    }
}

/**
 * Middleware to verify Firebase ID token and attach user to request
 * @param required - If true, will return 401 if no valid token. If false, continues even without token
 */
export function authenticateFirebase(required: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                if (required) {
                    return res.status(401).json({ error: "No authentication token provided" });
                }
                // Optional auth - continue without user
                return next();
            }

            const idToken = authHeader.split("Bearer ")[1];

            try {
                const app = getFirebaseAdmin();
                if (!app) {
                    console.error("Firebase Admin app not initialized");
                    if (required) {
                        return res.status(500).json({ error: "Authentication service unavailable - Firebase not initialized" });
                    }
                    return next();
                }

                const decodedToken = await app.auth().verifyIdToken(idToken);
                req.firebaseUser = decodedToken;
                next();
            } catch (error: any) {
                console.error("Firebase token verification failed:", error.code || error.message);
                if (required) {
                    return res.status(401).json({ error: "Invalid or expired token", details: error.message });
                }
                next();
            }
        } catch (error: any) {
            console.error("Authentication middleware error:", error);
            res.status(500).json({ error: "Authentication failed", details: error.message });
        }
    };
}

/**
 * Middleware that requires authentication - returns 401 if not authenticated
 */
export const requireAuth = authenticateFirebase(true);

/**
 * Middleware that optionally authenticates - continues even if no token
 */
export const optionalAuth = authenticateFirebase(false);
