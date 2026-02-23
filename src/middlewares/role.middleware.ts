import { Response, NextFunction } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "./auth.middleware";

export const requireRole = (roles: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.publicId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const userRoles = await prisma.accountRole.findMany({
        where: { accountPublicId: req.publicId },
        include: { role: true },
      });

      const hasRole = userRoles.some((r) =>
        roles.includes(r.role.name)
      );

      if (!hasRole) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Role validation failed",
      });
    }
  };
};
