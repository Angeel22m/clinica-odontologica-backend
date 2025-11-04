/*
  Warnings:

  - You are about to drop the column `url` on the `ExpedienteArchivo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storageName]` on the table `ExpedienteArchivo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `filePath` to the `ExpedienteArchivo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageName` to the `ExpedienteArchivo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExpedienteArchivo" DROP COLUMN "url",
ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "storageName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ExpedienteArchivo_storageName_key" ON "ExpedienteArchivo"("storageName");
