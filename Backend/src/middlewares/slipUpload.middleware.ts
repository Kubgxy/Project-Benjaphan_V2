import multer from 'multer';
import path from 'path';
import fs from 'fs';

const slipDir = path.join(__dirname, '../../uploads/slips');

// ✅ เช็กและสร้างโฟลเดอร์ถ้าไม่มี
if (!fs.existsSync(slipDir)) {
  fs.mkdirSync(slipDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, slipDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const slipUpload = multer({ storage });
