import { Request, Response } from "express";
import prisma from "../prisma/client";
import { serialize } from "../utils/serialize";

/* ---------------- GET ALL PRODUCTS ---------------- */

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(serialize(products));
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/* ---------------- GET SINGLE PRODUCT ---------------- */

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;

    const product = await prisma.product.findUnique({
      where: { publicId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(serialize(product));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/* ---------------- CREATE PRODUCT (ADMIN) ---------------- */

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        stock,
        imageUrl,
      },
    });

    res.status(201).json(serialize(product));
  } catch (error) {
    res.status(500).json({ message: "Product creation failed" });
  }
};
