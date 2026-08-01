import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma/client';

const categories = [
  { name: 'Mlečni proizvodi', slug: 'mlecni-proizvodi', sortOrder: 1 },
  { name: 'Voće', slug: 'voce', sortOrder: 2 },
  { name: 'Povrće', slug: 'povrce', sortOrder: 3 },
  { name: 'Rakija', slug: 'rakija', sortOrder: 4 },
  { name: 'Jaja', slug: 'jaja', sortOrder: 5 },
  { name: 'Stajsko đubrivo', slug: 'stajsko-djubrivo', sortOrder: 6 },
] as const;

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to seed the database');
  }

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
          create: {
            ...category,
            isActive: true,
          },
        }),
      ),
    );

    console.log(`Seeded ${categories.length} product categories.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  console.error(`Category seed failed (${errorName}).`);
  process.exitCode = 1;
});
