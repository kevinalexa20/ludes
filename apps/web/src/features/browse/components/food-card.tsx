import React from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Store, MapPin, UtensilsCrossed } from "lucide-react";
import { FoodItem } from "@ludes/shared";
import { calculateDistance, formatDistance } from "@/lib/location";

interface FoodCardProps {
  item: FoodItem;
  index: number;
  userLocation?: { latitude: number; longitude: number } | null;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, index, userLocation }) => {
  // Calculate discount percentage
  const discountPct = Math.round(
    ((item.original_price - item.final_price) / item.original_price) * 100
  );

  const isSoldOut = item.status === "sold_out" || item.quantity <= 0;

  // Stagger variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.05,
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Calculate distance if coordinates are available
  let distanceText = "Hubungi via WA";
  if (userLocation && item.merchant && item.merchant.latitude && item.merchant.longitude) {
    const dist = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      item.merchant.latitude,
      item.merchant.longitude
    );
    distanceText = formatDistance(dist);
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={!isSoldOut ? { y: -4 } : undefined}
      whileTap={!isSoldOut ? { scale: 0.98 } : undefined}
      className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-neutral-100 transition-all duration-200 flex flex-col h-full cursor-pointer group"
    >
      <Link
        to="/food/$foodId"
        params={{ foodId: item.id }}
        className="flex flex-col h-full"
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 flex items-center justify-center">
          {item.picture_url ? (
            <img
              src={item.picture_url}
              alt={item.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-400">
              <UtensilsCrossed size={40} className="stroke-[1.5]" />
              <span className="text-xs font-medium">Tidak ada foto</span>
            </div>
          )}

          {/* Discount Badge */}
          {discountPct > 0 && !isSoldOut && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              Hemat {discountPct}%
            </div>
          )}

          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-neutral-800 text-white font-bold text-sm px-4 py-2 rounded-xl border border-neutral-700 uppercase tracking-wide">
                Habis Ludes
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-lexend font-semibold text-neutral-950 text-base line-clamp-1 group-hover:text-green-600 transition-colors">
              {item.name}
            </h3>
            
            {item.description && (
              <p className="text-xs text-neutral-600 line-clamp-2 min-h-[2rem]">
                {item.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            {/* Price Row */}
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-lg font-bold text-neutral-950">
                Rp {item.final_price.toLocaleString("id-ID")}
              </span>
              
              {discountPct > 0 && (
                <span className="text-xs text-neutral-400 line-through">
                  Rp {item.original_price.toLocaleString("id-ID")}
                </span>
              )}
            </div>

            <div className="border-t border-neutral-100 pt-2 flex flex-col gap-1">
              {/* Merchant name */}
              {item.merchant && (
                <div className="flex items-center gap-1.5 text-neutral-600 text-xs">
                  <Store size={14} className="text-neutral-400 shrink-0" />
                  <span className="font-medium line-clamp-1">
                    {item.merchant.name}
                  </span>
                </div>
              )}

              {/* Distance */}
              {item.merchant && (
                <div className="flex items-center gap-1.5 text-neutral-600 text-xs">
                  <MapPin size={14} className="text-neutral-400 shrink-0" />
                  <span className="text-neutral-500 font-medium">
                    {distanceText}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
