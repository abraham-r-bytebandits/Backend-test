/*
  Warnings:

  - The primary key for the `accountrole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `accountrole` table. All the data in the column will be lost.
  - You are about to drop the column `assignedBy` on the `accountrole` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `auditlog` table. All the data in the column will be lost.
  - You are about to alter the column `entityType` on the `auditlog` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.
  - You are about to drop the column `accountId` on the `authprovider` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `credential` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `customerprofile` table. All the data in the column will be lost.
  - The primary key for the `customerstats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `customerstats` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `emailverification` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountPublicId]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountPublicId]` on the table `CustomerProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountPublicId` to the `AccountRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountPublicId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountPublicId` to the `AuthProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountPublicId` to the `Credential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountPublicId` to the `CustomerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountPublicId` to the `CustomerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountPublicId` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountPublicId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `accountrole` DROP FOREIGN KEY `AccountRole_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `address` DROP FOREIGN KEY `Address_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `auditlog` DROP FOREIGN KEY `AuditLog_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `authprovider` DROP FOREIGN KEY `AuthProvider_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `credential` DROP FOREIGN KEY `Credential_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `customerprofile` DROP FOREIGN KEY `CustomerProfile_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `customerstats` DROP FOREIGN KEY `CustomerStats_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `emailverification` DROP FOREIGN KEY `EmailVerification_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_accountId_fkey`;

-- DropIndex
DROP INDEX `Address_accountId_isDefault_idx` ON `address`;

-- DropIndex
DROP INDEX `AuditLog_accountId_createdAt_idx` ON `auditlog`;

-- DropIndex
DROP INDEX `Credential_accountId_key` ON `credential`;

-- DropIndex
DROP INDEX `CustomerProfile_accountId_key` ON `customerprofile`;

-- DropIndex
DROP INDEX `Session_accountId_revokedAt_idx` ON `session`;

-- AlterTable
ALTER TABLE `accountrole` DROP PRIMARY KEY,
    DROP COLUMN `accountId`,
    DROP COLUMN `assignedBy`,
    ADD COLUMN `accountPublicId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`accountPublicId`, `roleId`);

-- AlterTable
ALTER TABLE `address` DROP COLUMN `accountId`,
    ADD COLUMN `accountPublicId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `auditlog` DROP COLUMN `accountId`,
    ADD COLUMN `accountPublicId` VARCHAR(191) NULL,
    MODIFY `entityType` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `authprovider` DROP COLUMN `accountId`,
    ADD COLUMN `accountPublicId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `credential` DROP COLUMN `accountId`,
    ADD COLUMN `accountPublicId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `customerprofile` DROP COLUMN `accountId`,
    ADD COLUMN `accountPublicId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `customerstats` DROP PRIMARY KEY,
    DROP COLUMN `accountId`,
    ADD COLUMN `accountPublicId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`accountPublicId`);

-- AlterTable
ALTER TABLE `emailverification` DROP COLUMN `accountId`,
    ADD COLUMN `accountPublicId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `session` DROP COLUMN `accountId`,
    ADD COLUMN `accountPublicId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Address_accountPublicId_isDefault_idx` ON `Address`(`accountPublicId`, `isDefault`);

-- CreateIndex
CREATE UNIQUE INDEX `Credential_accountPublicId_key` ON `Credential`(`accountPublicId`);

-- CreateIndex
CREATE UNIQUE INDEX `CustomerProfile_accountPublicId_key` ON `CustomerProfile`(`accountPublicId`);

-- CreateIndex
CREATE INDEX `Session_accountPublicId_revokedAt_idx` ON `Session`(`accountPublicId`, `revokedAt`);

-- AddForeignKey
ALTER TABLE `Credential` ADD CONSTRAINT `Credential_accountPublicId_fkey` FOREIGN KEY (`accountPublicId`) REFERENCES `Account`(`publicId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuthProvider` ADD CONSTRAINT `AuthProvider_accountPublicId_fkey` FOREIGN KEY (`accountPublicId`) REFERENCES `Account`(`publicId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_accountPublicId_fkey` FOREIGN KEY (`accountPublicId`) REFERENCES `Account`(`publicId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailVerification` ADD CONSTRAINT `EmailVerification_accountPublicId_fkey` FOREIGN KEY (`accountPublicId`) REFERENCES `Account`(`publicId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountRole` ADD CONSTRAINT `AccountRole_accountPublicId_fkey` FOREIGN KEY (`accountPublicId`) REFERENCES `Account`(`publicId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerProfile` ADD CONSTRAINT `CustomerProfile_accountPublicId_fkey` FOREIGN KEY (`accountPublicId`) REFERENCES `Account`(`publicId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_accountPublicId_fkey` FOREIGN KEY (`accountPublicId`) REFERENCES `Account`(`publicId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerStats` ADD CONSTRAINT `CustomerStats_accountPublicId_fkey` FOREIGN KEY (`accountPublicId`) REFERENCES `Account`(`publicId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_accountPublicId_fkey` FOREIGN KEY (`accountPublicId`) REFERENCES `Account`(`publicId`) ON DELETE SET NULL ON UPDATE CASCADE;
