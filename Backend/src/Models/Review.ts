// import mongoose, { Schema, model, Document } from "mongoose";
// import { updateProductRating } from "../utils/updateProductRating";

// export interface IReview extends Document {
//   productId: mongoose.Types.ObjectId;  // 🔗 อ้างอิง Product จริง
//   userId: mongoose.Types.ObjectId;     // 🔐 อ้างอิงผู้ใช้ที่รีวิว
//   rating: number;                      // ⭐ คะแนน
//   comment: string;                     // 💬 คำรีวิว
// }

// const reviewSchema = new Schema<IReview>(
//   {
//     productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
//     userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     rating: { type: Number, required: true, min: 1, max: 5 },
//     comment: { type: String, required: false },
//   },
//   { collection: "Reviews", timestamps: true }
// );

// // ✅ post-save: เมื่อรีวิวถูกสร้าง
// reviewSchema.post("save", async function (doc) {
//     await updateProductRating(doc.productId);
// });
  
// // ✅ post-delete: เมื่อรีวิวถูกลบ
// reviewSchema.post("findOneAndDelete", async function (doc: any) {
//     if (doc) {
//         await updateProductRating(doc.productId);
//     }
// });

// const Review = model<IReview>("Review", reviewSchema);
// export default Review;
