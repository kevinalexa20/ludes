import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { UserRole } from "@ludes/shared";
import { motion } from "framer-motion";
import { ShoppingBag, Store, Check } from "lucide-react";

export const RegisterPage = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false);

    if (!name || !email || !password) {
      setHasError(true);
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        role,
        phone: phone || undefined,
      });
      if (role === "merchant") {
        navigate({ to: "/merchant/profile" });
      } else {
        navigate({ to: "/" });
      }
    } catch (error) {
      setHasError(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`w-full max-w-lg bg-white rounded-3xl p-8 shadow-sm border border-brand-neutral-100 ${
          hasError ? "animate-shake border-red-300" : ""
        }`}
      >
        {/* Logo & Headline */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-4xl mb-2">
            🍽️
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-neutral-950">
            Daftar di Ludes
          </h1>
          <p className="text-sm text-brand-neutral-600 mt-1">
            Mulai hemat pengeluaran atau kurangi waste warung kamu hari ini.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-brand-neutral-700 mb-2">
              Pilih Peran Anda
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("customer")}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                  role === "customer"
                    ? "border-brand-green-500 bg-brand-green-50/50"
                    : "border-brand-neutral-200 bg-white hover:border-brand-neutral-300"
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-brand-green-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="text-brand-green-600" size={20} />
                </div>
                <h3 className="font-display text-base font-bold text-brand-neutral-950">Saya Pembeli</h3>
                <p className="text-xs text-brand-neutral-600 mt-1">
                  Cari makanan murah berkualitas di sekitar kamu
                </p>
                {role === "customer" && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-brand-green-500 flex items-center justify-center">
                    <Check className="text-white" size={12} />
                  </div>
                )}
              </motion.div>

              {/* Merchant */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("merchant")}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                  role === "merchant"
                    ? "border-brand-green-500 bg-brand-green-50/50"
                    : "border-brand-neutral-200 bg-white hover:border-brand-neutral-300"
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-brand-green-100 flex items-center justify-center mb-3">
                  <Store className="text-brand-green-600" size={20} />
                </div>
                <h3 className="font-display text-base font-bold text-brand-neutral-950">Saya Pedagang</h3>
                <p className="text-xs text-brand-neutral-600 mt-1">
                  Jual makanan surplus, kurangi waste, dapat untung
                </p>
                {role === "merchant" && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-brand-green-500 flex items-center justify-center">
                    <Check className="text-white" size={12} />
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-neutral-700 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              required
              className="w-full rounded-xl border border-brand-neutral-200 px-4 py-3 min-h-[48px] focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 outline-none transition-all placeholder:text-brand-neutral-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-neutral-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              required
              className="w-full rounded-xl border border-brand-neutral-200 px-4 py-3 min-h-[48px] focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 outline-none transition-all placeholder:text-brand-neutral-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-neutral-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
              className="w-full rounded-xl border border-brand-neutral-200 px-4 py-3 min-h-[48px] focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 outline-none transition-all placeholder:text-brand-neutral-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-neutral-700 mb-1.5">
              Nomor Telepon (Opsional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full rounded-xl border border-brand-neutral-200 px-4 py-3 min-h-[48px] focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 outline-none transition-all placeholder:text-brand-neutral-400"
            />
            <p className="text-xs text-brand-neutral-600 mt-1">
              Berguna untuk mempermudah komunikasi pelanggan dengan warung kamu.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700 disabled:bg-brand-neutral-200 text-white font-semibold rounded-xl px-6 py-3.5 min-h-[48px] transition-all shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              "Daftar"
            )}
          </motion.button>
        </form>

        {/* Link to Login */}
        <div className="text-center mt-6 pt-6 border-t border-brand-neutral-100">
          <p className="text-sm text-brand-neutral-600">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-green-600 hover:text-brand-green-700 transition-colors"
            >
              Masuk di sini →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
