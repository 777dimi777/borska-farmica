import { Prisma } from '../generated/prisma/client';

export function isRetryableTransactionError(
  error: unknown,
  includeUniqueConflict = false,
) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code === 'P2034') return true;
  if (includeUniqueConflict && error.code === 'P2002') return true;
  return (
    error.code === 'P2010' &&
    /(40001|could not serialize access|TransactionWriteConflict)/i.test(
      error.message,
    )
  );
}
