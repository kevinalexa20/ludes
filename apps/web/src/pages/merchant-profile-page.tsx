import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { api } from "@/lib/api-client";
import { Merchant } from "@ludes/shared";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

export const MerchantProfilePage = () => {
  const { merchantProfile, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    latitude: 0,
    longitude: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (merchantProfile) {
      setFormData({
        name: merchantProfile.name,
        address: merchantProfile.address,
        phone: merchantProfile.phone,
        description: merchantProfile.description || "",
        latitude: merchantProfile.latitude,
        longitude: merchantProfile.longitude,
      });
    }
  }, [merchantProfile]);

  const detectLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error("Browser kamu tidak mendukung deteksi lokasi");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setIsLocating(false);
        toast.success("Lokasi warung berhasil dideteksi!");
      },
      (error) => {
        console.error("Gagal mendeteksi lokasi:", error);
        toast.error("Gagal mendeteksi lokasi. Coba izinkan akses lokasi");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Nama warung wajib diisi";
    else if (formData.name.trim().length < 2) newErrors.name = "Nama warung minimal 2 karakter";

    if (!formData.address.trim()) newErrors.address = "Alamat warung wajib diisi";
    else if (formData.address.trim().length < 5) newErrors.address = "Alamat warung minimal 5 karakter";

    if (!formData.phone.trim()) newErrors.phone = "Nomor WhatsApp wajib diisi";
    else if (formData.phone.trim().length < 8) newErrors.phone = "Nomor WhatsApp minimal 8 digit";

    if (formData.latitude === 0 && formData.longitude === 0) {
      newErrors.location = "Harap tentukan koordinat lokasi warung kamu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Harap periksa kembali isian form");
      return;
    }

    setIsSubmitting(true);
    try {
      if (merchantProfile) {
        // Update profile
        await api.put("/api/merchants/me", formData);
        toast.success("Profil warung berhasil diperbarui");
      } else {
        // Create profile
        await api.post("/api/merchants", formData);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success("Profil warung kamu siap! Selamat datang 🎉");
      }

      await refreshUser();
      navigate({ to: "/merchant/food" });
    } catch (error: any) {
      const msg = error.message || "Gagal menyimpan profil warung";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto px-4 py-8 md:py-12"
    >
      <div className="flex items-center justify-between mb-6">
        <Link
          to={merchantProfile ? "/merchant/food" : "/"}
          className="inline-flex items-center gap-1.5 text-sm text-brand-neutral-600 hover:text-brand-neutral-800 font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-neutral-100 shadow-sm">
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-neutral-950">
            {merchantProfile ? "Edit Profil Warung" : "Lengkapi Profil Warung"}
          </h1>
          <p className="text-sm text-brand-neutral-600 mt-2">
            Supaya pelanggan bisa menemukan warung kamu dan memesan lewat WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama Warung */}
          <div>
            <label className="block text-sm font-medium text-brand-neutral-800 mb-1.5">
              Nama Warung
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Warung Nasi Padang Sederhana"
              className={`w-full rounded-xl border px-4 py-3 min-h-[48px] focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-brand-neutral-200 focus:border-brand-green-500 focus:ring-brand-green-100"
              }`}
            />
            {errors.name ? (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            ) : (
              <p className="text-xs text-brand-neutral-500 mt-1">Nama ini akan dipublikasikan ke pelanggan.</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-brand-neutral-800 mb-1.5">
              Nomor WhatsApp Warung
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Contoh: 081234567890"
              className={`w-full rounded-xl border px-4 py-3 min-h-[48px] focus:outline-none focus:ring-2 transition-all ${
                errors.phone
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-brand-neutral-200 focus:border-brand-green-500 focus:ring-brand-green-100"
              }`}
            />
            {errors.phone ? (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            ) : (
              <p className="text-xs text-brand-neutral-500 mt-1">Gunakan format lokal/internasional (nomor aktif WhatsApp).</p>
            )}
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-medium text-brand-neutral-800 mb-1.5">
              Alamat Lengkap
            </label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Contoh: Jl. Diponegoro No. 12, RT 02/RW 03, Kel. Menteng, Kec. Menteng"
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.address
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-brand-neutral-200 focus:border-brand-green-500 focus:ring-brand-green-100"
              }`}
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-brand-neutral-800 mb-1.5">
              Deskripsi Warung (Opsional)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Contoh: Warung rumahan menyajikan lauk tradisional khas Jawa Timur. Semua dimasak segar tiap pagi."
              className="w-full rounded-xl border border-brand-neutral-200 px-4 py-3 focus:outline-none focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 transition-all resize-none"
            />
          </div>

          {/* Geolocation Pinpoint */}
          <div className="bg-brand-neutral-50 rounded-2xl p-4 border border-brand-neutral-100">
            <h3 className="font-display text-sm font-semibold text-brand-neutral-900 mb-2 flex items-center gap-1.5">
              <MapPin size={16} className="text-brand-green-500" /> Lokasi Geografis (GPS)
            </h3>
            <p className="text-xs text-brand-neutral-600 mb-3 leading-relaxed">
              Kami memerlukan koordinat GPS warung agar pembeli bisa mengurutkan makanan terdekat dari lokasi mereka.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={detectLocation}
                disabled={isLocating}
                className="inline-flex items-center justify-center gap-2 bg-brand-green-50 hover:bg-brand-green-100 text-brand-green-600 font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-75"
              >
                {isLocating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Mendeteksi...
                  </>
                ) : (
                  <>
                    <MapPin size={16} /> Deteksi Lokasi Saya
                  </>
                )}
              </button>

              <div className="text-xs text-brand-neutral-700 flex flex-col justify-center gap-0.5 mt-1 sm:mt-0">
                {formData.latitude !== 0 || formData.longitude !== 0 ? (
                  <>
                    <span className="font-medium text-brand-green-600">✓ Lokasi Terdeteksi</span>
                    <span>
                      Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                    </span>
                  </>
                ) : (
                  <span className="text-red-500 font-medium">⚠️ Koordinat Belum Diset</span>
                )}
              </div>
            </div>

            {/* Collapsible Manual Input */}
            <details className="mt-3">
              <summary className="text-xs text-brand-neutral-500 hover:text-brand-neutral-700 cursor-pointer select-none">
                Atur Koordinat Manual
              </summary>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-[10px] font-semibold text-brand-neutral-600 uppercase mb-0.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-xs rounded-lg border border-brand-neutral-200 px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-brand-neutral-600 uppercase mb-0.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-xs rounded-lg border border-brand-neutral-200 px-2 py-1.5"
                  />
                </div>
              </div>
            </details>

            {errors.location && (
              <p className="text-xs text-red-500 mt-2 font-medium">{errors.location}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700 text-white font-semibold rounded-xl py-3 min-h-[48px] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Menyimpan...
              </>
            ) : merchantProfile ? (
              "Simpan Perubahan"
            ) : (
              "Lengkapi Profil Warung"
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};
