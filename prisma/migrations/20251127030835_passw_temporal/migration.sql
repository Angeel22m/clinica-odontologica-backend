/*
  Warnings:

  - You are about to drop the column `citaId` on the `ExpedienteDetalle` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExpedienteDetalle" DROP CONSTRAINT "ExpedienteDetalle_citaId_fkey";

-- DropIndex
DROP INDEX "ExpedienteDetalle_citaId_key";

-- AlterTable
ALTER TABLE "ExpedienteDetalle" DROP COLUMN "citaId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordTemporalExpira" TIMESTAMP(3),
ADD COLUMN     "requierCambioPassword" BOOLEAN NOT NULL DEFAULT false;
