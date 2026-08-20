import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function setAdminCredentials() {
  const adminEmail = "anamoontotrade@gmail.com";
  const adminPhone = "+923000000001";
  const adminPassword = "Anamon12&1marcH2007";
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  console.log("Setting Admin credentials in Hostinger MySQL...");
  console.log("Email:", adminEmail);
  console.log("Phone:", adminPhone);
  console.log("Password:", adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      phone: adminPhone,
      passwordHash: passwordHash,
      role: UserRole.ADMIN,
      fullName: "Anamon Master Admin",
      city: "Lahore",
      isActive: true,
    },
    create: {
      email: adminEmail,
      phone: adminPhone,
      passwordHash: passwordHash,
      role: UserRole.ADMIN,
      fullName: "Anamon Master Admin",
      city: "Lahore",
      isActive: true,
    },
  });

  console.log("✅ Admin user set successfully in database:");
  console.log({
    id: admin.id,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
    fullName: admin.fullName,
    isActive: admin.isActive,
    hasPasswordHash: !!admin.passwordHash,
  });

  const isMatch = bcrypt.compareSync(adminPassword, admin.passwordHash);
  console.log("Password verification match:", isMatch);

  await prisma.$disconnect();
}

setAdminCredentials().catch((e) => {
  console.error("Error setting admin credentials:", e);
  process.exit(1);
});
