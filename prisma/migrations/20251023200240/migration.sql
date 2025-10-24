/*
  Warnings:

  - You are about to drop the `Hello` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Hello";

-- CreateTable
CREATE TABLE "hello" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "hello_pkey" PRIMARY KEY ("id")
);
