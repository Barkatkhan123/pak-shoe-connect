const getSiteUrl = () => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL as string;
  }
  if (typeof process !== "undefined" && (process.env.VITE_SITE_URL || process.env.SITE_URL)) {
    return process.env.VITE_SITE_URL || process.env.SITE_URL!;
  }
  return "https://anamonofficial.com";
};

export const SITE = {
  brand: "Anamon",
  fullName: "Anamon Official",
  brandUrdu: "اینامون آفیشل",
  domain: "anamonofficial.com",
  url: getSiteUrl(),
  title: "Anamon Official | B2B Wholesale Leather Shoes Manufacturer",
  metaDescription:
    "Anamon Official manufactures premium leather and rexine footwear for global B2B buyers. Bulk orders, custom branding, and reliable worldwide shipping.",
  tagline: "International-Grade Materials. Custom Branding. Wholesale Scale.",
  taglineUrdu: "بین الاقوامی معیار کا چمڑا اور ریگزین · کسٹم برانڈنگ · ہول سیل پیمانہ",
  aboutShort:
    "Anamon Official is a trusted manufacturer of leather and rexine footwear serving wholesale buyers, retailers, and emerging footwear brands across international markets.",
  aboutFull:
    "Anamon Official is a trusted manufacturer of leather and rexine footwear serving wholesale buyers, retailers, and emerging footwear brands across international markets. Backed by skilled craftsmanship, quality-controlled production, and material sourcing that meets global standards, we help businesses scale with competitive pricing, custom manufacturing options, and dependable delivery — from first sample to full container order.",
  keywords: [
    "B2B leather shoe manufacturer",
    "wholesale leather footwear supplier",
    "rexine shoes bulk order",
    "custom private label footwear",
    "leather shoe exporter",
    "OEM shoe manufacturing",
  ],
  phone: "0343-2178305",
  phoneHref: "tel:+923432178305",
  whatsapp: "923432178305",
  whatsappHref: "https://wa.me/923432178305",
  email: "anamoontotrade@gmail.com",
  emailHref: "mailto:anamoontotrade@gmail.com",
  address: "Main Market, Gulberg III, Lahore, Pakistan",
  gstn: "42-0001234-5",
  since: 1998,
  mapEmbed: "https://www.google.com/maps?q=Gulberg+Lahore&output=embed",
};

export const waLink = (msg: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;

export const formatPKR = (amount: number): string =>
  `PKR ${new Intl.NumberFormat("en-PK").format(amount)}`;

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/manufacturing", label: "Manufacturing" },
  { to: "/bulk-order", label: "Bulk Order" },
  { to: "/contact", label: "Contact" },
] as const;

export const CATEGORY_NAV = [
  { slug: "men-formal", label: "Formal", icon: "👞" },
  { slug: "men-casual", label: "Casual", icon: "🥿" },
  { slug: "men-peshawari", label: "Peshawari", icon: "🩴" },
  { slug: "men-sneakers", label: "Sneakers", icon: "👟" },
  { slug: "men-boots", label: "Boots", icon: "🥾" },
  { slug: "men-sandals", label: "Sandals", icon: "🩴" },
  { slug: "women-heels", label: "Heels", icon: "👠" },
  { slug: "women-flats", label: "Khussa", icon: "🥿" },
  { slug: "women-sandals", label: "Sandals", icon: "👡" },
  { slug: "kids-boys", label: "Boys", icon: "👟" },
  { slug: "kids-girls", label: "Girls", icon: "👠" },
  { slug: "safety", label: "Safety", icon: "🥾" },
  { slug: "sports", label: "Sports", icon: "👟" },
];
