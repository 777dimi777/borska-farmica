import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { seedFarmCatalog } from './farm-catalog';

const categories = [
  { name: 'Mlečni proizvodi', slug: 'mlecni-proizvodi', sortOrder: 1 },
  { name: 'Voće', slug: 'voce', sortOrder: 2 },
  { name: 'Povrće', slug: 'povrce', sortOrder: 3 },
  { name: 'Rakija', slug: 'rakija', sortOrder: 4 },
  { name: 'Jaja', slug: 'jaja', sortOrder: 5 },
  { name: 'Stajsko đubrivo', slug: 'stajsko-djubrivo', sortOrder: 6 },
] as const;
const pickupLocations = [
  {
    code: 'FARM_HOME',
    name: 'Borska Farmica',
    address: 'Nade Dimić 30, Bor',
    instructions:
      'Odmah ispod Stovarišta Našković. Tačan termin preuzimanja potvrđujemo telefonom.',
    allowedWeekday: null,
    sortOrder: 0,
  },
  {
    code: 'BOR_CITY_MARKET',
    name: 'Gradska pijaca Bor',
    address: 'Gradska pijaca Bor',
    instructions:
      'Preuzimanje je moguće subotom. Tačan termin potvrđujemo telefonom.',
    allowedWeekday: 6,
    sortOrder: 1,
  },
] as const;
async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error('DATABASE_URL is required to seed the database');
  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    await prisma.$transaction(
      categories.map((category) =>
        prisma.category.upsert({
          where: { slug: category.slug },
          update: {
            name: category.name,
            isActive: true,
            sortOrder: category.sortOrder,
          },
          create: { ...category, isActive: true },
        }),
      ),
    );
    await prisma.$transaction(
      pickupLocations.map((location) =>
        prisma.pickupLocation.upsert({
          where: { code: location.code },
          update: { ...location, isActive: true },
          create: { ...location, isActive: true },
        }),
      ),
    );
    console.log(
      `Seeded ${categories.length} product categories and ${pickupLocations.length} pickup locations.`,
    );
    if (process.env.SEED_DEMO_CATALOG === 'true') {
      const count = await seedFarmCatalog(prisma);
      console.log(`Seeded ${count} farm products with local images.`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
void main().catch((error: unknown) => {
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  console.error(`Database seed failed (${errorName}).`);
  process.exitCode = 1;
});
