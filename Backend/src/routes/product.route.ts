import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getNewProducts,
  getBestsellerProducts
} from "../controllers/product.controller";

// ✅ Middleware
import { verifyToken } from "../middlewares/verifyToken";
import { verifyAdmin } from "../middlewares/verifyAdmin";
import { productUpload } from "../middlewares/productUpload.middleware"; 

const product = Router();

// 🟢 Get all products (ไม่ต้อง login ก็เรียกดูได้)
product.get("/getAllProducts", getAllProducts);

// 🟢 Get product by id_product (ไม่ต้อง login ก็เรียกดูได้)
product.get("/getOneProducts/:id", getProductById);

// 🟢 Add product (admin เท่านั้น + รองรับ upload รูป)
product.post(
  "/addProducts",
  verifyToken,                    // ✅ ต้อง login ก่อน
  verifyAdmin,                    // ✅ ต้องเป็น admin
  productUpload.array("images", 5), // ✅ รองรับอัปโหลดหลายรูป field name = "images"
  addProduct
);

// 🟢 Update product by id_product (admin เท่านั้น + รองรับ upload รูป)
product.patch(
  "/updateProducts/:id",
  verifyToken,
  verifyAdmin,
  productUpload.array("images", 5), // ✅ รองรับอัปโหลดหลายรูป (ถ้ามี)
  updateProduct
);

// 🟢 Delete product by id_product (admin เท่านั้น)
product.delete(
  "/delProducts/:id",
  verifyToken,
  verifyAdmin,
  deleteProduct
);

// Get New Products (ไม่ต้อง login ก็เรียกดูได้)
product.get("/getNewProducts", getNewProducts);

// Get Bestsellers Products (ไม่ต้อง login ก็เรียกดูได้)
product.get("/getBestsellerProducts", getBestsellerProducts);

export default product;


