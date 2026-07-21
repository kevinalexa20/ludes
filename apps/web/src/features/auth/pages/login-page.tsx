import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { motion } from "framer-motion";

export const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false);

    if (!email || !password) {
      setHasError(true);
      return;
    }

    try {
      await login({ email, password });
      navigate({ to: "/" });
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
        className={`w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-brand-neutral-100 ${
          hasError ? "animate-shake border-red-300" : ""
        }`}
      >
        {/* Logo & Headline */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-4xl mb-2">
            🍽️
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-neutral-950">
            Masuk ke Ludes
          </h1>
          <p className="text-sm text-brand-neutral-600 mt-1">
            Selamat datang kembali! Yuk hemat makanan hari ini.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Password kamu"
              required
              className="w-full rounded-xl border border-brand-neutral-200 px-4 py-3 min-h-[48px] focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 outline-none transition-all placeholder:text-brand-neutral-400"
            />
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
              "Masuk"
            )}
          </motion.button>
        </form>

        {/* Link to Register */}
        <div className="text-center mt-6 pt-6 border-t border-brand-neutral-100">
          <p className="text-sm text-brand-neutral-600">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-semibold text-brand-green-600 hover:text-brand-green-700 transition-colors"
            >
              Daftar gratis →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
