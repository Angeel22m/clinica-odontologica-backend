/*
  Warnings:

  - The values [ADMINISTRADOR] on the enum `Puesto` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Puesto_new" AS ENUM ('DOCTOR', 'RECEPCIONISTA', 'ADMIN', 'OTRO');
ALTER TABLE "Empleado" ALTER COLUMN "puesto" TYPE "Puesto_new" USING ("puesto"::text::"Puesto_new");
ALTER TYPE "Puesto" RENAME TO "Puesto_old";
ALTER TYPE "Puesto_new" RENAME TO "Puesto";
DROP TYPE "public"."Puesto_old";
COMMIT;
