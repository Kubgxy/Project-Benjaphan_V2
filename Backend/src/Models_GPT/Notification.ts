import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  type: {
    type: String,
    enum: ['order', 'cancel', 'message', 'stock', 'promotion', 'system'],
    required: true
  },
  title: { type: String, required: true },       // เพิ่มหัวข้อหลัก เช่น "New Order Received"
  message: { type: String, required: true },     // รายละเอียด เช่น "Order #1234 has been placed..."
  link: { type: String },                        // เช่น "/dashboard/orders/1234"
  isRead: { type: Boolean, default: false },
}, { collection: 'Notifications', timestamps: true });

export default mongoose.model('Notification', notificationSchema);
