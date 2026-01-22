import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { type User } from "@shared/schema";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to get ID token
    const getIdToken = async (): Promise<string | null> => {
        if (!firebaseUser) return null;
        try {
            return await firebaseUser.getIdToken();
        } catch (error) {
            console.error("Error getting ID token:", error);
            return null;
        }
    };

    // Sync Firebase user with backend
    const syncUserWithBackend = async (fbUser: FirebaseUser) => {
        try {
            const token = await fbUser.getIdToken();
            const res = await fetch("/api/auth/verify-token", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const backendUser = await res.json();
                setUser(backendUser);
            } else {
                const errorText = await res.text();
                console.error("Failed to sync user with backend:", errorText);
                toast({
                    title: "Login Sync Error",
                    description: `Backend sync failed: ${res.status} ${res.statusText}. Check console for details.`,
                    variant: "destructive"
                });
                setUser(null);
            }
        } catch (error) {
            console.error("Error syncing user:", error);
            setUser(null);
        }
    };

    // Listen to Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
                await syncUserWithBackend(fbUser);
            } else {
                setUser(null);
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            await syncUserWithBackend(credential.user);
            toast({
                title: "Welcome back!",
                description: `Logged in as ${email}`
            });
        } catch (error: any) {
            const errorMessage = error.code === "auth/invalid-credential"
                ? "Invalid email or password"
                : error.message || "Login failed";

            toast({
                title: "Login failed",
                description: errorMessage,
                variant: "destructive"
            });
            throw error;
        }
    };

    const signUp = async (email: string, password: string, displayName?: string) => {
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);

            // Sync with backend (display name will be null initially, backend creates user)
            await syncUserWithBackend(credential.user);

            toast({
                title: "Account created!",
                description: "You have 1 free debate prompt!"
            });
        } catch (error: any) {
            const errorMessage = error.code === "auth/email-already-in-use"
                ? "Email already in use"
                : error.code === "auth/weak-password"
                    ? "Password should be at least 6 characters"
                    : error.message || "Registration failed";

            toast({
                title: "Registration failed",
                description: errorMessage,
                variant: "destructive"
            });
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            const credential = await signInWithPopup(auth, googleProvider);
            await syncUserWithBackend(credential.user);
            toast({
                title: "Welcome!",
                description: `Logged in with Google`
            });
        } catch (error: any) {
            const errorMessage = error.code === "auth/popup-closed-by-user"
                ? "Sign-in cancelled"
                : error.message || "Google sign-in failed";

            toast({
                title: "Sign-in failed",
                description: errorMessage,
                variant: "destructive"
            });
            throw error;
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setFirebaseUser(null);
        toast({ title: "Logged out" });
    };

    return (
        <AuthContext.Provider value={{
            user,
            firebaseUser,
            isLoading,
            signIn,
            signUp,
            signInWithGoogle,
            signOut,
            getIdToken
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
