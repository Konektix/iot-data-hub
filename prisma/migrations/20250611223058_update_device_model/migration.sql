/*
  Warnings:

  - Added the required column `description` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;
