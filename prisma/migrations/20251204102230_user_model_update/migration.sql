/*
  Warnings:

  - The `travelPreferences` column on the `tourists` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tourists" DROP COLUMN "travelPreferences",
ADD COLUMN     "travelPreferences" TEXT[];
