import prisma from "../prisma/client";

export const createAuditLog = async ({
  accountPublicId,
  action,
  entityType,
  entityId,
  oldData,
  newData,
  ipAddress,
  userAgent,
}: {
  accountPublicId?: string;
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
      accountPublicId,
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
