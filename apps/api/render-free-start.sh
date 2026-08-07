#!/bin/sh
set -eu

cd /app/apps/api

echo "Applying database migrations..."
npx --no-install prisma migrate deploy

echo "Running idempotent production seed..."
node dist/prisma/seed.js

if [ "${BOOTSTRAP_ADMIN_CONFIRM:-}" = "CREATE_ADMIN" ]; then
  echo "Running requested production admin bootstrap..."
  node dist/prisma/admin-bootstrap.js
fi

exec node dist/src/main.js