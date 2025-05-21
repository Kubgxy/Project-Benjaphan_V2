import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String },                  // ชื่อ snapshot ตอนสั่ง
  size: { type: String },
  quantity: { type: Number, default: 1 },
  priceAtPurchase: { type: Number },      // ราคาตอนซื้อ
  images: [{ type: String }]
}, { _id: false });

const shippingInfoSchema = new mongoose.Schema({
  Name: { type: String },             // ชื่อผู้รับ
  phone: { type: String },
  label: { type: String },            // เช่น "บ้าน", "ออฟฟิศ"
  addressLine: { type: String },
  city: { type: String },
  province: { type: String },
  postalCode: { type: String },
  country: { type: String, default: "Thailand" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],                // รายการสินค้า

  shippingInfo: shippingInfoSchema,        // ข้อมูลจัดส่ง

  payment: {                               // ข้อมูลการจ่ายเงิน
    method: { type: String, enum: ['COD', 'credit', 'online'], default: 'COD' },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    transactionId: { type: String },
    paidAt: { type: Date },
    slipImage: { type: String }
  }, default: {},

  orderStatus: {                           // สถานะออเดอร์
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryTracking: {                      // ข้อมูลขนส่ง
    trackingNumber: { type: String },
    carrier: { type: String },
    status: { type: String }
  },

  couponApplied: { type: String },         // โค้ดส่วนลดที่ใช้
  total: { type: Number },                 // ยอดรวมทั้งหมด (หลังส่วนลด, tax, etc.)

}, { collection: 'Orders', timestamps: true });                  // createdAt, updatedAt

export default mongoose.model('Order', orderSchema);
