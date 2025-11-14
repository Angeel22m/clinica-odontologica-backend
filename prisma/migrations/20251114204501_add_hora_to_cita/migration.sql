/*
  Warnings:

  - A unique constraint covering the columns `[fecha,doctorId,hora]` on the table `Cita` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "HorarioLaboral" AS ENUM ('H08_00', 'H08_30', 'H09_00', 'H09_30', 'H10_00', 'H10_30', 'H11_00', 'H11_30', 'H13_00', 'H13_30', 'H14_00', 'H14_30', 'H15_00', 'H15_30', 'H16_00', 'H16_30');

-- DropIndex
DROP INDEX "public"."Cita_fecha_doctorId_key";

-- AlterTable
ALTER TABLE "Cita" ADD COLUMN     "hora" TEXT NOT NULL DEFAULT '08:00';

-- CreateIndex
CREATE UNIQUE INDEX "Cita_fecha_doctorId_hora_key" ON "Cita"("fecha", "doctorId", "hora");
