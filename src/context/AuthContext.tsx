import React, { createContext, useState, useEffect, useContext } from "react";
import API_BASE_URL from "../config/api";

// ── Types ──────────────────────────────────────────────────────────────────────
type UserRole = "user" | "admin" | "recruiter";

export type AuthUser = {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    image?: string;
};

type AuthContextType = {
    user: AuthUser | null;
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

// ── Context ────────────────────────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextType | null>(null);

// ── Custom Hook ────────────────────────────────────────────────────────────────
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};

// ── Provider ───────────────────────────────────────────────────────────────────
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = async () => {
        // Prevent concurrent check calls
        if (!loading) setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                credentials: "include",
            });

            if (res.ok) {
                const result = await res.json();
                if (result.success) {
                    setUser(result.data);
                } else {
                    setUser(null);
                }
            } else {
                // If 401, just clear user without logging error to console
                if (res.status !== 401) {
                    console.warn(`Auth check returned status: ${res.status}`);
                }
                setUser(null);
            }
        } catch (err) {
            // This is likely a network error (Connection Refused)
            console.error("Critical: Auth service unreachable", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const logout = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
            const result = await res.json();
            if (result.success) {
                setUser(null);
            }
        } catch (err) {
            console.error("Logout failed:", err);
            setUser(null); // Force clear state anyway
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05),transparent)] -z-10" />
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-xl shadow-primary/20">
                    A
                </div>
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-inner" />
                <p className="text-sm text-muted-foreground mt-4 font-medium animate-pulse">Standardizing session...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, refreshUser: fetchCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
}