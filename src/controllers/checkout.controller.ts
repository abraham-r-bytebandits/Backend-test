import { RequestHandler } from "express"
import prisma from "../prisma/client"
import { sendMail } from "../utils/mailer"
import { generateOTP, hashToken } from "../utils/otp"
import { generateAccessToken, generateRefreshToken } from "../utils/jwt"
import crypto from "crypto"


export const startCheckout: RequestHandler = async (req, res) => {
  const { email } = req.body

  const authHeader = req.headers.authorization

  // ✅ If already logged in → skip OTP
  if (authHeader) {
    return res.json({ message: "User already logged in" })
  }

  let account = await prisma.account.findUnique({ where: { email } })

  const isNewUser = !account

  if (!account) {
    account = await prisma.account.create({
      data: {
        publicId: crypto.randomUUID(),
        email,
        username: email,
        status: "PENDING_VERIFICATION",
      },
    })

    const role = await prisma.role.findUnique({
      where: { name: "CUSTOMER" },
    })

    await prisma.accountRole.create({
      data: {
        accountPublicId: account.publicId,
        roleId: role!.id,
      },
    })
  }

  const otp = generateOTP()

  await prisma.emailVerification.create({
    data: {
      accountPublicId: account.publicId,
      email,
      tokenHash: hashToken(otp),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  })

  await sendMail(email, "Checkout OTP", `<h2>${otp}</h2>`)

  res.json({
    message: "OTP sent",
    isNewUser,
  })
}




export const verifyCheckoutOtp: RequestHandler = async (req, res) => {
  const { email, otp } = req.body

  const account = await prisma.account.findUnique({ where: { email } })
  if (!account) return res.status(400).json({ message: "Invalid email" })

  const hashedOtp = hashToken(otp)

  const record = await prisma.emailVerification.findFirst({
    where: {
      accountPublicId: account.publicId,
      tokenHash: hashedOtp,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  })

  if (!record) {
    return res.status(400).json({ message: "Invalid or expired OTP" })
  }

  await prisma.emailVerification.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  })

  await prisma.account.update({
    where: { id: account.id },
    data: {
      status: "ACTIVE",
      isEmailVerified: true,
    },
  })

  const accessToken = generateAccessToken(account.publicId)
  const refreshToken = generateRefreshToken(account.publicId)

  const refreshHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex")

  await prisma.session.create({
    data: {
      accountPublicId: account.publicId,
      refreshTokenHash: refreshHash,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      deviceName: "Checkout Login",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  res.json({ accessToken, refreshToken })
}

