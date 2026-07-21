import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";

export const FoodListPage = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-brand-neutral-600 hover:text-brand-neutral-800 mb-6 font-medium">
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>
      
      <div className="bg-white rounded-3xl p-8 border border-brand-neutral-100 shadow-sm text-center flex flex-col items-center gap-4">
        <div className="h-16 w-16 bg-brand-green-50 rounded-full flex items-center justify-center text-brand-green-500 mb-2">
          <Clock size={32} className="animate-pulse" />
        </div>
        <h1 className="font-display text-2xl font-bold text-brand-neutral-950">Daftar Makanan Saya</h1>
        <p className="text-sm text-brand-neutral-600 max-w-xs">
          Halaman daftar iklan makanan Anda sedang dipersiapkan dan akan selesai di Phase 5.
        </p>
        <Link to="/" className="mt-4 bg-brand-green-500 hover:bg-brand-green-600 text-white font-semibold rounded-xl px-6 py-3 cursor-pointer">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};
