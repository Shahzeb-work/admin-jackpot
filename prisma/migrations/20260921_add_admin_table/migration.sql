-- Adds the Admin table for admin-jackpot. Additive only; does not touch
-- any table owned by Jackpot-Next. Applied via `prisma db execute` (not
-- `prisma migrate deploy`) so it doesn't write into the shared
-- `_prisma_migrations` bookkeeping table that Jackpot-Next also uses.
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
