const catPeshawari = "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800";
const catFormal = "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800";
const catSneakers = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800";
const catKhussa = "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800";
const catHeels = "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800";
const catKids = "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800";

export type Gender = "men" | "women" | "kids" | "unisex";

export type PriceTier = {
  moq: number;
  pricePerPair: number; // PKR
  label: string;
};

export type ColorVariant = {
  name: string;
  hex: string;
  inStock: boolean;
  stockUnits: number;
};

export type Review = {
  id: string;
  reviewer: string;
  city: string;
  country: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  helpful: number;
};

export type Category = {
  slug: string;
  name: string;
  nameUrdu: string;
  gender: Gender;
  image: string;
  productCount: number;
  description: string;
};

export type Product = {
  slug: string;
  sku: string;
  name: string;
  nameUrdu: string;
  categorySlug: string;
  gender: Gender;
  image: string;
  images: string[];
  material: string;
  soleType: string;
  colorVariants: ColorVariant[];
  colors: string[];
  sizes: string[];
  moq: number;
  cartonQty: number;
  priceTiers: PriceTier[];
  leadTimeDays: string;
  priceLabel: string;
  productionCapacity: string;
  customization: string[];
  inStock: boolean;
  featured?: boolean;
  bestseller?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  description: string;
  specifications: Record<string, string>;
  shippingInfo: string;
  reviews: Review[];
  video?: string;
  sampleAvailable?: boolean;
  samplePrice?: number;
  sampleLeadDays?: string;
  sampleRefundable?: boolean;
  stats: {
    unitsSold: number;
    ordersCompleted: number;
    activeBuyers: number;
    repeatPurchasePct: number;
  };
};

export const CATEGORIES: Category[] = [
  {
    slug: "men-formal",
    name: "Formal Shoes",
    nameUrdu: "رسمی جوتے",
    gender: "men",
    image: catFormal,
    productCount: 24,
    description: "Oxford, Derby, Monk-strap & Brogue for corporate buyers",
  },
  {
    slug: "men-casual",
    name: "Casual Shoes",
    nameUrdu: "کیژوئل جوتے",
    gender: "men",
    image: catSneakers,
    productCount: 32,
    description: "Everyday comfort footwear for retailers",
  },
  {
    slug: "men-peshawari",
    name: "Peshawari Chappal",
    nameUrdu: "پشاوری چپل",
    gender: "men",
    image: catPeshawari,
    productCount: 18,
    description: "Authentic handcrafted Peshawari & Charsadda styles",
  },
  {
    slug: "men-sneakers",
    name: "Sneakers",
    nameUrdu: "اسنیکرز",
    gender: "men",
    image: catSneakers,
    productCount: 28,
    description: "Athletic & lifestyle sneakers for volume buyers",
  },
  {
    slug: "men-boots",
    name: "Boots",
    nameUrdu: "بوٹ",
    gender: "men",
    image: catFormal,
    productCount: 15,
    description: "Chelsea, chukka, and safety boots",
  },
  {
    slug: "men-sandals",
    name: "Sandals",
    nameUrdu: "سینڈل",
    gender: "men",
    image: catPeshawari,
    productCount: 20,
    description: "Leather & PU sandals for hot climate markets",
  },
  {
    slug: "women-heels",
    name: "Heels",
    nameUrdu: "ہیل",
    gender: "women",
    image: catHeels,
    productCount: 22,
    description: "Block heel, stiletto & wedge for fashion boutiques",
  },
  {
    slug: "women-flats",
    name: "Flats & Khussa",
    nameUrdu: "فلیٹس اور خوصہ",
    gender: "women",
    image: catKhussa,
    productCount: 30,
    description: "Traditional khussa & modern flats",
  },
  {
    slug: "women-sandals",
    name: "Sandals & Slippers",
    nameUrdu: "سینڈل اور سلیپر",
    gender: "women",
    image: catHeels,
    productCount: 25,
    description: "Ladies casual and formal sandals",
  },
  {
    slug: "kids-boys",
    name: "Boys School Shoes",
    nameUrdu: "لڑکوں کے جوتے",
    gender: "kids",
    image: catKids,
    productCount: 16,
    description: "Durable school shoes for institutional buyers",
  },
  {
    slug: "kids-girls",
    name: "Girls Shoes",
    nameUrdu: "لڑکیوں کے جوتے",
    gender: "kids",
    image: catKids,
    productCount: 14,
    description: "Mary jane, ballet flat & school shoes",
  },
  {
    slug: "safety",
    name: "Safety Shoes",
    nameUrdu: "حفاظتی جوتے",
    gender: "unisex",
    image: catFormal,
    productCount: 12,
    description: "Steel-toe & anti-slip for industrial buyers",
  },
  {
    slug: "sports",
    name: "Sports Shoes",
    nameUrdu: "کھیل کے جوتے",
    gender: "unisex",
    image: catSneakers,
    productCount: 19,
    description: "Running, football, cricket & gym shoes",
  },
];

export const PRODUCTS: Product[] = [
  // ---- MEN PESHAWARI ----
  {
    slug: "peshawari-charsadda-classic",
    sku: "ANM-PSH-101",
    name: "Charsadda Classic Peshawari",
    nameUrdu: "چارسدہ کلاسک پشاوری",
    categorySlug: "men-peshawari",
    gender: "men",
    image: catPeshawari,
    images: [catPeshawari, catFormal, catPeshawari],
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    material: "Genuine buffalo leather · Rubber sole",
    soleType: "Rubber",
    colorVariants: [
      { name: "Tan", hex: "#C4906B", inStock: true, stockUnits: 2400 },
      { name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 1800 },
      { name: "Coffee", hex: "#6B3A2A", inStock: true, stockUnits: 1200 },
      { name: "Natural", hex: "#D4AA7D", inStock: false, stockUnits: 0 },
    ],
    colors: ["Tan", "Black", "Coffee", "Natural"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 1850, label: "Starter" },
      { moq: 60, pricePerPair: 1650, label: "Dealer" },
      { moq: 240, pricePerPair: 1450, label: "Wholesale" },
      { moq: 600, pricePerPair: 1250, label: "Bulk" },
    ],
    leadTimeDays: "10–14 days",
    priceLabel: "PKR 1,850–1,250",
    productionCapacity: "12,000 pairs/month",
    customization: ["Custom branding", "Box printing", "Insole logo", "Custom colors"],
    inStock: true,
    featured: true,
    bestseller: true,
    trending: true,
    description:
      "Handcrafted Charsadda-style peshawari chappal built for daily wear. Full-grain buffalo leather upper with traditional woven pattern, stitched welt, and a shock-absorbing natural rubber sole. A perennial bestseller with retailers from Karachi to Peshawar.",
    specifications: {
      "Upper Material": "Full-grain buffalo leather",
      "Sole Material": "Natural rubber",
      Closure: "Slip-on with ankle strap",
      "Toe Style": "Open toe",
      Weight: "~280g per pair",
      Origin: "Charsadda, KPK, Pakistan",
      Standard: "ISO 9001 QC",
    },
    shippingInfo:
      "Shipped in cartons of 12 pairs. Nationwide delivery 3–5 business days. TCS / Leopards / Tranzum freight available.",
    reviews: [
      {
        id: "r1",
        reviewer: "Bilal Ahmed",
        city: "Lahore",
        country: "Pakistan",
        rating: 5,
        date: "2026-03-12",
        comment:
          "Excellent quality for wholesale orders. Been buying for 4 years. Consistent leather quality and on-time dispatch every time.",
        verified: true,
        helpful: 47,
      },
      {
        id: "r2",
        reviewer: "Tariq Hussain",
        city: "Rawalpindi",
        country: "Pakistan",
        rating: 5,
        date: "2026-02-28",
        comment:
          "MOQ of 12 pairs is great for small retailers like us. Quality matches the price point perfectly. Will reorder.",
        verified: true,
        helpful: 31,
      },
      {
        id: "r3",
        reviewer: "Yousaf Khan",
        city: "Peshawar",
        country: "Pakistan",
        rating: 4,
        date: "2026-01-15",
        comment:
          "Authentic Charsadda quality. Customers love the natural leather smell. Lead time was 12 days as promised.",
        verified: true,
        helpful: 22,
      },
    ],
    stats: { unitsSold: 18500, ordersCompleted: 340, activeBuyers: 210, repeatPurchasePct: 78 },
  },

  // ---- MEN FORMAL ----
  {
    slug: "oxford-formal-brogue",
    sku: "ANM-FRM-204",
    name: "Oxford Formal Brogue",
    nameUrdu: "آکسفورڈ فارمل",
    categorySlug: "men-formal",
    gender: "men",
    image: catFormal,
    images: [catFormal, catPeshawari, catFormal],
    material: "Cow leather · PU sole",
    soleType: "PU",
    colorVariants: [
      { name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 3200 },
      { name: "Brown", hex: "#8B4513", inStock: true, stockUnits: 2400 },
      { name: "Burgundy", hex: "#800020", inStock: true, stockUnits: 800 },
    ],
    colors: ["Black", "Brown", "Burgundy"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 2800, label: "Starter" },
      { moq: 60, pricePerPair: 2500, label: "Dealer" },
      { moq: 240, pricePerPair: 2200, label: "Wholesale" },
      { moq: 600, pricePerPair: 1950, label: "Bulk" },
    ],
    leadTimeDays: "15–20 days",
    priceLabel: "PKR 2,800–1,950",
    productionCapacity: "8,000 pairs/month",
    customization: ["Custom branding", "Branded box", "Custom insole", "Size range extension"],
    inStock: true,
    featured: true,
    bestseller: true,
    description:
      "Premium oxford brogue with hand-punched medallion detailing. Cushioned memory foam insole, non-slip PU sole. Popular with corporate uniform buyers, government institutions, and hotel chains.",
    specifications: {
      "Upper Material": "Full-grain cow leather",
      "Sole Material": "Polyurethane (PU)",
      Closure: "Lace-up",
      "Toe Style": "Cap toe with brogue detailing",
      "Heel Height": "3 cm",
      Origin: "Lahore, Punjab, Pakistan",
      Standard: "ISO 9001 QC",
    },
    shippingInfo: "Shipped in cartons of 12 pairs. Nationwide TCS/Leopards delivery 3–5 days.",
    reviews: [
      {
        id: "r4",
        reviewer: "Kamran Sheikh",
        city: "Faisalabad",
        country: "Pakistan",
        rating: 5,
        date: "2026-04-01",
        comment:
          "Ordered 300 pairs for a corporate client. Quality is impeccable and delivery was on time. Will definitely reorder.",
        verified: true,
        helpful: 38,
      },
      {
        id: "r5",
        reviewer: "Abdul Rauf",
        city: "Karachi",
        country: "Pakistan",
        rating: 4,
        date: "2026-03-18",
        comment:
          "Good quality leather. The PU sole is very durable. Customers are happy with the look and feel.",
        verified: true,
        helpful: 19,
      },
    ],
    stats: { unitsSold: 12800, ordersCompleted: 185, activeBuyers: 124, repeatPurchasePct: 72 },
  },

  // ---- MEN SNEAKERS ----
  {
    slug: "runner-sneaker-flex",
    sku: "ANM-SNK-330",
    name: "Runner Sneaker Flex",
    nameUrdu: "رنر اسنیکر",
    categorySlug: "men-sneakers",
    gender: "men",
    image: catSneakers,
    images: [catSneakers, catFormal, catSneakers],
    material: "Knit mesh · EVA sole",
    soleType: "EVA",
    colorVariants: [
      { name: "White", hex: "#F8F8F8", inStock: true, stockUnits: 4500 },
      { name: "Grey", hex: "#6B7280", inStock: true, stockUnits: 3200 },
      { name: "Navy", hex: "#1E3A5F", inStock: true, stockUnits: 2800 },
      { name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 3800 },
      { name: "Red", hex: "#DC2626", inStock: false, stockUnits: 0 },
    ],
    colors: ["White", "Grey", "Navy", "Black", "Red"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 2200, label: "Starter" },
      { moq: 60, pricePerPair: 1950, label: "Dealer" },
      { moq: 240, pricePerPair: 1700, label: "Wholesale" },
      { moq: 600, pricePerPair: 1500, label: "Bulk" },
    ],
    leadTimeDays: "12–18 days",
    priceLabel: "PKR 2,200–1,500",
    productionCapacity: "15,000 pairs/month",
    customization: ["Custom branding", "Custom colorways", "OEM label", "Retail box printing"],
    inStock: true,
    featured: true,
    bestseller: true,
    trending: true,
    description:
      "Breathable knit-mesh sneaker with lightweight EVA sole. Excellent turnover product for online sellers and multi-brand stores. Fast-moving SKU with consistent repeat orders.",
    specifications: {
      "Upper Material": "Engineered knit mesh",
      "Sole Material": "EVA foam",
      Closure: "Lace-up",
      Weight: "~220g per pair",
      Origin: "Sialkot, Punjab, Pakistan",
    },
    shippingInfo: "Shipped in cartons of 12 pairs. Express delivery available.",
    reviews: [
      {
        id: "r6",
        reviewer: "Zubair Malik",
        city: "Islamabad",
        country: "Pakistan",
        rating: 5,
        date: "2026-04-10",
        comment:
          "Fast moving product! My customers love the white color. Reordered 3 times already this season.",
        verified: true,
        helpful: 54,
      },
    ],
    stats: { unitsSold: 24500, ordersCompleted: 420, activeBuyers: 285, repeatPurchasePct: 84 },
  },

  // ---- MEN CASUAL ----
  {
    slug: "loafer-milano-suede",
    sku: "ANM-LFR-118",
    name: "Milano Suede Loafer",
    nameUrdu: "ملانو سوئیڈ لوفر",
    categorySlug: "men-casual",
    gender: "men",
    image: catFormal,
    images: [catFormal, catSneakers, catFormal],
    material: "Cow suede · TPR sole",
    soleType: "TPR",
    colorVariants: [
      { name: "Navy", hex: "#1E3A5F", inStock: true, stockUnits: 1600 },
      { name: "Grey", hex: "#6B7280", inStock: true, stockUnits: 1200 },
      { name: "Tan", hex: "#C4906B", inStock: true, stockUnits: 900 },
      { name: "Forest", hex: "#2D5016", inStock: false, stockUnits: 0 },
    ],
    colors: ["Navy", "Grey", "Tan", "Forest"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 2400, label: "Starter" },
      { moq: 60, pricePerPair: 2150, label: "Dealer" },
      { moq: 240, pricePerPair: 1900, label: "Wholesale" },
      { moq: 600, pricePerPair: 1650, label: "Bulk" },
    ],
    leadTimeDays: "15–20 days",
    priceLabel: "PKR 2,400–1,650",
    productionCapacity: "8,000 pairs/month",
    customization: ["Custom branding", "Sole color", "Embossed logo"],
    inStock: true,
    description:
      "Slip-on loafer with soft suede upper and moc-toe stitching. Comfortable all-day wear. Trending in urban markets.",
    specifications: {
      "Upper Material": "Cow suede",
      "Sole Material": "TPR",
      Closure: "Slip-on",
      Origin: "Lahore, Pakistan",
    },
    shippingInfo: "Cartons of 12. Nationwide delivery.",
    reviews: [
      {
        id: "r7",
        reviewer: "Imran Siddiqui",
        city: "Karachi",
        country: "Pakistan",
        rating: 4,
        date: "2026-03-05",
        comment:
          "Good quality suede. The navy color is very popular with my customers. Packaging is neat.",
        verified: true,
        helpful: 15,
      },
    ],
    stats: { unitsSold: 8200, ordersCompleted: 145, activeBuyers: 98, repeatPurchasePct: 65 },
  },

  // ---- MEN BOOTS ----
  {
    slug: "chelsea-boot-leather",
    sku: "ANM-BOT-502",
    name: "Premium Chelsea Boot",
    nameUrdu: "چیلسی بوٹ",
    categorySlug: "men-boots",
    gender: "men",
    image: catFormal,
    images: [catFormal, catFormal, catPeshawari],
    material: "Full-grain leather · Rubber sole",
    soleType: "Rubber",
    colorVariants: [
      { name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 2100 },
      { name: "Dark Brown", hex: "#4A2511", inStock: true, stockUnits: 1400 },
      { name: "Cognac", hex: "#9B4F0E", inStock: true, stockUnits: 600 },
    ],
    colors: ["Black", "Dark Brown", "Cognac"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 3800, label: "Starter" },
      { moq: 60, pricePerPair: 3400, label: "Dealer" },
      { moq: 240, pricePerPair: 3000, label: "Wholesale" },
      { moq: 600, pricePerPair: 2600, label: "Bulk" },
    ],
    leadTimeDays: "18–25 days",
    priceLabel: "PKR 3,800–2,600",
    productionCapacity: "5,000 pairs/month",
    customization: ["Custom heel height", "Brand embossing", "Color matching", "Premium packaging"],
    inStock: true,
    newArrival: true,
    description:
      "Premium chelsea boot crafted from full-grain leather. Elastic side gussets for easy on/off. Year-round seller in cold northern regions and corporate gifting orders.",
    specifications: {
      "Upper Material": "Full-grain cow leather",
      "Sole Material": "Crepe rubber",
      "Heel Height": "4 cm",
      "Boot Height": "22 cm",
      Origin: "Lahore, Pakistan",
    },
    shippingInfo: "Cartons of 12 pairs. Handled freight for bulk orders.",
    reviews: [],
    stats: { unitsSold: 4800, ordersCompleted: 82, activeBuyers: 61, repeatPurchasePct: 58 },
  },

  // ---- MEN SANDALS ----
  {
    slug: "leather-sandal-classic",
    sku: "ANM-SND-201",
    name: "Classic Leather Sandal",
    nameUrdu: "کلاسک چمڑا سینڈل",
    categorySlug: "men-sandals",
    gender: "men",
    image: catPeshawari,
    images: [catPeshawari, catPeshawari, catFormal],
    material: "Genuine leather · PU sole",
    soleType: "PU",
    colorVariants: [
      { name: "Tan", hex: "#C4906B", inStock: true, stockUnits: 2800 },
      { name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 2200 },
      { name: "Brown", hex: "#8B4513", inStock: true, stockUnits: 1600 },
    ],
    colors: ["Tan", "Black", "Brown"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 1600, label: "Starter" },
      { moq: 60, pricePerPair: 1400, label: "Dealer" },
      { moq: 240, pricePerPair: 1200, label: "Wholesale" },
      { moq: 600, pricePerPair: 1000, label: "Bulk" },
    ],
    leadTimeDays: "10–14 days",
    priceLabel: "PKR 1,600–1,000",
    productionCapacity: "10,000 pairs/month",
    customization: ["Custom branding", "Custom colors"],
    inStock: true,
    bestseller: true,
    description:
      "Comfortable everyday leather sandal with adjustable strap. Perfect for summer retail season. Consistent reorder product across Karachi and Lahore retailers.",
    specifications: {
      "Upper Material": "Genuine leather",
      "Sole Material": "PU",
      Closure: "Buckle strap",
      Origin: "Karachi, Pakistan",
    },
    shippingInfo: "Cartons of 12. Nationwide freight.",
    reviews: [
      {
        id: "r14",
        reviewer: "Hassan Raza",
        city: "Karachi",
        country: "Pakistan",
        rating: 5,
        date: "2026-04-15",
        comment:
          "Summer bestseller for us. Tan color moves fastest. Quality is very consistent batch after batch.",
        verified: true,
        helpful: 33,
      },
    ],
    stats: { unitsSold: 14200, ordersCompleted: 240, activeBuyers: 168, repeatPurchasePct: 79 },
  },

  // ---- WOMEN KHUSSA ----
  {
    slug: "khussa-multani-embroidered",
    sku: "ANM-KHS-402",
    name: "Multani Embroidered Khussa",
    nameUrdu: "ملتانی کڑھائی خوصہ",
    categorySlug: "women-flats",
    gender: "women",
    image: catKhussa,
    images: [catKhussa, catHeels, catKhussa],
    material: "Velvet · Hand embroidery · Leather sole",
    soleType: "Leather",
    colorVariants: [
      { name: "Gold", hex: "#D4AF37", inStock: true, stockUnits: 1800 },
      { name: "Maroon", hex: "#800000", inStock: true, stockUnits: 2200 },
      { name: "Emerald", hex: "#006B54", inStock: true, stockUnits: 1500 },
      { name: "Ivory", hex: "#FFFFF0", inStock: true, stockUnits: 900 },
      { name: "Royal Blue", hex: "#1C3F94", inStock: false, stockUnits: 0 },
    ],
    colors: ["Gold", "Maroon", "Emerald", "Ivory", "Royal Blue"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 1650, label: "Starter" },
      { moq: 60, pricePerPair: 1450, label: "Dealer" },
      { moq: 240, pricePerPair: 1250, label: "Wholesale" },
      { moq: 600, pricePerPair: 1050, label: "Bulk" },
    ],
    leadTimeDays: "10–15 days",
    priceLabel: "PKR 1,650–1,050",
    productionCapacity: "10,000 pairs/month",
    customization: ["Custom embroidery pattern", "Branded packaging", "Custom velvet color"],
    inStock: true,
    featured: true,
    bestseller: true,
    description:
      "Traditional Multani khussa with tilla hand embroidery. Cushioned footbed. Wedding-season bestseller. Ships to boutiques and wedding stores across Pakistan.",
    specifications: {
      "Upper Material": "Velvet with hand tilla embroidery",
      "Sole Material": "Genuine leather",
      Closure: "Slip-on",
      Origin: "Multan, Punjab, Pakistan",
    },
    shippingInfo: "Cartons of 12 pairs. Wedding season orders prioritized.",
    reviews: [
      {
        id: "r8",
        reviewer: "Sana Malik",
        city: "Islamabad",
        country: "Pakistan",
        rating: 5,
        date: "2026-04-05",
        comment:
          "Our khussa line launched with these and they sold out in 2 weeks! The embroidery quality is stunning.",
        verified: true,
        helpful: 62,
      },
      {
        id: "r9",
        reviewer: "Nadia Aslam",
        city: "Lahore",
        country: "Pakistan",
        rating: 5,
        date: "2026-03-20",
        comment:
          "Perfect for bridal collections. Maroon and gold colors are the most popular. Fast delivery too.",
        verified: true,
        helpful: 41,
      },
    ],
    stats: { unitsSold: 16200, ordersCompleted: 290, activeBuyers: 198, repeatPurchasePct: 82 },
  },

  // ---- WOMEN HEELS ----
  {
    slug: "block-heel-evening",
    sku: "ANM-HLS-505",
    name: "Evening Block Heel",
    nameUrdu: "شام بلاک ہیل",
    categorySlug: "women-heels",
    gender: "women",
    image: catHeels,
    images: [catHeels, catKhussa, catHeels],
    material: 'PU leather · TPR sole · 2.5" heel',
    soleType: "TPR",
    colorVariants: [
      { name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 2800 },
      { name: "Nude", hex: "#D4A574", inStock: true, stockUnits: 2200 },
      { name: "Rose Gold", hex: "#B76E79", inStock: true, stockUnits: 1200 },
      { name: "Red", hex: "#DC2626", inStock: true, stockUnits: 800 },
      { name: "White", hex: "#F8F8F8", inStock: false, stockUnits: 0 },
    ],
    colors: ["Black", "Nude", "Rose Gold", "Red", "White"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 2100, label: "Starter" },
      { moq: 60, pricePerPair: 1850, label: "Dealer" },
      { moq: 240, pricePerPair: 1600, label: "Wholesale" },
      { moq: 600, pricePerPair: 1400, label: "Bulk" },
    ],
    leadTimeDays: "15–20 days",
    priceLabel: "PKR 2,100–1,400",
    productionCapacity: "9,000 pairs/month",
    customization: ["Custom heel height", "Custom color", "Branded insole"],
    inStock: true,
    trending: true,
    description:
      "Comfortable block heel for formal and evening wear. Padded insole and non-slip TPR sole. Popular with women's fashion boutiques and party wear stores.",
    specifications: {
      "Upper Material": "PU leather",
      "Sole Material": "TPR",
      "Heel Height": "6.5 cm block",
      Origin: "Lahore, Pakistan",
    },
    shippingInfo: "Cartons of 12 pairs. Delicate packaging with tissue paper.",
    reviews: [
      {
        id: "r10",
        reviewer: "Hina Baig",
        city: "Karachi",
        country: "Pakistan",
        rating: 4,
        date: "2026-04-08",
        comment:
          "Good block heel quality. Nude and black are our top sellers. Comfortable enough for evening wear.",
        verified: true,
        helpful: 28,
      },
    ],
    stats: { unitsSold: 9800, ordersCompleted: 162, activeBuyers: 119, repeatPurchasePct: 69 },
  },

  // ---- WOMEN SANDALS ----
  {
    slug: "women-flat-sandal",
    sku: "ANM-WSN-303",
    name: "Ladies Flat Sandal",
    nameUrdu: "خواتین فلیٹ سینڈل",
    categorySlug: "women-sandals",
    gender: "women",
    image: catHeels,
    images: [catHeels, catKhussa, catHeels],
    material: "PU upper · TPR sole",
    soleType: "TPR",
    colorVariants: [
      { name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 3200 },
      { name: "White", hex: "#F8F8F8", inStock: true, stockUnits: 2800 },
      { name: "Pink", hex: "#F472B6", inStock: true, stockUnits: 2100 },
      { name: "Gold", hex: "#D4AF37", inStock: true, stockUnits: 1400 },
    ],
    colors: ["Black", "White", "Pink", "Gold"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 900, label: "Starter" },
      { moq: 60, pricePerPair: 780, label: "Dealer" },
      { moq: 240, pricePerPair: 670, label: "Wholesale" },
      { moq: 600, pricePerPair: 580, label: "Bulk" },
    ],
    leadTimeDays: "10–14 days",
    priceLabel: "PKR 900–580",
    productionCapacity: "18,000 pairs/month",
    customization: ["Custom colors", "Branded strap"],
    inStock: true,
    trending: true,
    description:
      "Lightweight flat sandal with cushioned footbed. High-volume summer product. Excellent for street markets, online sellers, and fashion retail chains.",
    specifications: {
      "Upper Material": "PU",
      "Sole Material": "TPR",
      Closure: "Slip-on",
      Origin: "Lahore, Pakistan",
    },
    shippingInfo: "Cartons of 12. Nationwide.",
    reviews: [
      {
        id: "r15",
        reviewer: "Farah Naz",
        city: "Faisalabad",
        country: "Pakistan",
        rating: 5,
        date: "2026-03-28",
        comment:
          "Best value for money in women's sandals. All 4 colors sell equally well. Will reorder 1000 pairs.",
        verified: true,
        helpful: 44,
      },
    ],
    stats: { unitsSold: 32000, ordersCompleted: 510, activeBuyers: 342, repeatPurchasePct: 86 },
  },

  // ---- KIDS BOYS ----
  {
    slug: "school-black-lace",
    sku: "ANM-KID-701",
    name: "School Lace-up (Black)",
    nameUrdu: "اسکول جوتا",
    categorySlug: "kids-boys",
    gender: "kids",
    image: catKids,
    images: [catKids, catKids, catFormal],
    material: "Synthetic leather · PU sole",
    soleType: "PU",
    colorVariants: [{ name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 6800 }],
    colors: ["Black"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 1100, label: "Starter" },
      { moq: 60, pricePerPair: 950, label: "Dealer" },
      { moq: 240, pricePerPair: 820, label: "Wholesale" },
      { moq: 600, pricePerPair: 700, label: "Institutional" },
    ],
    leadTimeDays: "10–15 days",
    priceLabel: "PKR 1,100–700",
    productionCapacity: "20,000 pairs/month",
    customization: ["School logo emboss", "Custom size range", "Institutional bulk pricing"],
    inStock: true,
    bestseller: true,
    description:
      "Durable school shoe with reinforced toe cap and easy-clean upper. Back-to-school volume favorite. Institutional pricing for schools and government supply contracts.",
    specifications: {
      "Upper Material": "Synthetic leather",
      "Sole Material": "PU",
      Closure: "Lace-up with reinforced eyelets",
      Toe: "Reinforced toe cap",
      Origin: "Sialkot, Pakistan",
    },
    shippingInfo: "Cartons of 12 pairs. Bulk container packing available.",
    reviews: [
      {
        id: "r11",
        reviewer: "Rashid Ahmad",
        city: "Gujranwala",
        country: "Pakistan",
        rating: 5,
        date: "2026-02-10",
        comment:
          "Supply to 12 schools in our area. Quality is consistent every batch. Institutional pricing is very competitive.",
        verified: true,
        helpful: 35,
      },
    ],
    stats: { unitsSold: 42000, ordersCompleted: 680, activeBuyers: 380, repeatPurchasePct: 88 },
  },

  // ---- KIDS GIRLS ----
  {
    slug: "girls-mary-jane",
    sku: "ANM-KID-720",
    name: "Girls' Mary Jane",
    nameUrdu: "گرلز میری جین",
    categorySlug: "kids-girls",
    gender: "kids",
    image: catKids,
    images: [catKids, catHeels, catKids],
    material: "PU leather · TPR sole",
    soleType: "TPR",
    colorVariants: [
      { name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 3200 },
      { name: "Pink", hex: "#F472B6", inStock: true, stockUnits: 2800 },
      { name: "White", hex: "#F8F8F8", inStock: true, stockUnits: 2100 },
      { name: "Navy", hex: "#1E3A5F", inStock: false, stockUnits: 0 },
    ],
    colors: ["Black", "Pink", "White", "Navy"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 1200, label: "Starter" },
      { moq: 60, pricePerPair: 1050, label: "Dealer" },
      { moq: 240, pricePerPair: 900, label: "Wholesale" },
      { moq: 600, pricePerPair: 780, label: "Bulk" },
    ],
    leadTimeDays: "10–15 days",
    priceLabel: "PKR 1,200–780",
    productionCapacity: "15,000 pairs/month",
    customization: ["Bow decorations", "Color customization", "School logo"],
    inStock: true,
    newArrival: true,
    description:
      "Classic mary-jane with elastic strap. Comfortable for all-day school wear. Pink color is the fastest-moving SKU in girls' category.",
    specifications: {
      "Upper Material": "PU leather",
      "Sole Material": "TPR",
      Closure: "Elastic strap with buckle",
      Origin: "Lahore, Pakistan",
    },
    shippingInfo: "Cartons of 12 pairs.",
    reviews: [],
    stats: { unitsSold: 19500, ordersCompleted: 312, activeBuyers: 195, repeatPurchasePct: 75 },
  },

  // ---- SAFETY SHOES ----
  {
    slug: "safety-steel-toe-boots",
    sku: "ANM-SAF-901",
    name: "Steel Toe Safety Boot",
    nameUrdu: "اسٹیل ٹو بوٹ",
    categorySlug: "safety",
    gender: "unisex",
    image: catFormal,
    images: [catFormal, catFormal, catPeshawari],
    material: "Nubuck leather · Anti-slip rubber sole · Steel toe cap",
    soleType: "Anti-slip Rubber",
    colorVariants: [
      { name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 2800 },
      { name: "Brown", hex: "#8B4513", inStock: true, stockUnits: 1400 },
    ],
    colors: ["Black", "Brown"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 4500, label: "Starter" },
      { moq: 60, pricePerPair: 4000, label: "Dealer" },
      { moq: 240, pricePerPair: 3500, label: "Wholesale" },
      { moq: 600, pricePerPair: 3100, label: "Bulk" },
    ],
    leadTimeDays: "20–28 days",
    priceLabel: "PKR 4,500–3,100",
    productionCapacity: "4,000 pairs/month",
    customization: ["Custom safety rating", "Company logo", "Custom color"],
    inStock: true,
    description:
      "ANSI-compliant steel toe safety boot. Anti-slip, oil-resistant sole. Popular with factories, construction companies, and industrial buyers across Pakistan.",
    specifications: {
      "Upper Material": "Nubuck leather",
      "Sole Material": "Anti-slip rubber",
      "Toe Protection": "200J steel toe cap",
      Standard: "EN ISO 20345",
      Origin: "Sialkot, Pakistan",
    },
    shippingInfo: "Cartons of 12 pairs. Industrial freight available.",
    reviews: [
      {
        id: "r12",
        reviewer: "Asim Khan",
        city: "Lahore",
        country: "Pakistan",
        rating: 5,
        date: "2026-01-20",
        comment:
          "Procured 500 pairs for our factory workers. Quality exceeds expectation. Steel toe is solid and the rubber sole is anti-slip as claimed.",
        verified: true,
        helpful: 42,
      },
    ],
    stats: { unitsSold: 7200, ordersCompleted: 95, activeBuyers: 68, repeatPurchasePct: 71 },
  },

  // ---- SPORTS ----
  {
    slug: "sports-running-pro",
    sku: "ANM-SPT-610",
    name: "Pro Runner Sports Shoe",
    nameUrdu: "پرو رنر اسپورٹس",
    categorySlug: "sports",
    gender: "unisex",
    image: catSneakers,
    images: [catSneakers, catSneakers, catFormal],
    material: "Mesh upper · Phylon midsole · Rubber outsole",
    soleType: "Phylon+Rubber",
    colorVariants: [
      { name: "Blue/White", hex: "#3B82F6", inStock: true, stockUnits: 3200 },
      { name: "Black/Red", hex: "#1C1C1C", inStock: true, stockUnits: 2800 },
      { name: "Green/Black", hex: "#16A34A", inStock: true, stockUnits: 2100 },
      { name: "Orange", hex: "#EA580C", inStock: false, stockUnits: 0 },
    ],
    colors: ["Blue/White", "Black/Red", "Green/Black", "Orange"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    moq: 12,
    cartonQty: 12,
    priceTiers: [
      { moq: 12, pricePerPair: 2600, label: "Starter" },
      { moq: 60, pricePerPair: 2300, label: "Dealer" },
      { moq: 240, pricePerPair: 2000, label: "Wholesale" },
      { moq: 600, pricePerPair: 1750, label: "Bulk" },
    ],
    leadTimeDays: "14–20 days",
    priceLabel: "PKR 2,600–1,750",
    productionCapacity: "12,000 pairs/month",
    customization: ["Custom colorways", "OEM label", "Retail box"],
    inStock: true,
    trending: true,
    newArrival: true,
    description:
      "High-performance running shoe with Phylon midsole cushioning. Breathable mesh upper and durable rubber outsole. Popular with sports equipment retailers and gym chains.",
    specifications: {
      "Upper Material": "Breathable mesh",
      Midsole: "Phylon foam",
      Outsole: "Carbon rubber",
      Weight: "~280g per pair",
      Origin: "Sialkot, Pakistan",
    },
    shippingInfo: "Cartons of 12 pairs. Express delivery available.",
    reviews: [
      {
        id: "r13",
        reviewer: "Ali Hassan",
        city: "Lahore",
        country: "Pakistan",
        rating: 5,
        date: "2026-04-02",
        comment:
          "Great quality at wholesale prices. Blue/White is our best seller for cricket season. Very good feedback from our customers.",
        verified: true,
        helpful: 29,
      },
    ],
    stats: { unitsSold: 11400, ordersCompleted: 210, activeBuyers: 142, repeatPurchasePct: 73 },
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  // Men Peshawari, Formal, Sneakers, Casual, Boots, Sandals, Women, Kids, Safety, Sports
  ...PRODUCTS,
];

const PRODUCTS_STORAGE_KEY = "shersha_catalog_products";
const PRODUCTS_UPDATE_EVENT = "shersha_products_update";

let inMemoryProducts: Product[] | null = null;

/**
 * Retrieves the currently active product list from localStorage if available,
 * falling back to the initial default product catalogue.
 */
export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") {
    return inMemoryProducts || DEFAULT_PRODUCTS;
  }
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      return inMemoryProducts || DEFAULT_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to load products from storage:", err);
  }
  return inMemoryProducts || DEFAULT_PRODUCTS;
}

/**
 * Persists an updated list of products to localStorage and broadcasts an update event
 * to all components and browser tabs.
 */
export function saveStoredProducts(products: Product[]): void {
  inMemoryProducts = products;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATE_EVENT, { detail: products }));
  } catch (err) {
    console.error("Failed to save products to storage:", err);
  }
}

/**
 * Updates a single product by slug or sku and notifies all listeners.
 */
export function updateStoredProduct(slugOrSku: string, updates: Partial<Product>): Product[] {
  if (!slugOrSku) return getStoredProducts();
  const current = getStoredProducts();
  const cleanTarget = slugOrSku.toLowerCase().trim();
  const next = current.map((p) => {
    const matches =
      p.slug.toLowerCase() === cleanTarget ||
      p.sku.toLowerCase() === cleanTarget ||
      p.slug.toLowerCase() === cleanTarget.replace(/[^a-z0-9]+/g, "-");
    return matches ? ({ ...p, ...updates } as Product) : p;
  });
  saveStoredProducts(next);
  return next;
}

/**
 * Adds a new product to the stored catalog and notifies all listeners.
 */
export function addStoredProduct(newProduct: Product): Product[] {
  const current = getStoredProducts();
  // Ensure no duplicate slug or sku
  const cleanSlug = (newProduct.slug || "").toLowerCase();
  const cleanSku = (newProduct.sku || "").toLowerCase();
  const filtered = current.filter(
    (p) => p.slug.toLowerCase() !== cleanSlug && (!cleanSku || p.sku.toLowerCase() !== cleanSku),
  );
  const next = [newProduct, ...filtered];
  saveStoredProducts(next);
  return next;
}

/**
 * Deletes a product from the stored catalog and notifies all listeners.
 */
export function deleteStoredProduct(slugOrSku: string): Product[] {
  if (!slugOrSku) return getStoredProducts();
  const current = getStoredProducts();
  const cleanTarget = slugOrSku.toLowerCase().trim();
  const next = current.filter(
    (p) =>
      p.slug.toLowerCase() !== cleanTarget &&
      p.sku.toLowerCase() !== cleanTarget &&
      p.slug.toLowerCase() !== cleanTarget.replace(/[^a-z0-9]+/g, "-"),
  );
  saveStoredProducts(next);
  return next;
}

/**
 * Resets the product catalog to default factory definitions.
 */
export function resetStoredProducts(): Product[] {
  inMemoryProducts = [...DEFAULT_PRODUCTS];
  if (typeof window === "undefined") return inMemoryProducts;
  try {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    saveStoredProducts(DEFAULT_PRODUCTS);
  } catch {}
  return DEFAULT_PRODUCTS;
}

export const getProduct = (slugOrSku: string): Product | undefined => {
  if (!slugOrSku) return undefined;
  const clean = decodeURIComponent(slugOrSku).trim().toLowerCase();
  const cleanDashed = clean.replace(/[^a-z0-9]+/g, "-");
  return getStoredProducts().find(
    (p) =>
      p.slug.toLowerCase() === clean ||
      p.sku.toLowerCase() === clean ||
      p.slug.toLowerCase() === cleanDashed ||
      p.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanDashed,
  );
};

export const relatedProducts = (p: Product, n = 4): Product[] =>
  getStoredProducts()
    .filter(
      (x) => x.slug !== p.slug && (x.gender === p.gender || x.categorySlug === p.categorySlug),
    )
    .slice(0, n);

export const featuredProducts = (): Product[] => getStoredProducts().filter((p) => p.featured);
export const bestSellers = (): Product[] => getStoredProducts().filter((p) => p.bestseller);
export const trendingProducts = (): Product[] => getStoredProducts().filter((p) => p.trending);
export const newArrivals = (): Product[] => getStoredProducts().filter((p) => p.newArrival);
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const getProductsByCategory = (slug: string): Product[] =>
  getStoredProducts().filter((p) => p.categorySlug === slug);

export function getCategoriesWithCounts(): Category[] {
  const products = getStoredProducts();
  return CATEGORIES.map((c) => ({
    ...c,
    productCount: products.filter((p) => p.categorySlug === c.slug).length,
  }));
}

// Backward compatibility
export const CATEGORIES_COMPAT = CATEGORIES;


