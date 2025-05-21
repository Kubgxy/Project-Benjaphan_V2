import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
// import Product from "../Models/Product";
import Product from "../Models_GPT/Product"; // Model

// ✅ Helper: แปลง boolean string เป็น boolean
const toBoolean = (value: any) => value === "true" || value === true;

// ✅ Helper: แปลงเป็น array ถ้าไม่ใช่ array
const toArray = (value: any) => (Array.isArray(value) ? value : [value]);

// ✅ List ของ field ที่อนุญาตให้อัปเดต
const allowedFields = [
  "id_product",
  "name",
  "category",
  "price",
  "salePrice",
  "discount",
  "description",
  "details",
  "rating",
  "reviews",
  "isNewArrival",
  "isBestseller",
  "isOnSale",
  "availableSizes",
  "metaTitle",
  "metaDescription",
];

// ✅ ใช้กับทั้ง Add และ Update
const prepareProductData = (body: any, images: string[] = []) => {
  const productData: any = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      if (
        ["price", "salePrice", "discount", "rating", "reviews"].includes(field)
      ) {
        const num = Number(body[field]);
        if (Number.isNaN(num))
          throw new Error(`${field} must be a valid number`);
        productData[field] = num;
      } else if (field === "details") {
        const detailArr =
          typeof body[field] === "string"
            ? JSON.parse(body[field])
            : toArray(body[field]);
        if (!Array.isArray(detailArr))
          throw new Error("Details must be an array");
        productData[field] = detailArr.map((item: any) => item.toString());
      } else if (field === "availableSizes") {
        let sizes;
        try {
          sizes =
            typeof body[field] === "string"
              ? JSON.parse(body[field])
              : body[field];
        } catch {
          throw new Error("availableSizes must be a valid JSON array");
        }

        if (!Array.isArray(sizes))
          throw new Error("availableSizes must be an array");

        productData[field] = sizes.map((sizeObj: any) => {
          if (!sizeObj.size || sizeObj.quantity === undefined) {
            throw new Error(
              "Each availableSizes item must have size and quantity"
            );
          }
          return {
            size: sizeObj.size,
            quantity: Number(sizeObj.quantity),
          };
        });
      } else if (["isNewArrival", "isBestseller", "isOnSale"].includes(field)) {
        productData[field] = toBoolean(body[field]);
      } else {
        productData[field] = body[field];
      }
    }
  });

  if (images.length > 0) {
    productData.images = images;
  }

  return productData;
};

// ✅ Get all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const products = await Product.find().lean({ virtuals: true });
    res
      .status(200)
      .json({ message: "Products fetched successfully", products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get product by id_product
export const getProductById = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const id = req.params.id?.trim();
  try {
    const product = await Product.findOne({
      id_product: { $regex: new RegExp(`^${id}$`, "i") },
    }).lean({ virtuals: true });
    
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({ message: "Product fetched successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Add product + Validate + Upload images
export const addProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    id_product,
    name,
    category,
    price,
    description,
    details,
    availableSizes,
  } = req.body;

  console.log("req.body", req.body);
  console.log("req.files", req.files);

  if (
    !id_product ||
    !name ||
    !category ||
    !price ||
    !description ||
    !details ||
    !availableSizes
  ) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const images = ((req.files as Express.Multer.File[]) || []).map(
      (file) => `/uploads/products/${file.filename}`
    );
    const productData = prepareProductData(req.body, images);

    const existing = await Product.findOne({ id_product });
    if (existing) {
      res.status(400).json({ message: "id_product already exists" });
      return;
    }

    const product = await Product.create(productData);
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Invalid input", error });
  }
};

// ✅ Update product + Validate + คงรูปเดิมถ้าไม่ได้ upload ใหม่
export const updateProduct = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const images = ((req.files as Express.Multer.File[]) || []).map(
      (file) => `/uploads/products/${file.filename}`
    );
    const existingProduct = await Product.findOne({ id_product: id });
    if (!existingProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // ✅ 1. ดึง existingImages จาก req.body (เป็น JSON string)
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : existingProduct.images; // fallback ถ้าไม่ได้ส่งมา

    // ✅ 2. รวมรูปเดิม + รูปใหม่เข้าด้วยกัน
    const combinedImages = [...existingImages, ...images];

    // ✅ 3. ส่งรวมเข้าไปใน prepareProductData
    const updateData = prepareProductData(req.body, combinedImages);

    if (
      updateData.id_product &&
      updateData.id_product !== existingProduct.id_product
    ) {
      res.status(400).json({ message: "Cannot change id_product" });
      return;
    }

    const product = await Product.findOneAndUpdate(
      { id_product: id },
      updateData,
      { new: true }
    );
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid product _id" });
      return;
    }
    const product = await Product.findOneAndDelete({ _id: id });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get new products
export const getNewProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isNewArrival: true }).limit(3);
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get Bestsellers Products
export const getBestsellerProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isBestseller: true });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
