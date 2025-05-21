import { Request, Response, NextFunction } from "express";
  
export const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 🟢 เช็คว่ามี req.user มาจาก verifyToken หรือเปล่า
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    // 🟢 เช็ค role ว่าเป็น 'admin' หรือเปล่า
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: "Forbidden: Admin access only" });
      return;
    }

    // ✅ ผ่านเงื่อนไข → ไปต่อ
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
