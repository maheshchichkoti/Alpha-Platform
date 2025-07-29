import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Clean up existing data to make the script idempotent
  await prisma.campaign.deleteMany();

  console.log("Old data cleaned. Seeding new data...");

  const campaign = await prisma.campaign.create({
    data: {
      name: "Q3 2025 Outbound",
      status: "active",
      companies: {
        create: {
          name: "Acme Corporation",
          // THIS IS THE FIX: Change "acme.com" to a full URL
          domain: "https://acme.com",
          people: {
            create: [
              {
                fullName: "Alice Smith",
                email: "alice@acme.com",
                title: "CEO",
              },
              {
                fullName: "Bob Johnson",
                email: "bob@acme.com",
                title: "CTO",
              },
            ],
          },
        },
      },
    },
    include: {
      companies: {
        include: {
          people: true,
        },
      },
    },
  });

  console.log("Seeding finished.");
  console.log(`Seeded ${campaign.companies.length} company and its people.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
