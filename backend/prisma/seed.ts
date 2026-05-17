import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
    await prisma.asset.createMany({
        data: [
            {
                name: "Bitcoin",
                symbol: "BTC"
            },
            {
                name: "Solana",
                symbol: "SOL"
            },
            {
                name: "US Dollar",
                symbol: "USD"
            }
        ],
        skipDuplicates: true,
    })
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });