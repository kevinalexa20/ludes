import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  Store,
  MapPin,
  Phone,
  Sparkles,
  UtensilsCrossed,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  User,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { api } from "@/lib/api-client";
import { FoodItem } from "@ludes/shared";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { motion, AnimatePresence } from "framer-motion";

export const FoodListPage = () => {
  const { merchantProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"food" | "profile" | "predictions">("food");
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyFood = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ data: FoodItem[] }>("/api/food/my");
      setFoodItems(response.data || []);
    } catch (error: any) {
      console.error("Gagal mengambil menu makanan:", error);
      toast.error(error.message || "Gagal memuat daftar makanan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "food") {
      fetchMyFood();
    }
  }, [activeTab]);

  const handleToggleStatus = async (item: FoodItem) => {
    const newStatus = item.status === "available" ? "sold_out" : "available";
    try {
      const updated = await api.patch<FoodItem>(`/api/food/${item.id}/status`, {
        status: newStatus,
      });
      setFoodItems((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: updated.status } : f))
      );
      toast.success(
        `Makanan diset sebagai ${newStatus === "available" ? "Tersedia" : "Habis Ludes"}`
      );
    } catch (error: any) {
      toast.error(error.message || "Gagal mengubah status makanan");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItemId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/food/${deleteItemId}`);
      setFoodItems((prev) => prev.filter((f) => f.id !== deleteItemId));
      // Clean local storage image
      localStorage.removeItem(`ludes_img_${deleteItemId}`);
      toast.success("Makanan berhasil dihapus");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus makanan");
    } finally {
      setIsDeleting(false);
      setDeleteItemId(null);
    }
  };

  const getLocalImage = (itemId: string, pictureUrl?: string) => {
    if (pictureUrl && pictureUrl.startsWith("http")) return pictureUrl;
    return localStorage.getItem(`ludes_img_${itemId}`) || "";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-100/50">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-neutral-950 flex items-center gap-2">
            <Store className="text-brand-green-500" /> {merchantProfile?.name || "Nama Warung"}
          </h1>
          <p className="text-xs text-brand-neutral-600 mt-1 flex items-center gap-1.5">
            <MapPin size={12} /> {merchantProfile?.address || "Alamat belum dilengkapi"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/merchant/profile"
            className="bg-white hover:bg-brand-neutral-50 text-brand-neutral-800 border border-brand-neutral-200 font-semibold rounded-xl px-4 py-2.5 text-xs transition-colors cursor-pointer"
          >
            Edit Profil
          </Link>
          <button
            onClick={logout}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl px-4 py-2.5 text-xs transition-colors cursor-pointer border border-red-100"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-neutral-200 mb-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("food")}
          className={`px-4 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all border-b-2 -mb-px ${
            activeTab === "food"
              ? "border-brand-green-500 text-brand-green-600"
              : "border-transparent text-brand-neutral-600 hover:text-brand-neutral-800"
          }`}
        >
          Makanan Saya
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all border-b-2 -mb-px ${
            activeTab === "profile"
              ? "border-brand-green-500 text-brand-green-600"
              : "border-transparent text-brand-neutral-600 hover:text-brand-neutral-800"
          }`}
        >
          Profil Warung
        </button>
        <button
          onClick={() => setActiveTab("predictions")}
          className={`px-4 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === "predictions"
              ? "border-brand-green-500 text-brand-green-600"
              : "border-transparent text-brand-neutral-300 cursor-not-allowed"
          }`}
        >
          <Sparkles size={14} /> Prediksi AI (Soon)
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "food" && (
          <motion.div
            key="food-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Action Bar */}
            <div className="flex justify-between items-center">
              <h2 className="font-display text-lg font-bold text-brand-neutral-950">
                Menu Aktif ({foodItems.length})
              </h2>
              <Link
                to="/merchant/food/new"
                className="bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700 text-white font-semibold rounded-xl px-4 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <Plus size={16} /> Pasang Baru (AI)
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-28 bg-brand-neutral-100 rounded-2xl animate-pulse border border-brand-neutral-100"
                  />
                ))}
              </div>
            ) : foodItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-brand-neutral-100 shadow-sm text-center flex flex-col items-center gap-4 py-12">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="h-16 w-16 bg-brand-green-50 rounded-full flex items-center justify-center text-brand-green-500 mb-2"
                >
                  <UtensilsCrossed size={32} />
                </motion.div>
                <h3 className="font-display text-xl font-bold text-brand-neutral-950">
                  Belum Ada Makanan Dipasang
                </h3>
                <p className="text-sm text-brand-neutral-600 max-w-xs">
                  Ada lauk, nasi, kue, atau minuman sisa hari ini? Pasang di Ludes agar terjual cepat!
                </p>
                <Link
                  to="/merchant/food/new"
                  className="bg-brand-green-500 hover:bg-brand-green-600 text-white font-semibold rounded-xl px-6 py-3 cursor-pointer text-sm shadow-sm"
                >
                  Pasang Makanan Pertama
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foodItems.map((item) => {
                  const img = getLocalImage(item.id, item.picture_url);
                  const discountPct = Math.round(
                    ((item.original_price - item.final_price) / item.original_price) * 100
                  );
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 border border-brand-neutral-100 shadow-sm flex gap-4 items-center justify-between"
                    >
                      <div className="flex gap-4 items-center">
                        {/* Image */}
                        <div className="h-16 w-16 rounded-xl bg-brand-neutral-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {img ? (
                            <img src={img} alt={item.name} className="object-cover h-full w-full" />
                          ) : (
                            <UtensilsCrossed size={20} className="text-brand-neutral-400" />
                          )}
                        </div>

                        {/* Details */}
                        <div>
                          <h4 className="font-display font-bold text-sm text-brand-neutral-950 line-clamp-1">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-bold text-brand-green-600">
                              Rp {item.final_price.toLocaleString("id-ID")}
                            </span>
                            <span className="text-xs text-brand-neutral-400 line-through">
                              Rp {item.original_price.toLocaleString("id-ID")}
                            </span>
                            {discountPct > 0 && (
                              <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                -{discountPct}%
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-brand-neutral-500 mt-1">
                            Stok: {item.quantity} porsi • Ambil: {item.pickup_time || "Sore"}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="cursor-pointer text-brand-neutral-500 hover:text-brand-neutral-700 transition-colors"
                        >
                          {item.status === "available" ? (
                            <ToggleRight size={32} className="text-brand-green-500" />
                          ) : (
                            <ToggleLeft size={32} className="text-brand-neutral-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteItemId(item.id)}
                          className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "profile" && (
          <motion.div
            key="profile-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-brand-neutral-100 shadow-sm space-y-6"
          >
            <div>
              <h2 className="font-display text-lg font-bold text-brand-neutral-950 mb-4">
                Informasi Warung
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-semibold text-brand-neutral-500 uppercase tracking-wide">
                      Nama Warung
                    </span>
                    <span className="text-sm font-semibold text-brand-neutral-950 mt-1 block">
                      {merchantProfile?.name}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-brand-neutral-500 uppercase tracking-wide">
                      Nomor WhatsApp
                    </span>
                    <span className="text-sm font-semibold text-brand-neutral-950 mt-1 flex items-center gap-1.5">
                      <Phone size={14} className="text-brand-green-500" /> {merchantProfile?.phone}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-brand-neutral-500 uppercase tracking-wide">
                      Alamat Lengkap
                    </span>
                    <span className="text-sm text-brand-neutral-800 mt-1 block leading-relaxed">
                      {merchantProfile?.address}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-semibold text-brand-neutral-500 uppercase tracking-wide">
                      Deskripsi Warung
                    </span>
                    <span className="text-sm text-brand-neutral-800 mt-1 block leading-relaxed italic">
                      {merchantProfile?.description || "Tidak ada deskripsi."}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-brand-neutral-500 uppercase tracking-wide">
                      Koordinat GPS
                    </span>
                    <span className="text-xs text-brand-neutral-600 mt-1 block">
                      Lat: {merchantProfile?.latitude.toFixed(6)}, Lng: {merchantProfile?.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-neutral-100 flex justify-end">
              <Link
                to="/merchant/profile"
                className="bg-brand-green-500 hover:bg-brand-green-600 text-white font-semibold rounded-xl px-6 py-2.5 text-xs transition-colors"
              >
                Ubah Profil Warung
              </Link>
            </div>
          </motion.div>
        )}

        {activeTab === "predictions" && (
          <motion.div
            key="predictions-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-brand-neutral-100 shadow-sm text-center flex flex-col items-center gap-4 py-16"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-16 w-16 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full flex items-center justify-center text-white mb-2 shadow-sm"
            >
              <Sparkles size={32} />
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-brand-neutral-950">
              Segera Hadir
            </h2>
            <h3 className="font-semibold text-brand-neutral-800">
              Prediksi Surplus Harian (AI)
            </h3>
            <p className="text-sm text-brand-neutral-600 max-w-sm leading-relaxed">
              AI akan menganalisis pola penjualan warung kamu dan memprediksi makanan apa saja yang akan surplus besok. Kamu bisa mematangkan persiapan sebelum makanan terbuang percuma!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-6">
              {[
                { title: "📊 Prediksi Porsi", desc: "Prediksi berapa porsi makanan sisa" },
                { title: "⏰ Notifikasi Dini", desc: "Notifikasi waktu basi makanan" },
                { title: "💰 Dynamic Pricing", desc: "Harga otomatis sesuai permintaan" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="bg-brand-neutral-50 border border-brand-neutral-100 rounded-2xl p-4 text-left"
                >
                  <h4 className="text-xs font-bold text-brand-neutral-900">{f.title}</h4>
                  <p className="text-[10px] text-brand-neutral-600 mt-1 leading-normal">{f.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={deleteItemId !== null}
        title="Hapus Makanan"
        message="Apakah kamu yakin ingin menghapus makanan ini dari menu warung kamu? Tindakan ini tidak bisa dibatalkan."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteItemId(null)}
      />
    </div>
  );
};
