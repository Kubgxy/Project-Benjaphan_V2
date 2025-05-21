import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },       // ขนาด เช่น S, M, L
  quantity: { type: Number, default: 0 }        // จำนวน stock ในขนาดนี้
}, { _id: false });

const productSchema = new mongoose.Schema({
  id_product: {
    type: String,
    required: true,
    unique: true                                 // รหัสสินค้าเฉพาะ
  },
  name: { type: String, required: true },        // ชื่อสินค้า
  description: { type: String },                 // คำอธิบายย่อ
  details: [{ type: String }],                   // รายละเอียดเพิ่มเติม (array)

  category: { type: String, required: true },    // หมวดหมู่

  price: { type: Number, required: true },       // ราคาปกติ
  salePrice: { type: Number },                   // ราคาลด (ถ้ามี)
  discount: { type: Number },                    // ส่วนลด % (ถ้ามี)

  availableSizes: [sizeSchema],                  // ขนาด + จำนวนแยก

  images: [{ type: String }],                    // URL รูปสินค้า

  rating: { type: Number, default: 0 },          // ค่าเฉลี่ย rating
  reviews: { type: Number, default: 0 },         // จำนวนรีวิว (cache ไว้)

  isNewArrival: { type: Boolean, default: false },  // flag สินค้าใหม่
  isBestseller: { type: Boolean, default: false },  // flag ขายดี
  isOnSale: { type: Boolean, default: false },      // flag ลดราคา

  metaTitle: { type: String },                   // SEO title
  metaDescription: { type: String }              // SEO description
}, { collection: 'Products', timestamps: true });

// 💡 Virtual field → คำนวณ stock รวมจาก availableSizes
productSchema.virtual('stock').get(function () {
  if (!Array.isArray(this.availableSizes)) return 0;  // ✅ กัน null/undefined
  return this.availableSizes.reduce((sum, size) => sum + size.quantity, 0);
});


productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Product', productSchema);
