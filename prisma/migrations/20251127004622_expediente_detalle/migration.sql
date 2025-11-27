/*
  Warnings:

  - A unique constraint covering the columns `[citaId]` on the table `ExpedienteDetalle` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ExpedienteDetalle" ADD COLUMN     "citaId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ExpedienteDetalle_citaId_key" ON "ExpedienteDetalle"("citaId");

-- AddForeignKey
ALTER TABLE "ExpedienteDetalle" ADD CONSTRAINT "ExpedienteDetalle_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita"("id") ON DELETE SET NULL ON UPDATE CASCADE;
