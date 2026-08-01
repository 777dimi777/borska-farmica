import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { AdminRole } from '../src/generated/prisma/enums';
import { AdminBootstrapService } from '../src/admin-auth/admin-bootstrap.service';
import { PasswordService } from '../src/admin-auth/password.service';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
function input() {
  const email = required('BOOTSTRAP_ADMIN_EMAIL');
  const password = required('BOOTSTRAP_ADMIN_PASSWORD');
  const firstName = required('BOOTSTRAP_ADMIN_FIRST_NAME');
  const lastName = required('BOOTSTRAP_ADMIN_LAST_NAME');
  const role = required('BOOTSTRAP_ADMIN_ROLE');
  if (!/^\S+@\S+\.\S+$/.test(email))
    throw new Error('BOOTSTRAP_ADMIN_EMAIL is invalid.');
  if (password.length < 12 || password.length > 128)
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD must contain 12-128 characters.');
  if (!Object.values(AdminRole).includes(role as AdminRole))
    throw new Error('BOOTSTRAP_ADMIN_ROLE must be ADMIN or SUPER_ADMIN.');
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.BOOTSTRAP_ADMIN_CONFIRM !== 'CREATE_ADMIN'
  )
    throw new Error(
      'Production bootstrap requires BOOTSTRAP_ADMIN_CONFIRM=CREATE_ADMIN.',
    );
  return { email, password, firstName, lastName, role: role as AdminRole };
}
async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: required('DATABASE_URL') }),
  });
  try {
    const result = await new AdminBootstrapService(
      prisma as never,
      new PasswordService(),
    ).create(input());
    console.log(
      result === 'created'
        ? 'Admin account created.'
        : 'Admin account already exists; no changes made.',
    );
  } finally {
    await prisma.$disconnect();
  }
}
void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Admin bootstrap failed.',
  );
  process.exitCode = 1;
});
