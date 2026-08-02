import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MaintenanceService } from './maintenance.service';

async function main() {
  process.env.MAINTENANCE_JOBS_ENABLED = 'false';
  const target = process.argv[2] ?? 'all';
  if (!['orders', 'carts', 'sessions', 'all'].includes(target))
    throw new Error(
      'Usage: maintenance:run -- orders|carts|sessions|all [--dry-run]',
    );
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const result = await app
      .get(MaintenanceService)
      .run(
        target as 'orders' | 'carts' | 'sessions' | 'all',
        process.argv.includes('--dry-run'),
      );
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } finally {
    await app.close();
  }
}
void main();
