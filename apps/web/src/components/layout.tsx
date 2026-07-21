import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Menu, X, LogOut, User, Store, Home, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, merchantProfile, isLoggedIn, isMerchant, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-200 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-brand-neutral-100 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 font-display text-2xl font-extrabold text-brand-green-500">
            <motion.span
              whileHover={{ scale: 1.05, rotate: [0, 5, -5, 0] }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              🍽️
            </motion.span>
            Ludes
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              activeProps={{ className: "text-brand-green-600 font-semibold" }}
              inactiveProps={{ className: "text-brand-neutral-600 hover:text-brand-neutral-800" }}
              className="text-sm font-medium transition-colors"
            >
              Cari Makanan
            </Link>
            
            {isMerchant && (
              <>
                <Link
                  to="/merchant/food"
                  activeProps={{ className: "text-brand-green-600 font-semibold" }}
                  inactiveProps={{ className: "text-brand-neutral-600 hover:text-brand-neutral-800" }}
                  className="text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Store size={16} /> Dashboard Warung
                </Link>
                <Link
                  to="/merchant/food/new"
                  activeProps={{ className: "text-brand-green-600 font-semibold" }}
                  inactiveProps={{ className: "text-brand-neutral-600 hover:text-brand-neutral-800" }}
                  className="text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <PlusCircle size={16} /> Pasang Iklan
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-brand-neutral-600 flex items-center gap-1">
                  <User size={16} /> {user?.name} 
                  {isMerchant && merchantProfile && ` (${merchantProfile.name})`}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold border-2 border-brand-neutral-200 text-brand-neutral-600 hover:bg-brand-neutral-100 rounded-xl px-4 py-2 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-brand-neutral-600 hover:text-brand-neutral-800"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-brand-neutral-600 hover:text-brand-neutral-800 cursor-pointer"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-64 bg-white z-50 p-6 flex flex-col justify-between shadow-xl md:hidden"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl font-bold text-brand-green-500">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-brand-neutral-600 hover:text-brand-neutral-800 flex items-center gap-2"
                  >
                    <Home size={18} /> Cari Makanan
                  </Link>

                  {isMerchant && (
                    <>
                      <Link
                        to="/merchant/food"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-base font-medium text-brand-neutral-600 hover:text-brand-neutral-800 flex items-center gap-2"
                      >
                        <Store size={18} /> Dashboard Warung
                      </Link>
                      <Link
                        to="/merchant/food/new"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-base font-medium text-brand-neutral-600 hover:text-brand-neutral-800 flex items-center gap-2"
                      >
                        <PlusCircle size={18} /> Pasang Iklan
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-brand-neutral-100 pt-4 flex flex-col gap-4">
                {isLoggedIn ? (
                  <>
                    <div className="text-sm text-brand-neutral-600 flex flex-col gap-1">
                      <span className="font-medium text-brand-neutral-800">{user?.name}</span>
                      <span className="text-xs text-brand-neutral-400">{user?.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-sm font-semibold border-2 border-brand-neutral-200 text-brand-neutral-600 hover:bg-brand-neutral-100 rounded-xl px-4 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer w-full"
                    >
                      <LogOut size={16} /> Keluar
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm font-semibold border-2 border-brand-neutral-200 text-brand-neutral-600 hover:bg-brand-neutral-100 rounded-xl py-2.5 text-center block"
                    >
                      Masuk
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm font-semibold bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700 text-white rounded-xl py-2.5 text-center block"
                    >
                      Daftar
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-neutral-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-display text-xl font-bold text-brand-green-500">Ludes</span>
            <span className="text-xs text-brand-neutral-600">Makanan hemat, dekat kamu</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-brand-neutral-600">
            <a href="#" className="hover:text-brand-neutral-800">Tentang Kami</a>
            <a href="#" className="hover:text-brand-neutral-800">Cara Kerja</a>
            <a href="#" className="hover:text-brand-neutral-800">Untuk Pedagang</a>
          </div>

          <div className="text-xs text-brand-neutral-400">
            Dibuat dengan ❤️ untuk UMKM Indonesia
          </div>
        </div>
      </footer>
    </div>
  );
};
