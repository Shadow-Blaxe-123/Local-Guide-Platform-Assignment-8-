/*
  Warnings:

  - Made the column `earnings` on table `guides` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "guides" ALTER COLUMN "earnings" SET NOT NULL;
