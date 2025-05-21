import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true                           // ต้องมี product
  },
  name: { type: String },  // ✅ snapshot name
  images: [{ type: String }],               // รูปภาพ snapshot ตอนหยิบเข้าตะกร้า
  size: { type: String },                   // ไซส์ที่เลือก เช่น S, M, L
  quantity: { type: Number, default: 1 },   // จำนวนที่เลือก
  priceAtAdded: { type: Number },           // ราคา ณ เวลาหยิบเข้าตะกร้า (กันราคาถูกแก้ภายหลัง)
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true                            // หนึ่ง user มีหนึ่ง cart
  },
  items: [cartItemSchema],                  // สินค้าในตะกร้า (array)
  promotionApplied: { type: String },       // โค้ดโปรโมชั่นที่ใช้ (เช่น COUPON2025)
  updatedAt: { type: Date, default: Date.now } // เวลาอัปเดตล่าสุด
}, { collection: 'Cart', timestamps: true });                   // createdAt, updatedAt

export default mongoose.model('Cart', cartSchema);
