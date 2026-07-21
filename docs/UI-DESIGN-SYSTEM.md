# Ludes — UI/UX Design System & Guidelines

## Design Philosophy

**"Sesimple WhatsApp, secerdas AI."**

Ludes dipakai oleh pedagang kaki lima yang gagap teknologi. Setiap pixel, animasi, dan kata harus menjawab satu pertanyaan: **"Apa yang harus saya lakukan sekarang?"**

### Core Principles

1. **Guided, not dumped** — Jangan kasih form kosong. Setiap step ada penjelasan, contoh, dan konfirmasi.
2. **Animate with purpose** — Animasi bukan dekorasi. Animasi = feedback. "Tombol ini berhasil diklik." "Data ini sedang diproses." "Field ini penting."
3. **Copy is the UI** — Untuk pengguna non-teknis, kata-kata lebih penting daripada ikon. Gunakan bahasa Indonesia percakapan, bukan bahasa aplikasi.
4. **Big and obvious** — Touch target minimum 48px. Font minimum 16px body. Warna kontras tinggi.
5. **Celebrate small wins** — Upload foto berhasil? Kasih confetti. Listing pertama dibuat? Kasih celebration. Ini bikin pengguna merasa mampu.

---

## Color System

### Primary Palette

```
Green (Trust, Fresh, "Go")
├── 50:  #F0FDF4  (background highlights)
├── 100: #DCFCE7  (success badges, available status)
├── 200: #BBF7D0  (hover states)
├── 400: #4ADE80  (secondary actions)
├── 500: #22C55E  (PRIMARY — main buttons, links)
├── 600: #16A34A  (hover/active)
└── 700: #15803D  (pressed)

Orange (Urgency, Appetite, CTA)
├── 50:  #FFF7ED  (warning backgrounds)
├── 100: #FFEDD5  (discount badges)
├── 400: #FB923C  (discount percentage text)
├── 500: #F97316  (CTA buttons, sale badges)
└── 600: #EA580C  (hover)
```

### Neutral Palette

```
├── 50:  #FAFAF9  (page background — warm, not cold)
├── 100: #F5F5F4  (card backgrounds)
├── 200: #E7E5E4  (borders, dividers)
├── 400: #A8A29E  (placeholder text, disabled)
├── 600: #57534E  (secondary text)
├── 800: #292524  (primary text)
└── 950: #0C0A09  (headings)
```

### Semantic Colors

```
Success:  #22C55E (green-500)
Warning:  #F59E0B (amber-500)
Error:    #EF4444 (red-500)
Info:     #3B82F6 (blue-500)
Discount: #F97316 (orange-500)
Available:#22C55E (green-500)
SoldOut:  #A8A29E (neutral-400)
```

### Usage Rules

- **Background:** `neutral-50` (#FAFAF9) — warm, comfortable, not sterile white
- **Cards:** white (#FFFFFF) with subtle shadow — lift from background
- **Primary buttons:** `green-500` text white — all main actions
- **CTA/Highlight buttons:** `orange-500` text white — "Order via WhatsApp", sale badges
- **Text:** `neutral-800` body, `neutral-950` headings — high contrast, easy reading
- **Discount badges:** `orange-100` background + `orange-500` text

---

## Typography

### Font Family

```
Headings: Lexend (Google Fonts) — modern, geometric, friendly
Body:     Plus Jakarta Sans (Google Fonts) — warm, readable, Indonesian-friendly
Mono:     JetBrains Mono — prices, numbers (optional, fallback to system)
```

### Scale (Mobile-first)

```
Display:  36px / 44px line-height / bold (hero headlines)
H1:       28px / 36px / bold (page titles)
H2:       24px / 32px / semibold (section titles)
H3:       20px / 28px / semibold (card titles)
Body-lg:  18px / 28px / regular (important text, CTAs)
Body:     16px / 24px / regular (default text)
Body-sm:  14px / 20px / regular (captions, metadata)
Caption:  12px / 16px / medium (badges, timestamps)
```

### Price Typography

```
Original price:  body-sm, neutral-400, line-through
Final price:     H2 or H3, neutral-950, bold
Discount badge:  caption, orange-500, bold, inside orange-100 pill
```

Example:
```
~~Rp 15.000~~  [30%]
Rp 10.500
```

---

## Spacing System

Based on Tailwind defaults (4px base):

```
xs:   4px   (tight gaps between icon + text)
sm:   8px   (element padding inside buttons)
md:   12px  (gaps between related elements)
base: 16px  (standard padding, gaps)
lg:   24px  (section spacing, card padding)
xl:   32px  (page padding on mobile)
2xl:  48px  (section gaps on desktop)
3xl:  64px  (page vertical rhythm desktop)
```

### Touch Targets

- Minimum button height: 48px (Tailwind `h-12`)
- Minimum tap area: 48×48px
- Icon buttons: minimum 44×44px with visible icon 24px

---

## Animation System

### Package: Framer Motion

```
pnpm add framer-motion
```

Why Framer Motion:
- React-native, declarative
- Gesture support (swipe, tap, drag)
- Layout animations (automatic position transitions)
- Exit animations (AnimatePresence)
- Spring physics (natural, non-robotic movement)
- Small bundle when tree-shaken

### Animation Principles

1. **Fast** — max 300ms for UI feedback, max 500ms for page transitions
2. **Subtle** — translate 8-16px, not 100px. Scale 0.95-1.05, not 0-1.
3. **Spring, not ease** — use `type: "spring"` for natural bounce
4. **Purpose-driven** — every animation communicates state change

### Animation Catalog

#### Page Transitions
```tsx
// Fade + slight slide up on route change
const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: "easeOut" }
};
```

#### Card Entrance (Stagger)
```tsx
// Food cards appear one by one with stagger
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }
  })
};
```

#### Button Feedback
```tsx
// Tap feedback — slight scale down
whileTap={{ scale: 0.97 }}
whileHover={{ scale: 1.02 }}
transition={{ type: "spring", stiffness: 400, damping: 17 }}
```

#### Success Celebration
```tsx
// After successful food listing creation
// Gentle scale pulse + confetti (canvas-confetti package)
animate={{ scale: [1, 1.05, 1] }}
transition={{ duration: 0.4, ease: "easeInOut" }}
```

#### Skeleton Loading
```tsx
// Shimmer effect on skeleton cards
animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
```

#### Toast/Notification
```tsx
// Slide in from top-right
initial={{ opacity: 0, x: 100, y: 0 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: 100 }}
```

#### Empty State Illustration
```tsx
// Gentle float animation on empty state illustration
animate={{ y: [0, -8, 0] }}
transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
```

#### AI Processing Indicator
```tsx
// During AI photo analysis — pulsing brain/sparkle icon
animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
transition={{ duration: 1.5, repeat: Infinity }}
```

#### Progress Steps (Multi-step form)
```tsx
// Step indicator animation when progressing
layout // automatic position/size transition
transition={{ type: "spring", stiffness: 500, damping: 30 }}
```

### Additional Animation Packages

```
framer-motion       → Core animations (page, cards, buttons, toasts)
canvas-confetti     → Success celebrations (listing created, first sale)
react-hot-toast     → Toast notifications (pre-styled, animated)
```

---

## Copywriting Guidelines

### Tone

**Bahasa Indonesia percakapan. Ramah, tidak kaku. Seperti teman yang bantu, bukan aplikasi yang memerintah.**

| ❌ Jangan | ✅ Gunakan |
|---|---|
| "Silakan masukkan data Anda" | "Yuk, isi info warung kamu" |
| "Upload foto produk" | "Foto makanan kamu, biar AI bantu bikin deskripsi" |
| "Konfirmasi penghapusan" | "Yakin mau hapus? Data yang dihapus tidak bisa dikembalikan" |
| "Error: Invalid input" | "Hmm, ada yang kurang. Coba cek lagi ya" |
| "Registration successful" | "Selamat datang di Ludes! Yuk lengkapi profil warung kamu" |
| "Submit" | "Simpan" / "Pasang Iklan" / "Buat Listing" |
| "Cancel" | "Batal" |
| "Delete" | "Hapus" |

### Error Messages

Always explain WHAT went wrong and WHAT to do next:

| Situation | Message |
|---|---|
| Email already registered | "Email ini udah terdaftar. Mau login aja?" + [Login] button |
| Wrong password | "Password salah nih. Coba lagi atau reset password?" |
| Network error | "Koneksi internet bermasalah. Cek wifi/data kamu ya" |
| AI timeout | "AI sedang sibuk. Coba lagi dalam beberapa detik ya" |
| Image too large | "Foto terlalu besar. Coba foto ulang atau pilih foto yang lebih kecil" |
| Price below floor | "Harga tidak boleh di bawah Rp [floor]. Ini untuk melindungi keuntungan kamu" |

### Empty States

| Context | Message | Illustration |
|---|---|---|
| No food items (merchant) | "Belum ada makanan yang dipasang. Yuk mulai dengan foto pertamamu!" | Floating camera/plate |
| No food items (consumer) | "Belum ada makanan tersedia di sekitarmu. Coba lagi nanti ya!" | Sad empty plate |
| No search results | "Hmm, tidak ketemu. Coba kata kunci lain atau hapus filter?" | Magnifying glass |
| Profile not created | "Satu langkah lagi! Lengkapi profil warung kamu biar bisa jualan" | Arrow pointing to form |

### Success Messages

| Context | Message | Animation |
|---|---|---|
| Registration | "Selamat datang di Ludes! 🎉" | Confetti |
| First listing | "Listing pertama kamu sudah live! Semoga laris ya 🎊" | Confetti + celebration card |
| Food created | "[Nama makanan] berhasil dipasang! Pelanggan bisa lihat sekarang" | Green check + slide |
| Profile created | "Profil warung kamu siap! Sekarang bisa mulai jual makanan" | Sparkle |
| Status toggled | "Status berhasil diubah" | Subtle fade |

### Step-by-Step Instructions (for multi-step flows)

Use numbered steps with clear labels and progress indicator:

```
Step 1 dari 3: Upload Foto
"Ambil foto makanan kamu. Foto yang jelas bikin AI lebih akurat!"

Step 2 dari 3: Review & Edit
"AI udah bikin deskripsi. Cek dulu, edit kalau perlu."

Step 3 dari 3: Tentukan Harga
"Lihat saran harga, lalu tentukan harga final kamu sendiri."
```

---

## Component Specifications

### Buttons

```
Primary (green):
  bg-green-500 text-white font-semibold rounded-xl px-6 py-3 min-h-[48px]
  hover:bg-green-600 active:bg-green-700
  disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed
  whileTap={{ scale: 0.97 }}

Secondary (outline):
  border-2 border-green-500 text-green-600 font-semibold rounded-xl px-6 py-3
  hover:bg-green-50
  whileTap={{ scale: 0.97 }}

Danger (red):
  bg-red-500 text-white ... (for delete, destructive actions)

Ghost:
  text-neutral-600 hover:bg-neutral-100 ... (for cancel, dismiss)

WA Order (special):
  bg-[#25D366] text-white ... (WhatsApp green, with WA icon)
```

### Cards (Food Item)

```
bg-white rounded-2xl overflow-hidden shadow-sm
hover:shadow-md transition-shadow duration-200
border border-neutral-100

Image:
  aspect-[4/3] object-cover w-full
  Skeleton while loading

Content padding: p-4
  Title: H3 font-semibold line-clamp-1
  Price row: flex items-center gap-2
    Original: text-sm text-neutral-400 line-through
    Final: text-lg font-bold
    Discount badge: bg-orange-100 text-orange-500 text-xs font-bold px-2 py-0.5 rounded-full
  Merchant: text-sm text-neutral-600 line-clamp-1
  Distance: text-xs text-neutral-400 + location icon
```

### Input Fields

```
Label: text-sm font-medium text-neutral-700 mb-1
Input: w-full rounded-xl border border-neutral-200 px-4 py-3 min-h-[48px]
       focus:border-green-500 focus:ring-2 focus:ring-green-100
       placeholder:text-neutral-400
Error: border-red-300 focus:border-red-500 focus:ring-red-100
Helper text: text-xs text-neutral-500 mt-1
Error text: text-xs text-red-500 mt-1 + shake animation
```

### Navigation

```
Desktop (>768px):
  Fixed top navbar, h-16, bg-white/80 backdrop-blur-md border-b border-neutral-100
  Logo left, nav links center, auth buttons right

Mobile (<=768px):
  Fixed top navbar, h-14
  Logo left, hamburger right
  Slide-in drawer from right with nav links
  AnimatePresence for drawer open/close
```

### Progress Steps (Multi-step form)

```
Step indicator row:
  flex items-center justify-between mb-8

  Step circle:
    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
    Active: bg-green-500 text-white
    Completed: bg-green-500 text-white + check icon
    Upcoming: bg-neutral-100 text-neutral-400

  Connector line between steps:
    h-0.5 flex-1 mx-2
    Completed: bg-green-500
    Upcoming: bg-neutral-200

  Step label below circle:
    text-xs text-center
    Active: text-green-600 font-medium
    Completed: text-green-600
    Upcoming: text-neutral-400
```

---

## Page-by-Page Design Specs

### 1. Landing / Home Page (Consumer, Public)

**Layout:**
```
[Navbar — transparent, becomes solid on scroll]

[Hero Section]
  - Full-width gradient background (green-50 → white)
  - Headline: "Makan enak, harga hemat. Selamatkan makanan dari tempat sampah."
  - Subtext: "Temukan makanan surplus dari warung terdekat dengan diskon 20-50%. Pesan via WhatsApp, ambil langsung."
  - CTA: "Cari Makanan Terdekat" (green button, scrolls to listings)
  - Hero illustration (AI-generated): diverse Indonesian street food
  - Floating food emoji animation (subtle parallax)

[Stats Bar]
  - 3 stats in a row: "X Makanan Terselamatkan" | "X Warung Terdaftar" | "X% Rata-rata Diskon"
  - Counter animation on scroll into view

[How It Works]
  - 3 steps with icons:
    1. "Cari makanan murah di sekitarmu" (map pin icon)
    2. "Pilih yang kamu suka" (plate icon)
    3. "Pesan via WhatsApp, ambil langsung" (WA icon)
  - Stagger animation on scroll

[Food Grid]
  - Category pills (sticky on mobile, scrollable horizontal)
  - Grid: 1 col mobile, 2 tablet, 3 desktop
  - Cards with stagger entrance animation
  - Skeleton loading (3 skeleton cards while fetching)
  - Empty state with floating illustration if no items

[Footer]
  - Ludes logo + tagline
  - Links: Tentang Kami, Cara Kerja, Untuk Pedagang
  - "Dibuat dengan ❤️ untuk UMKM Indonesia"
```

### 2. Login Page

**Layout:**
```
[Centered card on neutral-50 background]
[Logo + "Masuk ke Ludes" headline]
[Email input + password input]
[Primary button: "Masuk"]
[Link: "Belum punya akun? Daftar di sini"]
[Framer Motion: card entrance fade+scale from 0.95]
[Shake animation on error]
```

**Copy:**
- Headline: "Masuk ke Ludes"
- Email placeholder: "email@contoh.com"
- Password placeholder: "Password kamu"
- Button: "Masuk"
- Error: "Email atau password salah. Coba lagi ya"
- Link: "Belum punya akun? Daftar gratis →"

### 3. Register Page

**Layout:**
```
[Centered card]
[Logo + "Daftar di Ludes" headline]
[Name, email, password, phone (optional)]
[Role selector: 2 big cards — "Saya Pembeli" / "Saya Pedagang"]
[Primary button: "Daftar"]
[Link: "Udah punya akun? Masuk di sini"]
```

**Role Selector Design:**
```
Two side-by-side cards (stacked on mobile):

Card 1 — "Saya Pembeli"
  Icon: 🛒 shopping bag
  Title: "Pembeli"
  Desc: "Cari makanan murah di sekitar kamu"
  Selected: green border + green background tint + check icon
  Animation: scale 1.02 on select

Card 2 — "Saya Pedagang"
  Icon: 🏪 warung
  Title: "Pedagang"
  Desc: "Jual makanan surplus, kurangi waste, dapat untung"
  Selected: green border + green background tint + check icon
  Animation: scale 1.02 on select
```

### 4. Merchant Profile Creation

**Layout:**
```
[Progress bar: Step 1 dari 1 (simple, single step)]

[Headline: "Lengkapi Profil Warung Kamu"]
[Subtext: "Supaya pelanggan bisa menemukan dan menghubungi kamu"]

[Form:]
- Nama warung (input)
  Helper: "Contoh: Nasi Goreng Pak Budi"
- Alamat lengkap (textarea)
  Helper: "Alamat lengkap warung kamu"
- Nomor WhatsApp (input with +62 prefix)
  Helper: "Pelanggan akan pesan ke nomor ini"
- Deskripsi warung (textarea, optional)
  Helper: "Cerita singkat tentang warung kamu (opsional)"

[Location picker]
- "Gunakan lokasi saya saat ini" button (geolocation)
- Or manual lat/lng (hidden advanced)
- Map preview (static, simple)

[Primary button: "Simpan Profil Warung"]
[Skip for now: subtle text link — actually don't allow skip, merchant MUST create profile]
```

**Copy:**
- Headline: "Lengkapi Profil Warung Kamu"
- Subtext: "Cuma butuh 1 menit. Ini info yang pelanggan lihat tentang warung kamu."
- Success: "Profil warung kamu siap! Sekarang bisa mulai pasang makanan 🎉"

### 5. Merchant Dashboard

**Layout:**
```
[Tab navigation: Makanan Saya | Profil | Segera Hadir]

[Makanan Saya tab:]
  [+ Pasang Makanan Baru] button (floating FAB on mobile, top-right on desktop)
  Grid/list of merchant's food items
  Each card: photo, name, price, status badge, edit/delete actions
  Quick toggle: available/sold out (animated switch)
  Empty state: "Belum ada makanan. Yuk pasang yang pertama!" + CTA

[Profil tab:]
  Edit profile form (same fields as creation)

[Segera Hadir tab:]
  Disabled/grayed
  Icon: 🔮 crystal ball
  "Fitur Prediksi Surplus Harian"
  "AI akan menganalisis pola penjualan kamu dan memprediksi makanan yang akan surplus besok. Coming soon!"
```

### 6. Create Food Listing (AI Upload Flow) — 3 Steps

**This is the core demo feature. Must be seamless and delightful.**

#### Step 1: Upload Photo

```
[Progress indicator: ① Upload Foto — ② Review — ③ Harga]

[Headline: "Foto Makanan Kamu"]
[Subtext: "Foto yang jelas bikin AI lebih akurat. Usahakan foto dari atas dan pencahayaan cukup."]

[Upload area:]
  Large dashed border area (min 300px tall)
  Center: camera icon + "Tap untuk foto atau pilih dari galeri"
  On mobile: opens camera directly if supported
  On desktop: file picker
  Accepted: jpg, png, webp, max 5MB
  Animation: pulse border when hovering/dragging

[After upload:]
  Image preview with subtle zoom-in animation
  "Ganti foto" button overlay
  [Lanjut →] button becomes active
```

#### Step 2: AI Review & Edit

```
[Progress indicator: ✓ Upload Foto — ② Review — ③ Harga]

[AI Processing overlay:]
  Full screen overlay with spinner
  "AI sedang menganalisis makanan kamu..."
  Animated sparkle/brain icon
  Usually takes 2-5 seconds

[After AI returns:]
  AnimatePresence: form slides up from bottom

  [AI Results card with sparkle border:]
    "AI sudah bikin listing untuk kamu! ✨"

    Foto preview (small, left)

    Nama makanan (input, pre-filled from AI)
    Helper: "Edit kalau namanya kurang pas"

    Deskripsi (textarea, pre-filled from AI)
    Helper: "Deskripsi ini yang dilihat pembeli"

    Kategori (select, pre-selected from AI)
    Pills: Nasi | Mie | Lauk | Kue | Minuman | Snack | Lainnya
    Helper: "Pilih kategori yang paling cocok"

  [← Kembali]  [Lanjut ke Harga →]
```

#### Step 3: Pricing

```
[Progress indicator: ✓ Upload Foto — ✓ Review — ③ Harga]

[Pricing suggestion card:]
  "💡 Saran Harga dari AI"
  bg-green-50 border border-green-200 rounded-2xl p-4

  Harga asli:
    [Input] "Rp [______]"
    Helper: "Harga normal makanan ini berapa?"

  Saran harga jual:
    "Rp [min] - Rp [max]"
    (Diskon [X-Y]%)

  Harga lantai: Rp [floor]
  text-xs text-neutral-500
  "Harga minimum untuk melindungi keuntungan kamu"

  Harga final kamu:
    [Input] "Rp [______]"
    Helper: "Kamu yang tentukan harga akhirnya"

  Jumlah porsi:
    [Input number] "___ porsi"

  Waktu pengambilan:
    [Input text] "Contoh: Jam 4-6 sore"
    Helper: "Kapan pembeli bisa ambil?"

[← Kembali]  [Pasang Iklan! 🚀]

[After submit:]
  Confetti animation 🎊
  Success card:
    "[Nama makanan] berhasil dipasang!"
    "Pelanggan di sekitar kamu sudah bisa lihat dan pesan"
  [Lihat Listing]  [Pasang Lagi]
```

### 7. Food Detail Page (Consumer)

```
[Back button + share button top]

[Full-width food image, aspect 4:3, rounded bottom corners]

[Content:]
  Name: H1
  Category badge + status badge

  Price row:
    ~~Original~~ + [Discount%] badge + Final price (big, bold)

  Description paragraph

  [Merchant info card:]
    Merchant photo/avatar + name
    Address + distance
    "Lihat semua makanan [merchant name] →"

  [Pickup info:]
    "🕐 Waktu pengambilan: [time]"

  [Big green WA button — sticky at bottom on mobile:]
    "📱 Pesan via WhatsApp"
    Fixed bottom bar on mobile, inline on desktop
    bg-[#25D366] text-white font-bold rounded-2xl w-full py-4
    whileTap={{ scale: 0.97 }}
```

### 8. Coming Soon Page (Merchant Dashboard Tab)

```
[Centered content]
[Floating crystal ball illustration with gentle y animation]

H2: "Segera Hadir"
H3: "Prediksi Surplus Harian"

body-lg text-neutral-600:
  "AI akan menganalisis pola penjualan kamu dan memprediksi
   makanan yang akan surplus besok. Kamu bisa siap-siap
   sebelum makanan terbuang."

[Feature preview cards — grayed out:]
  "📊 Prediksi berapa porsi yang akan surplus"
  "⏰ Notifikasi sebelum makanan mendekati waktu basi"
  "💰 Saran harga otomatis berdasarkan permintaan"

[Notify button:]
  "Kabari Saya Ketika Tersedia"
  (Stores email in waitlist — future feature)
```

---

## Responsive Breakpoints

```
Mobile:  < 640px   (1 column grid, stacked layout, bottom nav)
Tablet:  640-1024px (2 column grid, side-by-side forms)
Desktop: > 1024px  (3-4 column grid, sidebar nav, wider forms)
```

### Mobile-Specific Patterns

- **Bottom nav** for authenticated users (Home, Search, My Listings, Profile)
- **FAB** (Floating Action Button) for "Add Food" on merchant dashboard
- **Sticky CTA** at bottom for food detail (WhatsApp button)
- **Drawer** navigation (not top nav links)
- **Swipe to delete** on food item cards (merchant view)
- **Pull to refresh** on food grid
- **Bottom sheet** for filters (instead of sidebar)

### Tablet Adjustments

- 2-column food grid
- Side-by-side form fields where applicable
- Top nav returns (no drawer)

### Desktop Enhancements

- 3-4 column food grid
- Hover effects on cards (slight lift + shadow)
- Sidebar filters on browse page
- Wider forms (max-w-lg centered)
- Keyboard shortcuts (future)

---

## Icon Strategy

All icons from **Lucide React** (consistent, lightweight, tree-shakeable):

```
pnpm add lucide-react
```

Key icons:
- Navigation: `Home`, `Search`, `Store`, `User`, `Menu`, `X`, `ChevronRight`, `ChevronLeft`
- Food: `UtensilsCrossed`, `Coffee`, `CakeSlice`, `Sandwich`, `Soup`, `IceCreamCone`
- Actions: `Camera`, `Upload`, `Edit`, `Trash2`, `Plus`, `Minus`, `Check`, `Sparkles`
- Status: `MapPin`, `Clock`, `Phone`, `MessageCircle`
- WhatsApp: custom SVG (official WA logo)
- Ludes custom: 🍽️ + sparkle = logo mark

---

## Asset Generation Strategy

All visual assets generated by AI:

1. **Hero illustration:** AI-generated Indonesian street food scene (warm colors, diverse dishes)
2. **Empty state illustrations:** AI-generated simple illustrations (plate, camera, magnifying glass)
3. **Category icons:** Consistent icon set from Lucide (no custom needed)
4. **Onboarding illustrations:** AI-generated step-by-step visuals
5. **Logo:** Simple text-based "Ludes" with subtle food/sparkle accent — can be refined later

### Asset Locations

```
apps/web/src/assets/
├── images/
│   ├── hero-illustration.webp
│   ├── empty-plate.webp
│   ├── empty-camera.webp
│   ├── empty-search.webp
│   └── coming-soon.webp
├── icons/
│   └── whatsapp.svg
└── logo/
    ├── ludes-logo.svg
    └── ludes-mark.svg
```

---

## Animation Package Summary

```bash
# Install before frontend implementation
pnpm --filter web add framer-motion canvas-confetti react-hot-toast lucide-react
pnpm --filter web add -D @types/canvas-confetti
```

| Package | Purpose |
|---|---|
| `framer-motion` | Page transitions, card animations, button feedback, layout animations, AnimatePresence |
| `canvas-confetti` | Success celebrations (listing created, first food item) |
| `react-hot-toast` | Toast notifications with built-in animations |
| `lucide-react` | Icon library (consistent, tree-shakeable) |

---

## Accessibility Checklist

- [ ] Color contrast minimum 4.5:1 for text, 3:1 for UI elements
- [ ] All interactive elements keyboard accessible
- [ ] Focus visible indicators (ring-2 ring-green-500)
- [ ] Alt text on all images
- [ ] Form labels associated with inputs
- [ ] Error messages announced via aria-live
- [ ] Touch targets minimum 48×48px
- [ ] Font size minimum 16px for body text
- [ ] Reduced motion: respect `prefers-reduced-motion` media query
- [ ] Loading states announced to screen readers
