-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'USUARIO';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
