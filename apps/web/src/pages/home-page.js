import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
                type: "spring",
                stiffness: 100,
                damping: 15,
            },
        },
    };
    const steps = [
        {
            icon: _jsx(MapPin, { className: "text-brand-green-600", size: 24 }),
            title: "Cari Makanan Murah",
            desc: "Temukan warung makan kaki lima terdekat yang memiliki surplus makanan.",
        },
        {
            icon: _jsx(UtensilsCrossed, { className: "text-brand-green-600", size: 24 }),
            title: "Pilih Makanan",
            desc: "Lihat menu lezat yang masih layak konsumsi dengan diskon 20-50%.",
        },
        {
            icon: _jsx(MessageCircle, { className: "text-brand-green-600", size: 24 }),
            title: "Pesan & Ambil",
            desc: "Pesan langsung via WhatsApp, bayar saat ambil makanan di lokasi.",
        },
    ];
    return (_jsxs("div", { className: "flex flex-col min-h-screen", children: [_jsx("section", { className: "relative bg-gradient-to-b from-brand-green-50 to-transparent py-16 md:py-24 overflow-hidden", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center", children: [_jsxs(motion.div, { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5, ease: "easeOut" }, className: "flex flex-col gap-6 text-center md:text-left items-center md:items-start", children: [_jsx("span", { className: "inline-flex items-center gap-1 bg-brand-green-100 text-brand-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider", children: "\u2728 Solusi Food Waste UMKM" }), _jsxs("h1", { className: "font-display text-4xl md:text-5xl font-extrabold text-brand-neutral-950 leading-tight", children: ["Makan enak, ", _jsx("br", {}), _jsx("span", { className: "text-brand-green-500", children: "harga hemat." })] }), _jsx("p", { className: "text-lg text-brand-neutral-600 max-w-md", children: "Selamatkan makanan lezat dari tempat sampah. Temukan surplus makanan dari warung terdekat dengan diskon 20-50%." }), _jsx(motion.a, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, href: "#makanan-terdekat", className: "inline-block bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700 text-white font-semibold rounded-2xl px-8 py-4 shadow-md transition-all text-center", children: "Cari Makanan Terdekat" })] }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5, delay: 0.2 }, className: "relative flex justify-center", children: [_jsx("div", { className: "text-[120px] md:text-[180px] select-none animate-bounce", style: { animationDuration: '3s' }, children: "\uD83C\uDF5B" }), _jsxs("div", { className: "absolute bottom-4 bg-white/95 backdrop-blur px-4 py-2.5 rounded-2xl shadow-lg border border-brand-neutral-100 flex items-center gap-2", children: [_jsx("span", { className: "text-2xl", children: "\uD83C\uDF31" }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-xs text-brand-neutral-600 font-medium", children: "Bantu Kurangi" }), _jsx("p", { className: "text-sm font-bold text-brand-neutral-950", children: "Food Waste Indonesia" })] })] })] })] }) }), _jsx("section", { className: "py-16 bg-white border-y border-brand-neutral-100", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 text-center", children: [_jsx("h2", { className: "font-display text-2xl md:text-3xl font-bold text-brand-neutral-950 mb-12", children: "Cara Kerja Ludes" }), _jsx(motion.div, { variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-100px" }, className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: steps.map((step, idx) => (_jsxs(motion.div, { variants: itemVariants, className: "flex flex-col items-center gap-4 p-6 rounded-2xl bg-brand-neutral-50 border border-brand-neutral-100 transition-all hover:shadow-sm", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-brand-green-50 flex items-center justify-center", children: step.icon }), _jsx("h3", { className: "font-display text-lg font-bold text-brand-neutral-950", children: step.title }), _jsx("p", { className: "text-sm text-brand-neutral-600 max-w-xs", children: step.desc })] }, idx))) })] }) }), _jsxs("section", { id: "makanan-terdekat", className: "py-16 max-w-6xl mx-auto px-4 text-center", children: [_jsx("div", { className: "flex flex-col md:flex-row items-center justify-between gap-4 mb-8", children: _jsxs("div", { className: "text-center md:text-left", children: [_jsx("h2", { className: "font-display text-2xl font-bold text-brand-neutral-950", children: "Makanan Tersedia Hari Ini" }), _jsx("p", { className: "text-sm text-brand-neutral-600 mt-1", children: "Makanan surplus segar, diposting langsung oleh warung sekitar kamu." })] }) }), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "bg-white rounded-3xl p-12 border border-brand-neutral-100 flex flex-col items-center justify-center text-center gap-4", children: [_jsx("span", { className: "text-5xl animate-pulse", children: "\uD83C\uDF71" }), _jsx("h3", { className: "font-display text-xl font-bold text-brand-neutral-950 mt-2", children: "Belum ada makanan tersedia" }), _jsx("p", { className: "text-sm text-brand-neutral-600 max-w-sm", children: "Saat ini belum ada warung terdekat yang memposting surplus makanan. Coba segarkan halaman atau cek lagi nanti ya!" })] })] })] }));
};
//# sourceMappingURL=home-page.js.map