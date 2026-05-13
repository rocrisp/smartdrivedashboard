import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Note: In a real application, you would create test users here
  // However, since we're using Google OAuth, users are created on sign-in
  // This seed file can be extended to add sample data for testing

  console.log("✅ Database seeded successfully!");
  console.log("📝 Note: Users are created automatically when signing in with Google OAuth");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
