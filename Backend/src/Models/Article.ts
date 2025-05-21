// import mongoose, { Schema, Document } from "mongoose";
// import slugify from "slugify"; // 🟢 ใช้สำหรับสร้าง slug อัตโนมัติ

// export interface IArticle extends Document {
//   title: string;
//   slug: string;
//   excerpt: string;
//   content: string;
//   thumbnail: string;
//   contentImages?: string[];
//   tags?: string[];
//   category?: string;
//   metaDescription?: string;
//   author: mongoose.Types.ObjectId;
//   views: number;
//   isPublished: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const ArticleSchema: Schema = new Schema(
//   {
//     title: { type: String, required: true },
//     slug: { type: String, unique: true }, // 🟢 slug ต้อง unique!
//     excerpt: { type: String, required: true },
//     content: { type: String, required: true },
//     thumbnail: { type: String, required: true },        // 🟢 main thumbnail
//     contentImages: { type: [String], default: [] },     // 🟢 รูปในเนื้อหา
//     tags: { type: [String], default: [] },
//     category: { type: String },
//     metaDescription: { type: String }, // 🟢 สำหรับ SEO
//     author: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     views: { type: Number, default: 0 },
//     isPublished: { type: Boolean, default: false },
//   },
//   { timestamps: true , collection: 'Articles' }
// );

// // 🟡 Pre-save hook สำหรับสร้าง slug อัตโนมัติจาก title
// ArticleSchema.pre<IArticle>("save", function (next) {
//   if (!this.slug && this.title) {
//     this.slug = slugify(this.title, { lower: true, strict: true });
//   }
//   next();
// });

// export default mongoose.model<IArticle>("Article", ArticleSchema);
