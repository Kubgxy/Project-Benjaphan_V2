import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,                       // ห้ามซ้ำ เช่น COUPON2025
    uppercase: true                     // เก็บเป็นตัวใหญ่ทั้งหมด
  },
  description: { type: String },        // รายละเอียดสั้น ๆ
  
  discountType: {
    type: String,
    enum: ['fixed', 'percent'],         // ส่วนลดเป็นจำนวนเงินหรือ %
    required: true
  },
  discountValue: { type: Number, required: true }, // ค่า discount เช่น 100 บาท หรือ 10%

  expiryDate: { type: Date },           // วันหมดอายุ
  usageLimit: { type: Number },         // จำกัดจำนวนครั้งที่ใช้ได้
  usedCount: { type: Number, default: 0 }, // จำนวนครั้งที่ถูกใช้ไปแล้ว
  
  minSpend: { type: Number, default: 0 },   // ยอดซื้อขั้นต่ำ
  
  isActive: { type: Boolean, default: true } // เปิดปิดคูปอง
}, { collection: 'Coupons', timestamps: true });                   // createdAt, updatedAt

export default mongoose.model('Coupon', couponSchema);
