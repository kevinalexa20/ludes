import React, { useState } from "react";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Store,
  MapPin,
  Clock,
  MessageCircle,
  Plus,
  Minus,
  UtensilsCrossed,
} from "lucide-react";
import toast from "react-hot-toast";

import { useFoodItemById } from "../hooks/use-food-items";
import { generateWAOrderUrl } from "@/lib/wa-order";

export const FoodDetailPage = () => {
  const { foodId } = useParams({ from: "/food/$foodId" });
  const navigate = useNavigate();
  const foodState = useFoodItemById(foodId);
  const [quantity, setQuantity] = useState<number>(1);

  // Back action fallback
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/" });
    }
  };

  // Share action using Web Share API or Clipboard fallback
  const handleShare = async () => {
    if (foodState.status !== "success") return;
    const food = foodState.data;
    
    const shareData = {
      title: `Ludes - ${food.name}`,
      text: `Selamatkan ${food.name} dari warung ${food.merchant?.name || "terdekat"} dengan harga diskon!`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link berhasil disalin ke papan klip!");
      }
    } catch (err) {
      console.log("Error sharing:", err);
      // Fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link berhasil disalin ke papan klip!");
      } catch (clipErr) {
        toast.error("Gagal menyalin link.");
      }
    }
  };

  if (foodState.status === "loading") {
    return (
      <div className="min-h-screen bg-brand-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-green-500 border-t-transparent" />
      </div>
    );
  }

  if (foodState.status === "error") {
    return (
      <div className="min-h-screen bg-brand-neutral-50 flex flex-col items-center justify-center p-4 text-center gap-4">
        <span className="text-5xl">⚠️</span>
        <h2 className="font-display text-xl font-bold text-brand-neutral-950">
          Makanan Tidak Ditemukan
        </h2>
        <p className="text-sm text-brand-neutral-600 max-w-sm">
          {foodState.error.message || "Gagal memuat informasi detail makanan."}
        </p>
        <button
          onClick={handleBack}
          className="bg-brand-green-500 hover:bg-brand-green-600 text-white font-semibold rounded-xl px-6 py-3 shadow-sm transition-all"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  if (foodState.status !== "success") return null;

  const food = foodState.data;
  const merchant = food.merchant;
  const discountPct = Math.round(
    ((food.original_price - food.final_price) / food.original_price) * 100
  );
  const isSoldOut = food.status === "sold_out" || food.quantity <= 0;

  // Handle WhatsApp message redirection
  const handleOrder = () => {
    if (isSoldOut || !merchant) return;
    const url = generateWAOrderUrl(food, merchant, quantity);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleIncrement = () => {
    if (quantity < food.quantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const totalPrice = food.final_price * quantity;

  return (
    <div className="min-h-screen bg-brand-neutral-50 pb-28 md:pb-12 text-brand-neutral-900 font-sans">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-brand-neutral-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-brand-neutral-100 rounded-full transition-colors focus:outline-none cursor-pointer"
          aria-label="Kembali"
        >
          <ArrowLeft size={22} className="text-brand-neutral-800" />
        </button>
        <h1 className="font-display font-bold text-brand-neutral-950 text-base md:text-lg">
          Detail Makanan
        </h1>
        <button
          onClick={handleShare}
          className="p-2 hover:bg-brand-neutral-100 rounded-full transition-colors focus:outline-none cursor-pointer"
          aria-label="Bagikan"
        >
          <Share2 size={20} className="text-brand-neutral-800" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-0 md:px-4 py-0 md:py-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Side: Image Container */}
        <div className="relative aspect-[4/3] md:aspect-[16/9] w-full overflow-hidden bg-brand-neutral-100 md:rounded-2xl border border-brand-neutral-200 shadow-sm">
          {food.picture_url ? (
            <img
              src={food.picture_url}
              alt={food.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full gap-3 text-brand-neutral-400">
              <UtensilsCrossed size={64} className="stroke-[1.2]" />
              <span className="text-sm font-medium">Tidak ada foto makanan</span>
            </div>
          )}

          {isSoldOut && (
            <div className="absolute inset-0 bg-brand-neutral-900/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-brand-neutral-800 text-white font-bold text-lg px-6 py-3 rounded-2xl border border-brand-neutral-700 uppercase tracking-wider">
                Habis Ludes
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Details Info */}
        <div className="px-4 md:px-0 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="bg-brand-green-50 text-brand-green-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {food.category}
              </span>
              
              {isSoldOut ? (
                <span className="bg-brand-neutral-200 text-brand-neutral-600 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Habis Ludes
                </span>
              ) : (
                <span className="bg-brand-green-100 text-brand-green-800 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Tersedia ({food.quantity} porsi)
                </span>
              )}
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-brand-neutral-950 leading-tight">
              {food.name}
            </h2>

            {/* Price Area */}
            <div className="bg-white rounded-2xl p-4 border border-brand-neutral-100 shadow-sm space-y-1">
              <div className="flex items-center gap-2">
                {discountPct > 0 && (
                  <span className="bg-orange-100 text-orange-500 text-xs font-bold px-2.5 py-1 rounded-full">
                    Hemat {discountPct}%
                  </span>
                )}
                
                {discountPct > 0 && (
                  <span className="text-sm text-brand-neutral-400 line-through font-medium">
                    Rp {food.original_price.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              <div className="text-3xl font-extrabold text-brand-neutral-950">
                Rp {food.final_price.toLocaleString("id-ID")}
                <span className="text-sm text-brand-neutral-500 font-normal"> / porsi</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {food.description && (
            <div className="space-y-2">
              <h3 className="font-display font-bold text-brand-neutral-950 text-base">
                Deskripsi Makanan
              </h3>
              <p className="text-brand-neutral-600 text-sm leading-relaxed bg-white rounded-2xl p-4 border border-brand-neutral-100 shadow-sm">
                {food.description}
              </p>
            </div>
          )}

          {/* Pickup time */}
          <div className="bg-white rounded-2xl p-4 border border-brand-neutral-100 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-green-50 text-brand-green-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-brand-neutral-500 font-medium">Waktu Pengambilan</p>
              <p className="text-sm font-bold text-brand-neutral-950">
                {food.pickup_time || "Hubungi penjual secepatnya"}
              </p>
            </div>
          </div>

          {/* Merchant Card */}
          {merchant && (
            <div className="bg-white rounded-2xl p-4 border border-brand-neutral-100 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-neutral-100 text-brand-neutral-600 flex items-center justify-center shrink-0">
                  <Store size={20} />
                </div>
                <div>
                  <p className="text-xs text-brand-neutral-500 font-medium font-display">Warung Mitra Ludes</p>
                  <p className="text-sm font-bold text-brand-neutral-950">{merchant.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 text-brand-neutral-600 text-xs pl-0.5">
                <MapPin size={16} className="text-brand-neutral-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{merchant.address}</span>
              </div>
            </div>
          )}

          {/* Desktop Only Ordering Area */}
          {!isSoldOut && (
            <div className="hidden md:block bg-white rounded-2xl p-4 border border-brand-neutral-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-brand-neutral-700">Jumlah Pesanan</span>
                
                {/* Quantity Selector */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-xl border border-brand-neutral-200 hover:bg-brand-neutral-50 active:bg-brand-neutral-100 flex items-center justify-center disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold text-brand-neutral-900 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= food.quantity}
                    className="h-10 w-10 rounded-xl border border-brand-neutral-200 hover:bg-brand-neutral-50 active:bg-brand-neutral-100 flex items-center justify-center disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                    aria-label="Tambah jumlah"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="border-t border-brand-neutral-100 pt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-brand-neutral-500">Total Harga:</span>
                <span className="text-xl font-extrabold text-brand-green-600">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              <button
                onClick={handleOrder}
                className="w-full bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1ca34e] text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all text-base"
              >
                <MessageCircle size={20} />
                Pesan via WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {!isSoldOut && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-brand-neutral-100 p-4 shadow-lg md:hidden flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-brand-neutral-400 font-medium">Total Harga</span>
              <span className="text-lg font-extrabold text-brand-green-600">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Mobile Quantity Selector */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="h-9 w-9 rounded-xl border border-brand-neutral-200 hover:bg-brand-neutral-50 flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer"
              >
                <Minus size={14} />
              </button>
              <span className="font-bold text-brand-neutral-900 text-sm">
                {quantity} porsi
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= food.quantity}
                className="h-9 w-9 rounded-xl border border-brand-neutral-200 hover:bg-brand-neutral-50 flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            onClick={handleOrder}
            className="w-full bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1ca34e] text-white font-bold rounded-2xl py-4 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all text-base"
          >
            <MessageCircle size={20} />
            Pesan via WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};
