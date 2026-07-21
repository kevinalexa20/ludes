import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  UtensilsCrossed,
  MessageCircle,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

import { useFoodItems } from "@/features/browse/hooks/use-food-items";
import { CategoryFilter } from "@/features/browse/components/category-filter";
import { FoodCard } from "@/features/browse/components/food-card";
import { calculateDistance } from "@/lib/location";

export const HomePage = () => {
  // State for search, category, sort, and geolocation
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date"); // 'date' | 'price' | 'distance'
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [limit, setLimit] = useState<number>(12);

  // Request Geolocation on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error or permission denied:", error);
          toast("Aktifkan lokasi untuk lihat makanan terdekat", {
            icon: "📍",
            duration: 4000,
          });
        },
        { timeout: 10000 }
      );
    }
  }, []);

  // Fetch food items using custom hook
  const foodState = useFoodItems({
    category: selectedCategory === "Semua" ? undefined : selectedCategory,
    sort: sortBy,
    limit,
    lat: userLocation?.latitude,
    lng: userLocation?.longitude,
    search: searchQuery.trim() || undefined,
  });

  // Client-side filtering and sorting if needed as fallback
  const getProcessedItems = () => {
    if (foodState.status !== "success" && foodState.status !== "loading") {
      return [];
    }
    const rawItems = foodState.status === "success" ? foodState.data : foodState.data || [];

    let result = [...rawItems];

    // Filter by search query if client-side fallback needed
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.merchant?.name.toLowerCase().includes(query)
      );
    }

    // Client-side distance sorting if user location is available and sortBy is 'distance'
    if (sortBy === "distance" && userLocation) {
      result.sort((a, b) => {
        const distA = a.merchant
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              a.merchant.latitude,
              a.merchant.longitude
            )
          : 999999;
        const distB = b.merchant
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              b.merchant.latitude,
              b.merchant.longitude
            )
          : 999999;
        return distA - distB;
      });
    } else if (sortBy === "price") {
      result.sort((a, b) => a.final_price - b.final_price);
    } else if (sortBy === "date") {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }

    return result;
  };

  const processedItems = getProcessedItems();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
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
    <div className="flex flex-col min-h-screen bg-brand-neutral-50 text-brand-neutral-900 font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-brand-green-50/80 via-brand-green-50/30 to-brand-neutral-50 py-12 md:py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-5 text-center md:text-left items-center md:items-start"
          >
            <span className="inline-flex items-center gap-1.5 bg-brand-green-100 text-brand-green-700 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              ✨ Solusi Food Waste UMKM Kaki Lima
            </span>
            
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-neutral-950 leading-tight">
              Makan enak, <br />
              <span className="text-brand-green-500">harga hemat.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-brand-neutral-600 max-w-md">
              Selamatkan makanan dari tempat sampah. Temukan makanan surplus dari warung terdekat dengan diskon 20-50%.
            </p>
            
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="#makanan-terdekat"
              className="inline-flex items-center justify-center bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700 text-white font-semibold rounded-2xl px-8 py-4 shadow-md transition-all text-center text-base"
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
            <div className="text-[120px] md:text-[160px] select-none animate-bounce" style={{ animationDuration: "3s" }}>
              🍛
            </div>
            <div className="absolute bottom-2 bg-white/95 backdrop-blur px-5 py-3 rounded-2xl shadow-lg border border-brand-neutral-100 flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <div className="text-left">
                <p className="text-xs text-brand-neutral-500 font-medium">Bantu Kurangi</p>
                <p className="text-sm font-bold text-brand-neutral-950">Food Waste Indonesia</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-14 bg-white border-y border-brand-neutral-100">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-neutral-950 mb-10">
            Cara Kerja Ludes
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-brand-neutral-50 border border-brand-neutral-100 transition-all hover:shadow-sm"
              >
                <div className="h-12 w-12 rounded-2xl bg-brand-green-50 flex items-center justify-center">
                  {step.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-brand-neutral-950">
                  {step.title}
                </h3>
                <p className="text-sm text-brand-neutral-600 max-w-xs leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Food Listings Grid Section */}
      <section id="makanan-terdekat" className="py-12 max-w-6xl mx-auto px-4 w-full">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-neutral-950">
                Makanan Tersedia Hari Ini
              </h2>
              <p className="text-sm text-brand-neutral-600 mt-1">
                Makanan surplus segar dari warung terdekat. Pesan sebelum habis!
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <SlidersHorizontal size={16} className="text-brand-neutral-500" />
              <span className="text-xs text-brand-neutral-500 font-medium">Urutkan:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-brand-neutral-200 text-brand-neutral-800 text-sm rounded-xl px-3.5 py-2 pr-8 font-medium focus:outline-none focus:border-brand-green-500 cursor-pointer shadow-sm"
                >
                  <option value="date">Terbaru</option>
                  <option value="price">Termurah</option>
                  {userLocation && <option value="distance">Terdekat</option>}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Search bar & Category filters */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nasi goreng, bakso, kue, dll..."
                className="w-full bg-white border border-brand-neutral-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-brand-neutral-900 placeholder:text-brand-neutral-400 focus:outline-none focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 transition-all shadow-sm"
              />
            </div>

            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />
          </div>
        </div>

        {/* Loading State Skeleton */}
        {foodState.status === "loading" && (!foodState.data || foodState.data.length === 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-brand-neutral-100 shadow-sm animate-pulse h-72 flex flex-col"
              >
                <div className="bg-brand-neutral-200 aspect-[4/3] w-full" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="bg-brand-neutral-200 h-4 rounded w-3/4" />
                    <div className="bg-brand-neutral-100 h-3 rounded w-1/2" />
                  </div>
                  <div className="bg-brand-neutral-200 h-5 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {foodState.status === "error" && (
          <div className="bg-white rounded-3xl p-8 border border-brand-neutral-100 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">⚠️</span>
            <h3 className="font-display text-lg font-bold text-brand-neutral-950">
              Gagal Memuat Makanan
            </h3>
            <p className="text-sm text-brand-neutral-600 max-w-sm">
              {foodState.error.message || "Terjadi kesalahan saat menghubungkan ke server."}
            </p>
          </div>
        )}

        {/* Food Items Grid */}
        {(foodState.status === "success" || (foodState.status === "loading" && foodState.data)) && (
          <>
            {processedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {processedItems.map((item, index) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    index={index}
                    userLocation={userLocation}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-12 border border-brand-neutral-100 flex flex-col items-center justify-center text-center gap-4 my-6"
              >
                <span className="text-6xl animate-pulse">🍱</span>
                <h3 className="font-display text-xl font-bold text-brand-neutral-950 mt-2">
                  Belum ada makanan tersedia di sekitarmu
                </h3>
                <p className="text-sm text-brand-neutral-600 max-w-sm">
                  Saat ini belum ada warung terdekat yang memposting surplus makanan untuk kategori ini. Coba ganti filter atau cek lagi nanti ya!
                </p>
              </motion.div>
            )}

            {/* Load More Button */}
            {foodState.status === "success" && foodState.total > processedItems.length && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setLimit((prev) => prev + 12)}
                  className="bg-white border border-brand-neutral-200 hover:bg-brand-neutral-50 active:bg-brand-neutral-100 text-brand-neutral-800 font-semibold px-6 py-3 rounded-xl transition-all shadow-sm text-sm"
                >
                  Muat Lebih Banyak Makanan
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
