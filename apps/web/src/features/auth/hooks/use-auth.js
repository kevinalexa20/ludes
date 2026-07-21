import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [merchantProfile, setMerchantProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const fetchCurrentUser = async () => {
        const token = localStorage.getItem("ludes_token");
        if (!token) {
            setUser(null);
            setMerchantProfile(null);
            setIsLoading(false);
            return;
        }
        try {
            const response = await api.get("/api/auth/me");
            setUser(response.user);
            setMerchantProfile(response.merchant_profile);
            localStorage.setItem("ludes_user", JSON.stringify(response.user));
        }
        catch (error) {
            console.error("Gagal mengambil data user:", error);
            localStorage.removeItem("ludes_token");
            localStorage.removeItem("ludes_user");
            setUser(null);
            setMerchantProfile(null);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchCurrentUser();
    }, []);
    const login = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post("/api/auth/login", data);
            localStorage.setItem("ludes_token", response.token);
            localStorage.setItem("ludes_user", JSON.stringify(response.user));
            await fetchCurrentUser();
            toast.success(`Selamat datang kembali, ${response.user.name}!`);
        }
        catch (error) {
            const msg = error.message || "Email atau password salah";
            toast.error(msg);
            setIsLoading(false);
            throw error;
        }
    };
    const register = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post("/api/auth/register", data);
            localStorage.setItem("ludes_token", response.token);
            localStorage.setItem("ludes_user", JSON.stringify(response.user));
            await fetchCurrentUser();
            toast.success("Akun berhasil dibuat! Selamat bergabung.");
        }
        catch (error) {
            const msg = error.message || "Gagal mendaftarkan akun";
            toast.error(msg);
            setIsLoading(false);
            throw error;
        }
    };
    const logout = async () => {
        setIsLoading(true);
        try {
            await api.post("/api/auth/logout").catch(() => { });
        }
        finally {
            localStorage.removeItem("ludes_token");
            localStorage.removeItem("ludes_user");
            setUser(null);
            setMerchantProfile(null);
            setIsLoading(false);
            toast.success("Berhasil keluar.");
        }
    };
    const isLoggedIn = !!user;
    const isMerchant = user?.role === "merchant";
    return (_jsx(AuthContext.Provider, { value: {
            user,
            merchantProfile,
            isLoggedIn,
            isMerchant,
            login,
            register,
            logout,
            isLoading,
            refreshUser: fetchCurrentUser,
        }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth harus digunakan di dalam AuthProvider");
    }
    return context;
};
//# sourceMappingURL=use-auth.js.map