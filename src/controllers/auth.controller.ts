import prisma from "../prisma/client";
import bcrypt from "bcryptjs";
import { generateOTP, hashToken } from "../utils/otp";
import { sendMail } from "../utils/mailer";
import { Request, Response } from "express";
import { serialize } from "../utils/serialize";

export const signup = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone ||
      !line1 ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await prisma.account.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
   
      const account = await tx.account.create({
        data: {
          publicId: crypto.randomUUID(),
          email,
          username: email,
          status: "PENDING_VERIFICATION",
          isEmailVerified: false,
          credential: {
            create: {
              passwordHash: hashedPassword,
            },
          },
          profile: {
            create: {
              firstName,
              lastName,
              phone,
            },
          },
          addresses: {
            create: {
              fullName: `${firstName} ${lastName}`,
              phone,
              line1,
              line2,
              city,
              state,
              postalCode,
              country,
              isDefault: true,
            },
          },
        },
      });

      const customerRole = await tx.role.findUnique({
        where: { name: "CUSTOMER" },
      });

      if (!customerRole) {
        throw new Error("CUSTOMER role not found");
      }

      await tx.accountRole.create({
  data: {
    accountPublicId: account.publicId,
    roleId: customerRole.id,
  },
});

      

      
      const otp = generateOTP();
      const tokenHash = hashToken(otp);

      await tx.emailVerification.create({
        data: {
          accountPublicId: account.publicId,
          email,
          tokenHash,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      
      await tx.auditLog.create({
        data: {
          accountPublicId: account.publicId,
          action: "SIGNUP",
          entityType: "ACCOUNT",
          entityId: account.publicId,
           ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
        },
      });

    
      await sendMail(
        email,
        "Verify Your Account",
        `<h2>Your OTP is ${otp}</h2>`
      );
    });

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ message: "Signup failed" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const account = await prisma.account.findUnique({ where: { email } });

  if (!account) return res.status(400).json({ message: "Invalid email" });

  const hashedOtp = hashToken(otp);

  const record = await prisma.emailVerification.findFirst({
    where: {
      accountPublicId: account.publicId,
      tokenHash: hashedOtp,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  await prisma.emailVerification.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  await prisma.account.update({
    where: { id: account.id },
    data: {
      isEmailVerified: true,
      status: "ACTIVE",
    },
  });
  await prisma.auditLog.create({
  data: {
    accountPublicId: account.publicId,
    action: "EMAIL_VERIFIED",
    entityType: "ACCOUNT",
    entityId: account.publicId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  },
});


  res.json({ message: "Account verified successfully" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const account = await prisma.account.findUnique({ where: { email } });

  if (!account) {
    return res.status(400).json({ message: "Enter correct email address" });
  }

  const otp = generateOTP();
  const hashed = hashToken(otp);

  await prisma.emailVerification.create({
    data: {
      accountPublicId: account.publicId,
      email,
      tokenHash: hashed,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendMail(email, "Reset Password OTP", `<h2>${otp}</h2>`);

  res.json({ message: "OTP sent" });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  const account = await prisma.account.findUnique({ where: { email } });
  if (!account) return res.status(400).json({ message: "Invalid email" });

  const hashedOtp = hashToken(otp);

  const record = await prisma.emailVerification.findFirst({
    where: {
      accountPublicId: account.publicId,
      tokenHash: hashedOtp,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  await prisma.auditLog.create({
  data: {
    accountPublicId: account.publicId,
    action: "PASSWORD_RESET",
    entityType: "ACCOUNT",
    entityId: account.publicId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  },
});


  if (!record)
    return res.status(400).json({ message: "Invalid or expired OTP" });

  const newHashed = await bcrypt.hash(newPassword, 10);

  await prisma.credential.update({
    where: { accountPublicId: account.publicId },
    data: {
      passwordHash: newHashed,
      passwordChangedAt: new Date(),
    },
  });

  await prisma.emailVerification.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  res.json({ message: "Password updated successfully" });
};

import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import crypto from "crypto";

export const login = async (req: Request, res: Response) => {
  const { email, password, remember } = req.body;

  const account = await prisma.account.findUnique({
    where: { email },
    include: { credential: true },
  });

  if (!account || !account.credential) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  if (account.status !== "ACTIVE") {
    return res.status(403).json({ message: "Account not active" });
  }

  const valid = await bcrypt.compare(
    password,
    account.credential.passwordHash
  );

  if (!valid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(account.publicId);
const refreshToken = generateRefreshToken(account.publicId);


  const refreshHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (remember ? 7 : 1));

  await prisma.session.create({
    data: {
      accountPublicId: account.publicId,
      refreshTokenHash: refreshHash,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      deviceName: req.headers["sec-ch-ua"]?.toString() || "Unknown Device",
      expiresAt,
    },
  });

  await prisma.auditLog.create({
  data: {
    accountPublicId: account.publicId,
    action: "LOGIN",
    entityType: "ACCOUNT",
    entityId: account.publicId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  },
});


  res.json({
    accessToken,
    refreshToken,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const hashed = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const session = await prisma.session.findFirst({
    where: {
      refreshTokenHash: hashed,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!session) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  const accessToken = generateAccessToken(session.accountPublicId);

  res.json({ accessToken });
};


export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const hashed = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const session = await prisma.session.findFirst({
    where: { refreshTokenHash: hashed },
  });

  if (!session) {
    return res.status(400).json({ message: "Session not found" });
  }

  await prisma.session.updateMany({
    where: { refreshTokenHash: hashed },
    data: { revokedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      accountPublicId: session.accountPublicId,
      action: "LOGOUT",
      entityType: "ACCOUNT",
      entityId: session.accountPublicId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });

  res.json({ message: "Logged out" });
};



import axios from "axios";
import { AuthRequest } from "../middlewares/auth.middleware";

export const googleAuth = async (req: Request, res: Response) => {
  const { credential } = req.body;

  const googleRes = await axios.get(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
  );

  const { email, sub } = googleRes.data;

  let account = await prisma.account.findUnique({
    where: { email },
  });

  
  if (account && account.status === "DELETED") {
    await prisma.account.delete({
      where: { publicId: account.publicId },
    });

    account = null;
  }


  if (!account) {
    account = await prisma.$transaction(async (tx) => {
   const newAccount = await tx.account.create({
  data: {
    publicId: crypto.randomUUID(),
    email,
    username: email,
    status: "ACTIVE",
    isEmailVerified: true,
    profile: {
      create: {
        firstName: googleRes.data.given_name || "",
        lastName: googleRes.data.family_name || "",
        profileImage: googleRes.data.picture || null,
      },
    },
  },
});


      const customerRole = await tx.role.findUnique({
        where: { name: "CUSTOMER" },
      });

      if (customerRole) {
        await tx.accountRole.create({
          data: {
            accountPublicId: newAccount.publicId,
            roleId: customerRole.id,
          },
        });
      }

      await tx.authProvider.create({
        data: {
          accountPublicId: newAccount.publicId,
          provider: "GOOGLE",
          providerUserId: sub,
        },
      });

      return newAccount;
    });
  } else {
   

    const existingProvider = await prisma.authProvider.findFirst({
      where: {
        accountPublicId: account.publicId,
        provider: "GOOGLE",
      },
    });

    if (!existingProvider) {
      await prisma.authProvider.create({
        data: {
          accountPublicId: account.publicId,
          provider: "GOOGLE",
          providerUserId: sub,
        },
      });
    }
  }

  const accessToken = generateAccessToken(account.publicId);
  const refreshToken = generateRefreshToken(account.publicId);

  res.json({ accessToken, refreshToken });
};



export const guestCheckout = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      items,
    } = req.body;

    await prisma.guestCheckout.create({
      data: {
        fullName,
        email,
        phone,
        line1: address,          
        city,
        state,
        postalCode: zipCode,     
        country,
      },
    });

    res.json({ message: "Guest checkout stored successfully" });
  } catch (error) {
    console.error("GUEST CHECKOUT ERROR:", error);
    res.status(500).json({ message: "Guest checkout failed" });
  }
};


export const getMe = async (req: AuthRequest, res: Response) => {
  const account = await prisma.account.findUnique({
    where: { publicId: req.publicId },
    include: {
      profile: true,
      addresses: true,
    },
  });

  if (!account) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(serialize(account));
};
