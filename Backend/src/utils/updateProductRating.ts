import Review from "../Models_GPT/Review";
import Product from "../Models_GPT/Product";
import mongoose from "mongoose";

export const updateProductRating = async (productId: mongoose.Types.ObjectId | string) => {
  // 1. ดึงรีวิวทั้งหมดของสินค้านั้น
  const reviews = await Review.find({ productId });

  // 2. นับจำนวนรีวิวทั้งหมด
  const totalReviews = reviews.length;

  // 3. คำนวณค่าเฉลี่ยของคะแนน (ถ้าไม่มีรีวิวเลย → ให้ avg เป็น 0)
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  // 4. อัปเดต field ใน Product ให้ตรงกับข้อมูลจริง
  await Product.findByIdAndUpdate(productId, {
    rating: avgRating,
    reviews: totalReviews,
  });
};
