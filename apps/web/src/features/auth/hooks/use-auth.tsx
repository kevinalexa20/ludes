import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Merchant, RegisterInput, LoginInput } from "@ludes/shared";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  merchantProfile: Merchant | null;
  isLoggedIn: boolean;
  isMerchant: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [merchantProfile, setMerchantProfile] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("ludes_token");
    if (!token) {
      setUser(null);
      setMerchantProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<{
        user: User;
        merchant_profile: Merchant | null;
      }>("/api/auth/me");
      setUser(response.user);
      setMerchantProfile(response.merchant_profile);
      localStorage.setItem("ludes_user", JSON.stringify(response.user));
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      localStorage.removeItem("ludes_token");
      localStorage.removeItem("ludes_user");
      setUser(null);
      setMerchantProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await api.post<{
        user: User;
        token: string;
      }>("/api/auth/login", data);
      
      localStorage.setItem("ludes_token", response.token);
      localStorage.setItem("ludes_user", JSON.stringify(response.user));
      
      await fetchCurrentUser();
      toast.success(`Selamat datang kembali, ${response.user.name}!`);
    } catch (error: any) {
      const msg = error.message || "Email atau password salah";
      toast.error(msg);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await api.post<{
        user: User;
        token: string;
      }>("/api/auth/register", data);
      
      localStorage.setItem("ludes_token", response.token);
      localStorage.setItem("ludes_user", JSON.stringify(response.user));
      
      await fetchCurrentUser();
      toast.success("Akun berhasil dibuat! Selamat bergabung.");
    } catch (error: any) {
      const msg = error.message || "Gagal mendaftarkan akun";
      toast.error(msg);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post("/api/auth/logout").catch(() => {});
    } finally {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        merchantProfile,
        isLoggedIn,
        isMerchant,
        login,
        register,
        logout,
        isLoading,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};
