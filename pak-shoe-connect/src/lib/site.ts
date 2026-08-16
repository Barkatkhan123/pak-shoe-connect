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
  brandUrdu: "اینامون",
  domain: "anamonofficial.com",
  url: getSiteUrl(),
  tagline: "Pakistan's Premier B2B Wholesale Shoe Marketplace",
  taglineUrdu: "پاکستان کا پریمیئر تھوک جوتا مارکیٹ پلیس",
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
