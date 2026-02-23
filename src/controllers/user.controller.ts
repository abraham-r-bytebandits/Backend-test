import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middlewares/auth.middleware";
import { serialize } from "../utils/serialize";


export const getProfile = async (req: AuthRequest, res: Response) => {
  const account = await prisma.account.findUnique({
    where: { publicId: req.publicId },
    include: { profile: true },
  });

  if (!account) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(serialize(account));
};


export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, phone, dateOfBirth, gender, profileImage } =
    req.body;

  const profile = await prisma.customerProfile.upsert({
    where: { accountPublicId: req.publicId },
    update: {
      firstName,
      lastName,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      profileImage,
    },
    create: {
      accountPublicId: req.publicId!,
      firstName: firstName || "",
      lastName: lastName || "",
      phone: phone || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      profileImage: profileImage || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      accountPublicId: req.publicId,
      action: "PROFILE_UPDATE",
      entityType: "PROFILE",
      entityId: req.publicId!,
    },
  });

  res.json(profile);
};



export const deleteAccount = async (req: AuthRequest, res: Response) => {
  await prisma.account.update({
    where: { publicId: req.publicId },
    data: { deletedAt: new Date(), status: "DELETED" },
  });

  await prisma.auditLog.create({
    data: {
      accountPublicId: req.publicId,
      action: "ACCOUNT_DELETED",
      entityType: "ACCOUNT",
      entityId: req.publicId!,
    },
  });

  res.json({ message: "Account deleted successfully" });
};


export const getAddress = async (req: AuthRequest, res: Response) => {
  const account = await prisma.account.findUnique({
    where: { publicId: req.publicId },
    include: {
      addresses: {
        where: { isDefault: true },
        take: 1,
      },
    },
  });

  if (!account) {
    return res.status(404).json({ message: "User not found" });
  }

  const defaultAddress = account.addresses[0] || null;

  res.json(
    serialize({
      email: account.email,
      address: defaultAddress,
    })
  );
};
