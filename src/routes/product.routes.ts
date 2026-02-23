import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
} from "../controllers/product.controller";

const router = Router();

router.get("/all", getAllProducts);
router.get("/:publicId", getProductById);
router.post("/", createProduct); // Later protect with admin middleware

export default router;
