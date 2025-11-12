-- DropIndex
DROP INDEX "public"."Persona_dni_key";

-- AlterTable
ALTER TABLE "Persona" ALTER COLUMN "dni" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
