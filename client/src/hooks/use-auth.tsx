import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { type User, type InsertUser } from "@shared/schema";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: Pick<InsertUser, "username" | "password">) => Promise<void>;
    register: (data: InsertUser) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user")
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error("Not authenticated");
            })
            .then((user) => setUser(user))
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
    }, []);

    const login = async (data: Pick<InsertUser, "username" | "password">) => {
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            const user = await res.json();
            setUser(user);
            toast({ title: "Welcome back!", description: `Logged in as ${user.username}` });
        } catch (error) {
            toast({
                title: "Login failed",
                description: error instanceof Error ? error.message : "Details invalid",
                variant: "destructive"
            });
            throw error;
        }
    };

    const register = async (data: InsertUser) => {
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            const user = await res.json();
            setUser(user);
            toast({ title: "Account created", description: "You have 1 free prompt!" });
        } catch (error) {
            toast({
                title: "Registration failed",
                description: error instanceof Error ? error.message : "Could not create account",
                variant: "destructive"
            });
            throw error;
        }
    };

    const logout = async () => {
        await fetch("/api/logout", { method: "POST" });
        setUser(null);
        toast({ title: "Logged out" });
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
