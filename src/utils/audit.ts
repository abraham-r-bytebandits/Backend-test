import prisma from "../prisma/client";

export const createAuditLog = async ({
  accountId,
  action,
  entityType,
  entityId,
  oldData,
  newData,
  ipAddress,
  userAgent,
}: {
  accountId?: bigint;
  action: string;
  entityType: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}) => {
  await prisma.auditLog.create({
    data: {
      accountId,
      action,
      entityType,
      entityId,
      oldData,
      newData,
      ipAddress,
      userAgent,
    },
  });
};
