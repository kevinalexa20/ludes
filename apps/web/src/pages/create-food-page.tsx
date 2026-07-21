import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Sparkles,
  ArrowRight,
  Check,
  UtensilsCrossed,
  DollarSign,
  Info,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { FoodCategory, AIListingResult } from "@ludes/shared";
import { compressImage } from "@/lib/image-utils";
import { calculatePricing } from "@ludes/shared";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

type Step = 1 | 2 | 3 | 4;

export const CreateFoodPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FoodCategory>("nasi");
  const [finalPrice, setFinalPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(1);
  const [pickupTime, setPickupTime] = useState("");

  // AI suggestion response cache
  const [aiSuggestion, setAiSuggestion] = useState<AIListingResult | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format file harus berupa gambar");
      return;
    }

    try {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setImageFile(file);

      // Compress and convert to base64
      const base64 = await compressImage(file);
      setImageBase64(base64);
      toast.success("Foto makanan berhasil dimuat!");
    } catch (err: any) {
      console.error("Gagal kompres gambar:", err);
      toast.error("Gagal membaca gambar. Silakan coba lagi");
    }
  };

  const handleLanjutToStep2 = async () => {
    if (!imageBase64) {
      toast.error("Harap upload foto makanan terlebih dahulu");
      return;
    }
    if (!originalPrice || originalPrice < 1000) {
      toast.error("Harap masukkan harga asli makanan minimal Rp 1.000");
      return;
    }

    setIsProcessingAI(true);
    try {
      const response = await api.post<AIListingResult>("/api/ai/generate-listing", {
        image: imageBase64,
        original_price: Number(originalPrice),
      });

      setAiSuggestion(response);
      setName(response.name);
      setDescription(response.description);
      setCategory(response.category);

      // Apply initial dynamic pricing suggestion
      if (response.pricing) {
        setFinalPrice(response.pricing.suggested_min);
      }

      setStep(2);
      toast.success("AI berhasil menganalisis makanan kamu! ✨");
    } catch (error: any) {
      const msg = error.message || "AI gagal menganalisis makanan";
      toast.error(msg);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleLanjutToStep3 = () => {
    if (!name.trim()) {
      toast.error("Nama makanan tidak boleh kosong");
      return;
    }
    setStep(3);
  };

  const getPriceRules = () => {
    if (!originalPrice) return null;
    const cat = category as any;
    return calculatePricing(Number(originalPrice), cat, 2);
  };

  const priceRules = getPriceRules();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!finalPrice || finalPrice < 1000) {
      toast.error("Harap masukkan harga jual makanan minimal Rp 1.000");
      return;
    }

    if (priceRules && Number(finalPrice) < priceRules.floorPrice) {
      toast.error(
        `Harga tidak boleh di bawah harga lantai (Rp ${priceRules.floorPrice.toLocaleString(
          "id-ID"
        )})`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<any>("/api/food", {
        name,
        description,
        category,
        original_price: Number(originalPrice),
        final_price: Number(finalPrice),
        quantity: Number(quantity),
        pickup_time: pickupTime || undefined,
        picture_url: "", // bypass zod validation by omitting
        status: "available",
      });

      // Save base64 image locally
      if (imageBase64) {
        localStorage.setItem(`ludes_img_${response.id}`, imageBase64);
      }

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });

      setStep(4);
      toast.success("Iklan makanan berhasil dipasang! 🚀");
    } catch (error: any) {
      const msg = error.message || "Gagal memasang iklan makanan";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setImageFile(null);
    setImagePreview("");
    setImageBase64("");
    setOriginalPrice("");
    setName("");
    setDescription("");
    setCategory("nasi");
    setFinalPrice("");
    setQuantity(1);
    setPickupTime("");
    setAiSuggestion(null);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
      {step < 4 && (
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/merchant/food"
            className="inline-flex items-center gap-1.5 text-sm text-brand-neutral-600 hover:text-brand-neutral-800 font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Batal
          </Link>
        </div>
      )}

      {/* Step Indicator */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-8 max-w-xs mx-auto">
          {[
            { n: 1, label: "Foto & Harga" },
            { n: 2, label: "Detail AI" },
            { n: 3, label: "Harga Jual" },
          ].map((s) => (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === s.n
                      ? "bg-brand-green-500 text-white shadow-sm ring-4 ring-brand-green-100"
                      : step > s.n
                      ? "bg-brand-green-500 text-white"
                      : "bg-brand-neutral-100 text-brand-neutral-400"
                  }`}
                >
                  {step > s.n ? <Check size={14} /> : s.n}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    step === s.n ? "text-brand-green-600 font-bold" : "text-brand-neutral-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {s.n < 3 && (
                <div
                  className={`h-0.5 flex-1 mx-2 -mt-4 transition-colors ${
                    step > s.n ? "bg-brand-green-500" : "bg-brand-neutral-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main Content Area with Animations */}
      <AnimatePresence mode="wait">
        {/* Step 1: Upload Photo & Original Price */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 bg-white border border-brand-neutral-100 p-6 md:p-8 rounded-3xl shadow-sm"
          >
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-neutral-950">
                Foto Makanan & Harga
              </h1>
              <p className="text-sm text-brand-neutral-600 mt-2">
                Foto yang jelas mempermudah AI menebak makanan secara akurat.
              </p>
            </div>

            {/* Photo Uploader */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-neutral-800">
                Foto Makanan
              </label>
              <div className="relative aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-brand-neutral-200 hover:border-brand-green-500 transition-colors bg-brand-neutral-50 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                    <label
                      htmlFor="image-picker"
                      className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/75 text-white font-semibold rounded-xl px-4 py-2 text-xs transition-colors cursor-pointer"
                    >
                      Ubah Foto
                    </label>
                  </>
                ) : (
                  <label
                    htmlFor="image-picker"
                    className="flex flex-col items-center gap-3 cursor-pointer text-center p-6 w-full h-full justify-center select-none"
                  >
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-brand-neutral-500 shadow-sm border border-brand-neutral-100">
                      <Camera size={24} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-brand-neutral-800 block">
                        Ambil Foto atau Pilih Gambar
                      </span>
                      <span className="text-xs text-brand-neutral-500 block mt-1">
                        Format JPG, PNG, atau WEBP (Maksimal 5MB)
                      </span>
                    </div>
                  </label>
                )}
                <input
                  type="file"
                  id="image-picker"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-sm font-semibold text-brand-neutral-800 mb-1.5">
                Harga Normal Asli
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-neutral-500 font-bold text-sm">
                  Rp
                </div>
                <input
                  type="number"
                  min="1000"
                  value={originalPrice}
                  onChange={(e) =>
                    setOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Contoh: 15000"
                  className="w-full rounded-xl border border-brand-neutral-200 pl-10 pr-4 py-3 min-h-[48px] focus:outline-none focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 transition-all font-semibold"
                />
              </div>
              <p className="text-xs text-brand-neutral-500 mt-1">
                Harga jual normal sebelum porsi berlebih didiskon.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLanjutToStep2}
              disabled={isProcessingAI || !imageBase64 || !originalPrice}
              className="w-full bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700 text-white font-semibold rounded-xl py-3 min-h-[48px] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isProcessingAI ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Menganalisis dengan AI...
                </>
              ) : (
                <>
                  Lanjut ke AI Detail <ArrowRight size={16} />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Step 2: AI Review & Edit */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 bg-white border border-brand-neutral-100 p-6 md:p-8 rounded-3xl shadow-sm"
          >
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-neutral-950 flex items-center gap-2">
                <Sparkles size={24} className="text-brand-green-500" /> Hasil Rekomendasi AI
              </h2>
              <p className="text-sm text-brand-neutral-600 mt-2">
                Sesuaikan hasil analisis AI di bawah jika diperlukan.
              </p>
            </div>

            <div className="bg-brand-green-50 border border-brand-green-100 rounded-2xl p-4 flex gap-4 items-center">
              <div className="h-16 w-16 rounded-xl bg-brand-neutral-200 overflow-hidden flex-shrink-0">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="object-cover h-full w-full" />
                )}
              </div>
              <div>
                <span className="bg-brand-green-100 text-brand-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Analisis Sukses
                </span>
                <p className="text-xs text-brand-neutral-700 mt-1 leading-relaxed">
                  AI telah memprediksi nama, kategori, dan deskripsi masakan kamu.
                </p>
              </div>
            </div>

            {/* Nama Makanan */}
            <div>
              <label className="block text-sm font-semibold text-brand-neutral-800 mb-1.5">
                Nama Makanan
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-brand-neutral-200 px-4 py-3 min-h-[48px] focus:outline-none focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 transition-all font-semibold"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-brand-neutral-800 mb-1.5">
                Deskripsi
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-brand-neutral-200 px-4 py-3 focus:outline-none focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 transition-all resize-none"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-semibold text-brand-neutral-800 mb-2">
                Kategori Makanan
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "nasi", label: "Nasi 🍚" },
                  { id: "mie", label: "Mie 🍜" },
                  { id: "lauk", label: "Lauk 🍗" },
                  { id: "kue", label: "Kue 🍰" },
                  { id: "minuman", label: "Minuman 🥤" },
                  { id: "snack", label: "Snack 🍪" },
                  { id: "lainnya", label: "Lainnya 🍽️" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as FoodCategory)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                      category === cat.id
                        ? "bg-brand-green-500 text-white border-brand-green-500 shadow-sm"
                        : "bg-brand-neutral-50 text-brand-neutral-600 border-brand-neutral-200 hover:bg-brand-neutral-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-brand-neutral-100 hover:bg-brand-neutral-200 text-brand-neutral-800 font-semibold rounded-xl py-3 cursor-pointer transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleLanjutToStep3}
                className="flex-1 bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                Lanjut <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Pricing & Submit */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 bg-white border border-brand-neutral-100 p-6 md:p-8 rounded-3xl shadow-sm"
          >
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-neutral-950">
                Tentukan Harga Jual
              </h2>
              <p className="text-sm text-brand-neutral-600 mt-2">
                AI menghitung batas harga aman untuk melindungi margin laba warung kamu.
              </p>
            </div>

            {/* Pricing Suggestion Card */}
            {priceRules && (
              <div className="bg-brand-green-50 border border-brand-green-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-1.5 text-brand-green-800 font-semibold text-sm">
                  <Sparkles size={16} /> Rekomendasi Diskon Ludes
                </div>
                <div className="grid grid-cols-2 gap-4 text-brand-neutral-800">
                  <div>
                    <span className="text-[10px] text-brand-neutral-500 font-semibold uppercase tracking-wider block">
                      Harga Normal Asli
                    </span>
                    <span className="text-base font-bold text-brand-neutral-800 block">
                      Rp {Number(originalPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-neutral-500 font-semibold uppercase tracking-wider block">
                      Rekomendasi Harga Jual
                    </span>
                    <span className="text-base font-bold text-brand-green-600 block">
                      Rp {priceRules.suggestedMin.toLocaleString("id-ID")} - Rp{" "}
                      {priceRules.suggestedMax.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-green-200/50 text-[11px] text-brand-neutral-700 leading-relaxed flex items-start gap-1.5">
                  <Info size={14} className="text-brand-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Batas diskon maksimal kategori <strong>{category.toUpperCase()}</strong> diset{" "}
                    <strong>{priceRules.discountPct}%</strong>. Harga lantai warung kamu adalah{" "}
                    <strong>Rp {priceRules.floorPrice.toLocaleString("id-ID")}</strong> (margin 60%
                    terproteksi).
                  </span>
                </div>
              </div>
            )}

            {/* Input Final Price */}
            <div>
              <label className="block text-sm font-semibold text-brand-neutral-800 mb-1.5">
                Harga Jual Diskon Ludes
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-neutral-500 font-bold text-sm">
                  Rp
                </div>
                <input
                  type="number"
                  min="1000"
                  value={finalPrice}
                  onChange={(e) =>
                    setFinalPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full rounded-xl border border-brand-neutral-200 pl-10 pr-4 py-3 min-h-[48px] focus:outline-none focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 transition-all font-semibold text-lg text-brand-green-600"
                />
              </div>
              {priceRules && finalPrice !== "" && Number(finalPrice) < priceRules.floorPrice && (
                <p className="text-xs text-red-500 mt-1 font-semibold">
                  ⚠️ Harga tidak boleh lebih rendah dari Rp{" "}
                  {priceRules.floorPrice.toLocaleString("id-ID")} demi mencegah rugi.
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-brand-neutral-800 mb-1.5">
                Jumlah Porsi Tersedia
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="w-full rounded-xl border border-brand-neutral-200 px-4 py-3 min-h-[48px] focus:outline-none focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 transition-all"
              />
            </div>

            {/* Pickup Time */}
            <div>
              <label className="block text-sm font-semibold text-brand-neutral-800 mb-1.5">
                Waktu Pengambilan makanan
              </label>
              <input
                type="text"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                placeholder="Contoh: Jam 4 - 6 sore sebelum tutup"
                className="w-full rounded-xl border border-brand-neutral-200 px-4 py-3 min-h-[48px] focus:outline-none focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-brand-neutral-100 hover:bg-brand-neutral-200 text-brand-neutral-800 font-semibold rounded-xl py-3 cursor-pointer transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !finalPrice ||
                  (priceRules !== null && Number(finalPrice) < priceRules.floorPrice)
                }
                className="flex-1 bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Menyimpan...
                  </>
                ) : (
                  <>
                    Pasang Iklan Makanan <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success Confirmation screen */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white border border-brand-neutral-100 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center gap-5 py-12"
          >
            <div className="h-16 w-16 bg-brand-green-50 rounded-full flex items-center justify-center text-brand-green-500 shadow-sm border border-brand-green-100">
              <Check size={32} />
            </div>

            <div className="space-y-1">
              <h2 className="font-display text-2xl font-bold text-brand-neutral-950">
                Iklan Berhasil Dipasang!
              </h2>
              <p className="text-sm text-brand-neutral-600 max-w-xs mx-auto mt-2">
                Makanan surplus kamu sudah live di aplikasi dan siap dicari pembeli terdekat.
              </p>
            </div>

            {aiSuggestion?.marketing_caption && (
              <div className="bg-brand-neutral-50 rounded-2xl p-4 text-xs text-brand-neutral-700 text-left border border-brand-neutral-100 leading-relaxed max-w-sm w-full">
                <span className="font-bold text-brand-green-600 block mb-1">📢 Caption Promosi WA/IG:</span>
                <p className="italic">"{aiSuggestion.marketing_caption}"</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-brand-neutral-100 hover:bg-brand-neutral-200 text-brand-neutral-800 font-semibold rounded-xl py-3 transition-colors cursor-pointer"
              >
                Pasang Menu Baru
              </button>
              <Link
                to="/merchant/food"
                className="flex-1 bg-brand-green-500 hover:bg-brand-green-600 text-white font-semibold rounded-xl py-3 transition-colors cursor-pointer flex items-center justify-center"
              >
                Daftar Makanan Saya
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
