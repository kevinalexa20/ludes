import React from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, UtensilsCrossed, MessageCircle } from "lucide-react";

export const HomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const steps = [
    {
      icon: <MapPin className="text-brand-green-600" size={24} />,
      title: "Cari Makanan Murah",
      desc: "Temukan warung makan kaki lima terdekat yang memiliki surplus makanan.",
    },
    {
      icon: <UtensilsCrossed className="text-brand-green-600" size={24} />,
      title: "Pilih Makanan",
      desc: "Lihat menu lezat yang masih layak konsumsi dengan diskon 20-50%.",
    },
    {
      icon: <MessageCircle className="text-brand-green-600" size={24} />,
      title: "Pesan & Ambil",
      desc: "Pesan langsung via WhatsApp, bayar saat ambil makanan di lokasi.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-brand-green-50 to-transparent py-16 md:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-6 text-center md:text-left items-center md:items-start"
          >
            <span className="inline-flex items-center gap-1 bg-brand-green-100 text-brand-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              ✨ Solusi Food Waste UMKM
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-brand-neutral-950 leading-tight">
              Makan enak, <br />
              <span className="text-brand-green-500">harga hemat.</span>
            </h1>
            <p className="text-lg text-brand-neutral-600 max-w-md">
              Selamatkan makanan lezat dari tempat sampah. Temukan surplus makanan dari warung terdekat dengan diskon 20-50%.
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#makanan-terdekat"
              className="inline-block bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700 text-white font-semibold rounded-2xl px-8 py-4 shadow-md transition-all text-center"
            >
              Cari Makanan Terdekat
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="text-[120px] md:text-[180px] select-none animate-bounce" style={{ animationDuration: '3s' }}>
              🍛
            </div>
            <div className="absolute bottom-4 bg-white/95 backdrop-blur px-4 py-2.5 rounded-2xl shadow-lg border border-brand-neutral-100 flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <div className="text-left">
                <p className="text-xs text-brand-neutral-600 font-medium">Bantu Kurangi</p>
                <p className="text-sm font-bold text-brand-neutral-950">Food Waste Indonesia</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-white border-y border-brand-neutral-100">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-neutral-950 mb-12">
            Cara Kerja Ludes
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-brand-neutral-50 border border-brand-neutral-100 transition-all hover:shadow-sm"
              >
                <div className="h-12 w-12 rounded-full bg-brand-green-50 flex items-center justify-center">
                  {step.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-brand-neutral-950">
                  {step.title}
                </h3>
                <p className="text-sm text-brand-neutral-600 max-w-xs">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Food Listings Grid Section */}
      <section id="makanan-terdekat" className="py-16 max-w-6xl mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="text-center md:text-left">
            <h2 className="font-display text-2xl font-bold text-brand-neutral-950">
              Makanan Tersedia Hari Ini
            </h2>
            <p className="text-sm text-brand-neutral-600 mt-1">
              Makanan surplus segar, diposting langsung oleh warung sekitar kamu.
            </p>
          </div>
        </div>

        {/* Placeholder / Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-12 border border-brand-neutral-100 flex flex-col items-center justify-center text-center gap-4"
        >
          <span className="text-5xl animate-pulse">🍱</span>
          <h3 className="font-display text-xl font-bold text-brand-neutral-950 mt-2">
            Belum ada makanan tersedia
          </h3>
          <p className="text-sm text-brand-neutral-600 max-w-sm">
            Saat ini belum ada warung terdekat yang memposting surplus makanan. Coba segarkan halaman atau cek lagi nanti ya!
          </p>
        </motion.div>
      </section>
    </div>
  );
};
