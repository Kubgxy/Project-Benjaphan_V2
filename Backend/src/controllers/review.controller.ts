import { Request, Response } from "express";
// import Review from "../Models/Review";
// import Product from "../Models/Product";

import Review from "../Models_GPT/Review";
import Product from "../Models_GPT/Product";

import mongoose from "mongoose";

// ✅ เพิ่มรีวิวใหม่ (หลายรอบได้)
export const addReview = async (req: Request, res: Response) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user?.userId;

    // ตรวจสอบว่า productId ถูกต้อง
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ message: "❌ Invalid productId format" });
      return
    }

    // ตรวจสอบว่าผลิตภัณฑ์มีจริง
    const productExists = await Product.findById(productId);
    if (!productExists) {
      res.status(404).json({ message: "❌ Product not found" });
      return
    }

    // ✅ สร้าง review ใหม่ (หลายรอบได้)
    const review = new Review({
      productId,
      userId,
      rating,
      comment,
    });
    await review.save();

    res.status(201).json({ message: "✅ เพิ่มรีวิวสำเร็จ", review });
  } catch (err) {
    console.error("❌ Error adding review:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
  }
};

// ✅ ดึงรีวิวทั้งหมดของสินค้า (แสดงทุกรอบ)
export const getReviewsByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1; // หน้าเริ่มต้นคือ 1
    const limit = parseInt(req.query.limit as string) || 5; // จำนวนรีวิวต่อหน้า (ค่าเริ่มต้น 5)
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId })
      .populate("userId", "firstName lastName avatar")
      .sort({ createdAt: -1 }) // เรียงจากล่าสุด
      .skip(skip) // ข้ามรีวิวตามหน้า
      .limit(limit); // จำกัดจำนวนรีวิวต่อหน้า

    const totalReviews = await Review.countDocuments({ productId }); // จำนวนรีวิวทั้งหมด

    res.status(200).json({
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("❌ Error fetching reviews:", err);
    res.status(500).json({ message: "ไม่สามารถดึงรีวิวได้", error: err });
  }
};

// ✅ ดึงคะแนนของ user สำหรับ product
export const getUserRating = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const userId = req.user?.userId;

  try {
    const review = await Review.findOne({ productId, userId });
    res.status(200).json({ rating: review ? review.rating : 0 });
  } catch (err) {
    console.error("❌ Error fetching user rating:", err);
    res.status(500).json({ message: "ไม่สามารถดึงคะแนนผู้ใช้ได้", error: err });
  }
};

// ✅ ดึงคะแนนเฉลี่ยของสินค้า
export const getAverageRating = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId });
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    res.status(200).json({ averageRating, totalReviews });
  } catch (err) {
    console.error("❌ Error calculating average rating:", err);
    res.status(500).json({ message: "ไม่สามารถคำนวณคะแนนเฉลี่ยได้", error: err });
  }
};

// ✅ ลบรีวิว
export const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({ message: "❌ Review not found" });
      return
    }
    if (String(review.userId) !== String(userId)) {
      res.status(403).json({ message: "❌ Unauthorized" });
      return
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({ message: "✅ ลบรีวิวสำเร็จ" });
  } catch (err) {
    console.error("❌ Error deleting review:", err);
    res.status(500).json({ message: "ไม่สามารถลบรีวิวได้", error: err });
  }
};
