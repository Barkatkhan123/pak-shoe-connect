import { PrismaClient, UserRole, VerificationStatus, SubscriptionTier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SherSha B2B Database Seeding...");

  // ── 1. Create Admin & Factory Suppliers ──
  const admin = await prisma.user.upsert({
    where: { phone: "+923000000001" },
    update: {
      email: "anamoontotrade@gmail.com",
      fullName: "Anamon Master Admin",
      role: UserRole.ADMIN,
    },
    create: {
      phone: "+923000000001",
      email: "anamoontotrade@gmail.com",
      fullName: "Anamon Master Admin",
      city: "Lahore",
      role: UserRole.ADMIN,
    },
  });

  const supplierUser1 = await prisma.user.upsert({
    where: { phone: "+923001234567" },
    update: {},
    create: {
      phone: "+923001234567",
      email: "sialkot.syndicate@shersha.pk",
      fullName: "Tariq Mahmood",
      city: "Sialkot",
      role: UserRole.SUPPLIER,
      supplierProfile: {
        create: {
          factoryName: "Sialkot Master Footwear Syndicate",
          ntnTaxNumber: "4198234-7",
          city: "Sialkot / Small Industrial Estate",
          address: "Plot 42-B, Industrial Estate, Daska Road, Sialkot",
          verificationStatus: VerificationStatus.VERIFIED,
          subscriptionTier: SubscriptionTier.GOLD_FACTORY,
          monthlyCapacity: 50000,
          responseRate: 99,
          avgReplyTime: "< 1.5 Hours",
          qualityStandards: ["ISO 9001:2015 QC", "SATRA Member", "Export Quality Grade A"],
          factoryImages: [
            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
          ],
          factoryVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-shoemaker-stitching-a-leather-shoe-42792-large.mp4",
        },
      },
    },
    include: { supplierProfile: true },
  });

  const supplierProfile1 = supplierUser1.supplierProfile!;

  // ── 2. Create Categories ──
  const peshawariCategory = await prisma.category.upsert({
    where: { slug: "men-peshawari" },
    update: {},
    create: {
      slug: "men-peshawari",
      name: "Peshawari & Traditional Footwear",
      nameUrdu: "پشاوری اور روایتی چپل",
      gender: "men",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    },
  });

  const formalCategory = await prisma.category.upsert({
    where: { slug: "men-formal" },
    update: {},
    create: {
      slug: "men-formal",
      name: "Men's Formal Oxford & Derby",
      nameUrdu: "مردانہ فارمل جوتے",
      gender: "men",
      image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800",
    },
  });

  // ── 3. Create Wholesale Product: Charsadda Classic ──
  const product1 = await prisma.product.upsert({
    where: { slug: "charsadda-classic-peshawari" },
    update: {},
    create: {
      slug: "charsadda-classic-peshawari",
      sku: "SHR-PSH-001",
      title: "Charsadda Traditional Double-Sole Peshawari Chappal",
      nameUrdu: "چارسدہ کلاسک ڈبل تلوہ پشاوری چپل",
      description:
        "Handcrafted in KP and finished in Sialkot with genuine full-grain cowhide leather, double tire-rubber slip-resistant sole, and high-tensile nylon stitching. Built for extreme durability and bulk commercial retail margins.",
      categoryId: peshawariCategory.id,
      supplierId: supplierProfile1.id,
      moq: 24,
      cartonQty: 24,
      leadTimeDays: "5-7 Days Dispatch",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
        "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800",
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800",
      ],
      videoUrls: [
        {
          id: "vid-1",
          title: "Product 360° Material & Sole Demo",
          url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-shoemaker-stitching-a-leather-shoe-42792-large.mp4",
          type: "demo",
          duration: "00:45",
          thumbnail: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
        },
        {
          id: "vid-2",
          title: "Sialkot Factory Floor Assembly Tour",
          url: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-shoe-manufacturing-process-42790-large.mp4",
          type: "factory",
          duration: "01:30",
          thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
        },
      ],
      specifications: {
        upperMaterial: "100% Full-Grain Cowhide Leather (1.8mm gauge)",
        soleMaterial: "Non-slip Recycled Tyre Rubber (Double Layered)",
        insole: "High-density EVA memory foam with arch support",
        stitching: "Waxed 3-ply heavy nylon bonded thread",
        origin: "Charsadda / Sialkot, Pakistan",
        weight: "850g per pair (Size 42)",
        cartonDimensions: "65cm x 45cm x 35cm (24 Pairs)",
        customBranding: "Embossed OEM insole branding available for orders > 120 pairs",
      },
      bulkPriceTiers: {
        create: [
          { minQty: 24, maxQty: 49, unitPrice: 1850.0, tierLabel: "Starter Wholesale" },
          { minQty: 50, maxQty: 199, unitPrice: 1650.0, tierLabel: "Dealer Batch" },
          { minQty: 200, maxQty: 499, unitPrice: 1450.0, tierLabel: "Wholesale Master" },
          { minQty: 500, maxQty: null, unitPrice: 1299.0, tierLabel: "Container Bulk" },
        ],
      },
      variants: {
        create: [
          // Black variants
          { colorName: "Onyx Black", colorHex: "#18181b", sizeEU: "39", sizeUK: "6", sizeUS: "7", availableStock: 120, variantSku: "SHR-PSH-001-BLK-39" },
          { colorName: "Onyx Black", colorHex: "#18181b", sizeEU: "40", sizeUK: "7", sizeUS: "8", availableStock: 180, variantSku: "SHR-PSH-001-BLK-40" },
          { colorName: "Onyx Black", colorHex: "#18181b", sizeEU: "41", sizeUK: "8", sizeUS: "9", availableStock: 240, variantSku: "SHR-PSH-001-BLK-41" },
          { colorName: "Onyx Black", colorHex: "#18181b", sizeEU: "42", sizeUK: "9", sizeUS: "10", availableStock: 260, variantSku: "SHR-PSH-001-BLK-42" },
          { colorName: "Onyx Black", colorHex: "#18181b", sizeEU: "43", sizeUK: "10", sizeUS: "11", availableStock: 210, variantSku: "SHR-PSH-001-BLK-43" },
          { colorName: "Onyx Black", colorHex: "#18181b", sizeEU: "44", sizeUK: "11", sizeUS: "12", availableStock: 90, variantSku: "SHR-PSH-001-BLK-44" },
          // Dark Brown variants
          { colorName: "Rich Havana Brown", colorHex: "#451a03", sizeEU: "41", sizeUK: "8", sizeUS: "9", availableStock: 150, variantSku: "SHR-PSH-001-BRN-41" },
          { colorName: "Rich Havana Brown", colorHex: "#451a03", sizeEU: "42", sizeUK: "9", sizeUS: "10", availableStock: 190, variantSku: "SHR-PSH-001-BRN-42" },
          { colorName: "Rich Havana Brown", colorHex: "#451a03", sizeEU: "43", sizeUK: "10", sizeUS: "11", availableStock: 140, variantSku: "SHR-PSH-001-BRN-43" },
          // Tan Mustard variants
          { colorName: "Mustard Tan", colorHex: "#d97706", sizeEU: "41", sizeUK: "8", sizeUS: "9", availableStock: 80, variantSku: "SHR-PSH-001-TAN-41" },
          { colorName: "Mustard Tan", colorHex: "#d97706", sizeEU: "42", sizeUK: "9", sizeUS: "10", availableStock: 110, variantSku: "SHR-PSH-001-TAN-42" },
        ],
      },
    },
  });

  // ── 4. Create Product Reviews ──
  await prisma.productReview.createMany({
    data: [
      {
        productId: product1.id,
        userId: admin.id,
        rating: 5,
        city: "Lahore / Anarkali Market",
        comment:
          "Ordered 5 master cartons (120 pairs) for our Anarkali retail outlet. Sole quality is authentic tire rubber, sold out in 14 days with great profit margin.",
        helpful: 18,
        isVerified: true,
      },
      {
        productId: product1.id,
        userId: admin.id,
        rating: 5,
        city: "Rawalpindi / Raja Bazaar",
        comment:
          "Packaging and sizing ratio was exact. Waxed thread stitching is top notch. Placing 10 carton repeat order next week.",
        helpful: 12,
        isVerified: true,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log(`Created Factory: ${supplierProfile1.factoryName}`);
  console.log(`Created Product: ${product1.title} with 11 SKU variants and 4 bulk price tiers.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
