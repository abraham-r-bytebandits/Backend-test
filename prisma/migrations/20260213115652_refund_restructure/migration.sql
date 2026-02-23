/*
  Warnings:

  - Added the required column `orderItemId` to the `Refund` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `refund` ADD COLUMN `orderItemId` BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX `Refund_orderItemId_idx` ON `Refund`(`orderItemId`);

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
