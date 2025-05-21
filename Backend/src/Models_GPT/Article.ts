import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify"; // ใช้สำหรับสร้าง slug อัตโนมัติ

// TypeScript interface → ช่วยให้ type-safe ฝั่ง backend
export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  contentImages?: string[];
  tags?: string[];
  category?: string;
  metaDescription?: string;
  author: mongoose.Types.ObjectId;
  views: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true }, // slug ต้อง unique!
    excerpt: { type: String, required: true }, // summary ย่อ (แสดงหน้า list)
    content: { type: String, required: true }, // เนื้อหาเต็ม (markdown, rich text)
    thumbnail: { type: String, required: true }, // main thumbnail
    contentImages: { type: [String], default: [] }, // รูปที่อยู่ในเนื้อหา (optional)
    tags: { type: [String], default: [] }, // array ของ tag
    category: { type: String }, // หมวดหมู่
    metaDescription: { type: String }, // สำหรับ SEO
    author: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ref ผู้เขียน
    views: { type: Number, default: 0 }, // จำนวนการดู
    isPublished: { type: Boolean, default: false } // draft/published status
  },
  { timestamps: true, collection: "Articles" }
);

// 💡 Pre-validate hook → สร้าง slug อัตโนมัติจาก title
ArticleSchema.pre<IArticle>("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// 💡 เพิ่ม index สำหรับ query/filter เร็วขึ้น
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ isPublished: 1 });
ArticleSchema.index({ createdAt: -1 }); // จัดเรียงบทความใหม่-เก่าเร็ว

export default mongoose.model<IArticle>("Article", ArticleSchema);
