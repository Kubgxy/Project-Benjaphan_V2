// middlewares/pageUpload.middleware.ts
import multer from "multer";
import path from "path";
import fs from "fs";

// 📦 สร้าง dynamic storage ขึ้นกับ req.body.page หรือ req.query.page
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const page = req.body.page || req.query.page || "general";
    const uploadDir = `uploads/pages/${page}`;

    // ถ้าโฟลเดอร์ยังไม่มีให้สร้างก่อน
    fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// ✅ filter: อนุญาตเฉพาะภาพ
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const pageUpload = multer({ storage, fileFilter });
